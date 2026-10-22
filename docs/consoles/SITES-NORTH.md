# SITES-NORTH — three inland / river Louisiana project maps (`ln`, port 9002)

Brief: `$SP/louisiana/wave-brief.md` (section SITES-NORTH), the facts file `$SP/louisiana/la-facts.md` (the only source for
project facts), the shared rules in `$SP/packs/packs-brief.md` and the reactor loop in `$SP/packs/packs-brief-3.md`. Base c0883a3.
Site ids published at `$SP/louisiana/sites-north-ids.md`.

## What was built

| project (facts file) | map id | where | scale | sites |
|---|---|---|---|---|
| Meta data center, Richland Parish | `la-meta-richland` | farmland on Interstate Twenty and US Highway Eighty near Holly Ridge | 4 real metres | 18 |
| Applied Digital "Delta Forge 1", Rapides Parish | `la-delta-forge-rapides` | the Red River's bend at Boyce, Interstate Forty-Nine, Louisiana Highway One | 3 real metres | 17 |
| Shintech expansion, Iberville Parish | `la-shintech-plaquemine` | the Mississippi's bend at Plaquemine, Bayou Plaquemine and the lock, Louisiana Highway One | 3 real metres | 17 |

- **Generator** `tools/gen_ln_sites.mjs` writes the three pure-literal modules once (`WebXR/shared/np-data-la-*.js`); the modules
  are the source afterwards. Anchors are lon/lat (three decimals, `approximate: true`) pushed through one north-up uniform
  projection, so the fit is exact to rounding. Levees are offset from the river centre line by a helper so they never cross it.
