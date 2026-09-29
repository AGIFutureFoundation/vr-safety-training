# CAPITAL — Baton Rouge broken into districts, plus Hammond (`cap`, port 9003)

Brief: `$SP/louisiana/wave-brief.md` (section CAPITAL, the shared rules, the geography rule), the facts file
`$SP/louisiana/la-facts.md` (the only source for facts), the reactor loop (`$SP/packs/packs-brief-3.md`). Base c0883a3.

## What was built

Four strict-engine 4096 m maps as pure-literal parish modules, written once by `tools/gen_cap_capital.py` from approximate
public lon/lat through one north-up uniform scale per map (x east, +z south); the modules are the source afterwards. Water
and road layout of the three Baton Rouge-area maps checked against Copernicus Sentinel-2 imagery (Contains modified
Copernicus Sentinel data 2026; `$SP/geo/s2view.py`, three calls; no imagery committed, no figure read off the image). The
Hammond view came back empty (coverage 0), so Hammond is laid out from general geography only and its header says so.

| map | id | region | scale (real m per map m) | sites | connectors | worst high-tier meshes / triangles |
|---|---|---|---|---|---|---|
| Baton Rouge — Downtown & Riverfront | `br-downtown-riverfront` | louisiana-cities | 1.5 | 18 | 2 (paired) | 137 / 83082 |
| Baton Rouge — North River Industry Corridor | `br-north-industrial` | louisiana-cities | 1.5 | 16 | 2 (paired) | 146 / 79384 |
| RiverPlex MegaPark — Ascension Parish West Bank | `br-riverplex-ascension` | louisiana-sites | 3.5 | 16 | 2 (pending) | 125 / 80738 |
| Hammond — Downtown & the Interstates | `hammond-downtown` | louisiana-cities | 2 | 16 | 2 (pending) | 133 / 80914 |

Every map has 3 field lessons (`cap-*-fl-*`, catalog K-12 and trade stations), 2 gated side quests, 3+ crafts per site
area from `tools/unions.json`, named roads, districts, levees and a sign landmark.

- **Facts.** No city growth figure anywhere; Hammond is a place only. RiverPlex says only the file's words ("about 17,000
  acres with 10 miles of river frontage", businessreport.com; ascensionedc.com); no investor is named. Every site layout is
  illustrative and the blurbs, headers and sign landmarks say "the project layout is illustrative; the parish, waterways and
  towns are real" (or, on the city districts, "the site layouts are illustrative; the river, streets and places are real").
  The north corridor names only public roads, the river, the levees and the Huey P. Long Bridge; no private plant is named
  or part of any lesson. No partnership with any employer, agency or union is claimed.
