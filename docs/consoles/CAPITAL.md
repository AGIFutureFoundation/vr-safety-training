# CAPITAL — Baton Rouge broken into districts, plus Hammond (`cap`, port 9003)

Brief: `$SP/louisiana/wave-brief.md` (section CAPITAL, the shared rules, the geography rule), the facts file
`$SP/louisiana/la-facts.md` (the only source for facts), the reactor loop (`$SP/packs/packs-brief-3.md`). Base c0883a3.

## What was built

Pure-literal parish modules written once by `tools/gen_cap_capital.py` from approximate public lon/lat through one north-up
uniform scale per map (x east, +z south); the modules are the source afterwards. Water and road layout checked against
Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026; `$SP/geo/s2view.py`, scenes 2026-09-23; no
imagery committed, no figure read off the image).

| map | id | region | scale (real m per map m) | sites | connectors |
|---|---|---|---|---|---|
| Baton Rouge — Downtown & Riverfront | `br-downtown-riverfront` | louisiana-cities | 1.5 | 18 | 2 |
| Baton Rouge — North River Industry Corridor | `br-north-industrial` | louisiana-cities | 1.5 | 16 | 2 |

- **Facts.** No city growth figure is stated anywhere. Every site layout is the platform's illustration and the blurbs and a
  sign landmark say "the site layouts are illustrative; the river, streets and places are real". The north corridor names only
  public roads, the river, the levees and the Huey P. Long Bridge; no private plant is named or part of any lesson. No
  partnership with any employer or union is claimed; union tags come from `tools/unions.json`.
- **Regions.** The three Louisiana rows are added to `NP_REGIONS` exactly as the wave brief gives them (before Programme
  Worlds, which stay last), to `check_parish_data`'s region list, and `louisiana-cities` / `louisiana-sites` rows to
  `PA_REGION_CHARACTERS`.
- **Strict engine.** All four CAPITAL map ids are listed in `NP_ENGINE_STRICT` (a listed id with no module is harmless).

## Seams

- `NP_BR_DOWNTOWN_RIVERFRONT`, `NP_BR_NORTH_INDUSTRIAL` in `WebXR/shared/np-parishes.js` (registry) and `tools/bundle_webxr.py`
  (both bundle lists).
- Paired walk-through connectors across the downtown / north seam at lat 30.4777: `cap-bd-interstate-one-ten-north` ↔
  `cap-bn-interstate-one-ten-south`, `cap-bd-river-road-north` ↔ `cap-bn-river-road-south`.

## Cycles

1. Reason: the maps must match real geography, not memory. Act: one Sentinel-2 view of both Baton Rouge boxes. Observed: the
   river is narrower than drawn and bends west at the north edge, I-110 swings east at the Capitol, the Highway One-Ninety
   bridge crosses at the corridor's middle → river polygons, levees, River Road, I-110 and the bridge re-drawn from the image.
2. Reason: both Baton Rouge maps validate on the schema. Act: check_parish_data. Observed: 20 fail (no field lessons or gated
   items, too few water bodies and levees, connector far ends null, docs) → lessons, gated items, Capitol Lake and procedural
   canals, a west bank levee, far ends from the neighbour's frame → 6 fail, all docs/parishes.md.
3. Reason: engine geometry and budgets for both maps. Act: check_parishes. Observed: 37711 passed, 3 failed (docs scale x2,
   the Louisiana regions sat after Programme Worlds) → regions moved before Programme Worlds.
