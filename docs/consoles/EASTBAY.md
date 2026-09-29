# EASTBAY — more of the Bay Area on the parish engine (`eb`, 8963)

Review & neighbourhoods wave. Three new 4096 m maps on the strict parish engine, written once by a scratch generator
(`$SP/packs/eastbay/gen_eb.mjs`, BAYMAP's projection and clipping) from approximate public lon/lat through one north-up
uniform scale of two real metres per map metre; the modules are the source of truth afterwards. Places are named, never
described with figures; site names and crews are procedural training places.

## Plan

| map | id | region | box (approx.) | neighbours |
|---|---|---|---|---|
| Emeryville & Berkeley's Waterfront | `oak-emeryville-berkeley` | `oakland` | lat 37.829–37.903, lon -122.337…-122.243 | `oak-west-oakland` (San Pablo Avenue), `bay-san-pablo` (San Pablo Avenue, the Eastshore Freeway) |
| Downtown San Jose | `bay-san-jose` | `south-bay` (new, "South Bay") | lat 37.298–37.372, lon -121.936…-121.844 | none yet: two ways out to maps not built (the Peninsula, Santa Clara) |
| San Pablo & Richmond's Shore | `bay-san-pablo` | `north-east-bay` (new, "North East Bay") | lat 37.898–37.972, lon -122.392…-122.298 | `oak-emeryville-berkeley` |

Region choice for `bay-san-pablo`: **`north-east-bay`**. San Pablo and Richmond are Contra Costa County cities on San
Pablo Bay, not Oakland districts; the `oakland` region's convention (and check_parishes) is `oak-` ids with BAYMAP's
`bm-` connectors and a Bay World way; and a separate region leaves room for the rest of the San Pablo Bay shore. The
incoming Bay Program maps are clear of all three boxes: `bp-strip-marsh-east` lies on San Pablo Bay along Highway 37,
far north of 37.972; `bp-san-leandro-bay` lies south of Oakland, far south of 37.829.

Hills (coordinator): the Berkeley Hills' western edge and Albany Hill in Emeryville & Berkeley; the Point Richmond
hills and the El Cerrito hills' foot in San Pablo & Richmond; none in Downtown San Jose (the field is flat — relief
comes from the Guadalupe River's flood walls). Each `center` is projected from its approximate lon/lat through the
map's own fit; heights are schematic.

EPA facts (only as worded in `$SP/epa/epa-2026-facts.md`): the City of San Jose's green stormwater infrastructure
implementation plan and the City of San Pablo's green stormwater infrastructure (to capture and treat stormwater
runoff) are named projects of the EPA's San Francisco Bay Program awards — each told once, in a procedural stormwater
crew's blurb, with no amount.

## Cycles

1. Reason: the three modules exist, are registered with the two new regions, and pass the data checker — proof:
   `node tools/check_parish_data.mjs` last line with 16 parishes and 0 failed. Observe: first run 18 fail (one levee
   short, one gated item each, two site ids already used by oak-downtown-lake and sf-golden-gate-park, docs); fixed in
   the generator; then San Pablo still one levee short (1 fail); after a Point Isabel shore wall: `check_parish_data:
   16 parishes, 356 sites, 1477 station references resolved, 145 landmarks, 58 connectors, 133 anchors, 59 field
   lessons, 32 gated items — 13415 checks pass, 0 fail`.
2. Reason: the three maps are held strict by the engine (fit, ground, chunks, budgets, hills clear) — proof:
   `node tools/check_parishes.mjs` last line 0 failed with the new maps listed. Observe: `check_parishes: 23031
   passed, 0 failed (16 parishes: … oak-emeryville-berkeley 13 sites, 8 roads, 9 districts, 3 connectors;
   bay-san-pablo 13 sites, 7 roads, 7 districts, 2 connectors; bay-san-jose 13 sites, 8 roads, 9 districts, 2
   connectors)`; worst chunk builds high tier 134 / 130 / 130 meshes, 56657 / 80107 / 67182 triangles.
3. Reason: docs/parishes.md table and connectors, home card counts by region, bundler lists — proof: check_parish_data
   docs lines pass; home card count matches gen_home's formula. Observe: `node tools/gen_home.mjs` changes one line —
   `5 parishes · 5 districts · 4 districts · 1 district · 1 district · 356 job sites`; `check_home` fails only on
   "WebXR/dist/index.html is stale — run python3 tools/bundle_webxr.py" (the dist bundles are the coordinator's gate).
4. Reason: the consoles that iterate every map accept the new three — proof: check_storyline, check_cognition,
   check_tycoon, check_npc, check_drills, check_cityworks, check_terraform last lines. Observe: check_storyline 19 failed
   (no side stories for the new path × map pairs, st-stories-data.js stale) and check_cognition 4 failed (gen_cg_units
   stale, no K-12 lesson placed in the new maps); regenerated with `node tools/gen_st_stories.mjs` and
   `node tools/gen_cg_units.mjs` → `7 paths · 271 side stories over 96 path × map pairs · 542 branches · 4426 checks ·
   0 failed`, `check_cognition: 347 passed, 0 failed`; `check_tycoon: 4552 passed, 0 failed — 5 businesses, 10 crew,
   16 maps`; check_npc prints its summary with no failure; `All drills checks pass.`; `check_cityworks: 2903 checks, 0
   failed`; `check_terraform: 195392 checks, 0 failed`.
5. Reason: each new map boots in the real page at desktop and 390×844 with its region title and no page error —
   proof: a headless walk on port 8963 (`$SP/packs/eastbay/walk.mjs`, three.js served from `WebXR/vendor/`). Observe:
   the first two runs never booted (cdnjs blocked, then my abort route shadowed the vendored-three route); after fixing
   the route order: "Emeryville & Berkeley's Waterfront — Oakland & East Bay Districts", "San Pablo & Richmond's Shore —
   North East Bay Districts", "Downtown San Jose — South Bay Districts", canvas drawn, HUD "Sites 1/13 · Lessons 0/3",
   no page errors (only the source layout's missing `media/backgrounds.json`, pre-existing), 14–23 s to settle under
   swiftshader with other consoles running.
6. Reason: the ASSAYER rubric scores the new maps — proof: `node tools/eval_worlds.mjs`. Observe: `eval_worlds: 21
   subjects, mean 98, 14 findings`; each new map 97 (loads 2/2, legible 9/9, resolves 63/63 · 60/60 · 62/62,
   completable 4/5, budget 6/6, facts 35/35 · 32/32 · 35/35) — the one point missing is the same as every Oakland map
   and three SF maps: "the play layer offers three or more field lessons (0)" (SECONDLINE → BAYOU). No before-run at
   the base was taken (the 18 existing subjects are untouched by this change).

## Seams

- `NP_REGIONS` gains `south-bay` and `north-east-bay` (np-parishes.js); check_parish_data's `ND_REGIONS` follows.
- Landmark `kind`s are plain words (`tower`, `station`, `pier`, `park`, `hill`, `shore`, `place`); LANDMARKS' `lmBuild`
  draws any that match its registry, else the engine's generic shape.