- **Regions.** `louisiana-sites` and `louisiana-cities` rows added to `NP_REGIONS` exactly as the wave brief gives them
  (before Programme Worlds, which stay last). `new-orleans-districts` is NOT in `NP_REGIONS` here (no map of that region in
  this tree — check_walkable's atlas needs every region to have a map); NOLA-DISTRICTS adds it with its maps.
  `check_parish_data` accepts all three; `PA_REGION_CHARACTERS` has rows for all three.
- **Strict engine.** All four ids are in `NP_ENGINE_STRICT` (check_parishes).
- **Hidden play.** `hvFamily` (hv-harvest.js) now treats the three Louisiana regions as the New Orleans family (Louisiana
  species and agency, gator watch on bayous and canals, the rice-and-crawfish field). The field is skipped on street-scale
  city districts (declared scale under 1.8), so downtown Baton Rouge and the north corridor get fishing only; RiverPlex and
  Hammond get the field. check_harvest: 105 spots on 23 maps (was 96 on 21).

## Seams

- `NP_BR_DOWNTOWN_RIVERFRONT`, `NP_BR_NORTH_INDUSTRIAL`, `NP_BR_RIVERPLEX_ASCENSION`, `NP_HAMMOND_DOWNTOWN` in
  `WebXR/shared/np-parishes.js` and both bundle lists in `tools/bundle_webxr.py`.
- Paired walk-through connectors across the downtown / north seam (lat 30.4777): `cap-bd-interstate-one-ten-north` ↔
  `cap-bn-interstate-one-ten-south`, `cap-bd-river-road-north` ↔ `cap-bn-river-road-south`.
- Pending ways out (no map yet): `cap-br-highway-one-north-west` → `iberville-west-bank`, `cap-br-highway-seventy-east` →
  `ascension-east-bank`, `cap-ha-interstate-twelve-west` → `livingston-interstate-twelve`, `cap-ha-interstate-fifty-five-south`
  → `tangipahoa-south`. SITES-NORTH's `la-shintech-plaquemine` lies well north of RiverPlex (no shared edge), so no pair.
- LA-PROGRAMME: the fixed ids `brd-workforce-centre`, `brd-riverfront-crane-work`, `brn-turnaround-staging`,
  `brn-pipe-fab-shop`, `brr-site-clearing`, `brr-rail-spur`, `brr-river-dock`, `ham-workforce-centre` all resolve in this
  tree; the full list is in `$SP/louisiana/capital-ids.md`.

## Cycles

1. Reason: the maps must match real geography, not memory. Act: one Sentinel-2 view of both Baton Rouge boxes. Observed: the
   river is narrower than drawn and bends west at the north edge, I-110 swings east above the Capitol, the Highway One-Ninety
   bridge crosses mid-corridor → river polygons, levees, River Road, I-110 and the bridge re-drawn from the image.
2. Reason: both Baton Rouge maps validate on the schema. Act: check_parish_data. Observed: 20 fail (no field lessons or gated
   items, too few water bodies and levees, connector far ends null, docs) → lessons, gated items, Capitol Lake and procedural
   canals, a west bank levee, far ends written from the neighbour's frame → 6 fail, all docs/parishes.md.
3. Reason: engine geometry and budgets for both maps. Act: check_parishes. Observed: 37711 passed, 3 failed (docs scale x2,
   the Louisiana regions sat after Programme Worlds) → regions moved before Programme Worlds; committed.
4. Reason: RiverPlex and Hammond from the imagery (RiverPlex view: the bend, Donaldsonville, Bayou Lafourche; Hammond view
   empty). Act: check_parish_data. Observed: 8 fail (RiverPlex anchors had four decimals) → rounded to three → docs only.
5. Reason: engine geometry for the two new maps. Act: check_parishes. Observed: 40245 passed, 8 failed (river dock and water
   intake in the river; Hammond's relief lacked a levee crest; docs scale x4) → sites moved inland of River Road, the canal
   banks raised, the docs/parishes.md section written → 40253 passed, 0 failed; check_parish_data 20448 pass, 0 fail.
6. Reason: the wider checkers read every map. Act: check_interiors, check_tycoon, check_palette, check_walkable, check_harvest,
   check_npc, check_parish_play, check_motorworks, check_bridge one at a time. Observed: palette 7 fail (no
   new-orleans-districts row) and walkable 1 fail (atlas: a region with no map) → PA row added, that region left to
   NOLA-DISTRICTS; bridge 2 fail (stale shared export) → export_shared re-run, 663.5 of 768 KiB; harvest gave the Louisiana
   maps bay species → hvFamily extended. All green.
7. Reason: the home card must count the new maps. Act: gen_home. Observed: "… 1 site area · 3 districts · … 554 job sites";
   check_home 1 fail = WebXR/dist/index.html stale (the coordinator's bundle rebuild).

## Left

- `WebXR/dist/` rebuild (`python3 tools/bundle_webxr.py`) — check_home's only failure; left to the coordinator's gate.
- Shared export budget: four maps cost ~36 KiB (627 → 663.5 of 768 KiB); ~20 Louisiana maps across the wave will exceed it
  unless the export trims per-map payload.
- Hammond against imagery (the Sentinel-2 view returned no scene); gen_treasures for the four maps (play layer);
  UNIONSIMS/LA-PROGRAMME simulations placed on the fixed sites.