- **Real geography, checked.** The river, levee and road layout of each map was checked against Copernicus Sentinel-2 imagery
  (the coordinator's `s2view.py`, three calls; images kept in `$SP/louisiana/`, not committed). The first draft was wrong at
  Plaquemine (the river was drawn running straight north–south; the image shows the bend wrapping the town's north and east) and
  at Boyce (the river now runs from the north-west around the town to the east, with its old oxbow; the interstate follows the
  south-west bank); Richland's two highways were moved onto the image's lines. Every module header carries the Sentinel-2
  attribution line. No figure was read off the imagery and no visible private facility is named or described.
- **Illustrative project layouts.** Every map's blurb, module header and a sign landmark say "the project layout is
  illustrative; the parish, waterways and towns are real". Features that are not real named places say "procedural" or
  "illustrative" in their names. None of the maps is `representative` (they are real places), so HARVEST keeps its spots.
- **Facts.** Project figures appear only in the module headers, in the facts file's words, with its sources; blurbs and lessons
  carry no digits. "Trade reference" only: no partnership, no employer programme, no hiring claim; Shintech's process is never
  described (process safety awareness from catalog stations only).
- **Crafts.** Each project draws on well over three `tools/unions.json` crafts (IBEW, IUOE, LIUNA, Ironworkers, UA, SMART,
  Insulators, OPCMIA, Carpenters, Teamsters, CWA, SPFPA, IAFF, ILA, SIU, Boilermakers, IUPAT, URW, SMART-TD, BMWED and more).
  Every site carries two to four existing catalog stations; kinds are existing kinds only (no new IX / TY rows needed).
- **Registry and shared tables.** `np-parishes.js`: the three maps and the `louisiana-sites` region row (exactly the brief's row,
  placed before Programme Worlds, which must stay last). The `louisiana-cities` and `new-orleans-districts` rows are left to the
  consoles whose maps use them (an empty region fails the atlas checks). `pa-palette-data.js`: a `louisiana-sites`
  PA_REGION_CHARACTERS row. `check_parishes.mjs`: the three ids in `NP_ENGINE_STRICT`. `check_parish_data.mjs`: the three
  Louisiana region ids are known. `tools/bundle_webxr.py`: the three modules in both bundle lists. Home card counts
  (`WebXR/index.html`, `WebXR/home.html`). `exports/shared/holodeck-shared.json` rebuilt (627.3 → 658.8 KiB of 768).
- **HARVEST** (`hv-harvest.js`): Louisiana maps outside the five parishes now use the Louisiana family (Louisiana species and
  the Louisiana Department of Wildlife and Fisheries), not the California default; stormwater ponds are not fishing water; an
  inland lake on a development-site map is fresh water (fish and gator watch, no crab or shrimp). Result: Boyce has Red River
  and oxbow fishing, gator watch and a rice-and-crawfish field; Plaquemine has Mississippi and Bayou Plaquemine fishing, crab,
  gator watch and a rice-and-crawfish field; Richland has none (its only waters are procedural). No other map's spots changed.

## Seams

- `NP_LA_META_RICHLAND`, `NP_LA_DELTA_FORGE_RAPIDES`, `NP_LA_SHINTECH_PLAQUEMINE` (parish schema), registered in `NP_PARISHES`.
- Fixed site ids for LA-PROGRAMME: `lmr-site-grading`, `lmr-duct-bank-crew`, `lmr-substation-build`, `lmr-data-hall-fitout`,
  `lmr-cooling-plant`; `ldf-site-grading`, `ldf-steel-erection`, `ldf-electrical-room`, `ldf-network-cabling`,
  `ldf-cooling-plant`; `lsp-process-unit-build`, `lsp-pipe-rack-crew`, `lsp-control-room`, `lsp-river-dock`, `lsp-tank-farm`
  (all present, plus the extras listed in the ids file).
- `HV_LOUISIANA_REGIONS` in `hv-harvest.js`: the regions HARVEST treats as Louisiana waters.
- Connectors are pending ways out (no neighbouring map): Interstate Twenty toward Rayville/Monroe and Delhi, Interstate
  Forty-Nine toward Natchitoches and Alexandria, Louisiana Highway One north toward Port Allen/Baton Rouge and south.

## Cycles

1. Reason: no map may overlap another and the ids must be public by minute 15. Act: `npBounds` of all 25 maps (scratch
   ln_bounds.mjs), ids file published. Observed: no Louisiana map near the three frames; ids published at 09:11.
2. Reason: the three maps written, registered and valid on the schema. Act: gen_ln_sites.mjs, check_parish_data. Observed: 9
   fails, all docs (map ids and connectors unlisted) → docs/parishes.md section → 20013 pass, 0 fail.
3. Reason: imagery became reachable; the layout should match it. Act: three Sentinel-2 views. Observed: Plaquemine's and Boyce's
   rivers were wrong in shape and orientation, Richland's highways ~0.6 km off → re-laid all three; probe: every site dry, flat,
   off the levees; check_parish_data still 0 fail.
4. Reason: strict engine and the map rules. Act: check_parishes. Observed: 8 fails — docs scale wording, Richland relief (no crest
   ≥ 3 m on the sample grid), Programme Worlds no longer last, three modules missing from the bundle → fixed; worst high tier
   135 meshes / 62868 triangles (la-meta-richland), budget 260 / 400000.
5. Reason: the wider checkers read every map. Act: check_palette, check_walkable, check_tycoon, check_interiors, check_npc,
   check_bridge. Observed: palette 21 fails and walkable 1 (empty regions in the atlas; no palette row) → region rows trimmed,
   palette row added → 0; npc 1 (Richland placed two characters) → the bayou survey site is kind `wetland` → 0; bridge 2 (stale
   export) → export rebuilt → 86/86.
6. Reason: real Louisiana places keep their hidden play, with Louisiana species. Act: HARVEST family, stormwater and inland-lake
   rules; check_harvest and a before/after spot diff. Observed: 87 passed, 0 failed; only the three new maps' spots changed.
7. Reason: final state holds. Act: check_parishes, check_parish_data, check_tycoon, check_interiors, check_npc, check_walkable.
   Observed: 39035 passed, 0 failed; 20013 pass, 0 fail; 6796/0; 532/0; 0 NPC problems; 1797/0.

## Left

- `eval_worlds` not run (machine shared; run once at the gate).
- The rebuilt dist bundles (`WebXR/dist/`) and gen_treasures for the three maps (the play layer and the coordinator regenerate).
- Paired connectors once CAPITAL / ACADIANA maps exist nearby (none of their announced maps meets these three fields).
- The shared export is at 658.8 of 768 KiB after three maps; with eight consoles adding maps it will need watching.
- Richland has no HARVEST spots (its bayou is procedural); a named real waterway there would need a verified position.
