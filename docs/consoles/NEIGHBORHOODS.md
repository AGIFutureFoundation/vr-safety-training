# NEIGHBORHOODS — more San Francisco, walkable (`sn`, 8962)

SmartCiti.X Powered by AGI Corp — the review & neighbourhoods wave. Three new San Francisco districts on the parish
engine (region `san-francisco`, strict engine), drawn at a walkable scale (one or about one real metre per map
metre, so the 4096 m field is the walk), each with twelve or more sites on real catalog stations, named hills placed
from their approximate lon/lat, named landmarks, and connectors paired in the parishes' convention (docs/parishes.md).

## What the bounds said (the Mission Bay question)

`npBounds(sf-mission)` is lon −122.459 … −122.357, lat 37.722 … 37.804: SoMa and Mission Bay lie wholly inside it,
and sf-mission already holds the King Street rail yard, a Mission Bay construction site and the China Basin stadium
district. So `sf-mission-bay` is not built; the third district is **the Sunset & Ocean Beach south**
(`sf-sunset-south`), below the existing fields' 37.722° edge on the ocean side and west of the incoming
`sf-outer-mission` (TIDELANDS), which lies south of sf-mission's 37.722° edge.

The existing five SF fields are coarse (about two real metres per map metre, nine-kilometre boxes) and between them
already cover all of the city north of 37.722° — their boxes overlap each other by kilometres, as the parishes do.
A walkable North Beach or Haight/Castro therefore necessarily lies inside a coarse field. The overlap rule is held
as: the walkable fields never overlap each other; none reaches into the incoming sf-outer-mission's area (south of
37.722°, east of −122.459°) beyond a connector margin; and against the coarse fields no new job site duplicates a
coarse site (none within a pad's reach on the ground). `check_parishes` prints each line.

## Plan

- `sf-north-beach` — North Beach, Chinatown & Fisherman's Wharf: Telegraph Hill, Russian Hill and Nob Hill; the
  wharf's fishing fleet and a pier shed; the Powell and Hyde cable-car lines and their turntables; a school; the
  restaurant row on Columbus Avenue and Chinatown's kitchens.
- `sf-haight-castro` — Haight, Castro & Twin Peaks: Twin Peaks, Mount Sutro, Corona Heights, Buena Vista, Tank Hill
  and Alamo Square's rise; Victorian rows under restoration; a hospital campus by Duboce Park; the Market Street
  transit corridor and the Church Street line; Golden Gate Park's east-end crew.
- `sf-sunset-south` — the Sunset & Ocean Beach south: Ocean Beach, Fort Funston, Lake Merced, Pine Lake and Stern
  Grove, the university campus, Stonestown, Parkmerced, Merced Heights.
- Landmarks carry LANDMARKS' kind names (`coit-tower`, `transamerica-pyramid`, `painted-ladies`,
  `cable-car-turntable`, `victorian-house`, `wharf-pier-shed`, `ferry-building`); until `lm-landmarks.js` merges
  the engine draws its generic landmark and check_parishes notes the kinds as pending.
- Written once by `tools/gen_sn_districts.mjs` from approximate lon/lat; the modules are the source afterwards.

## Cycles

(reason → act → observe; one line each, result on the same line)

1. Reason: is SoMa & Mission Bay free? Check `npBounds(sf-mission)`. Act: print every SF field's bounds. Observe: sf-mission
   is lon −122.459 … −122.357, lat 37.722 … 37.804 — it covers both, so the third district is `sf-sunset-south`.
2. Reason: three districts pass check_parish_data. Act: `tools/gen_sn_districts.mjs` writes the modules and the mirror
   connectors; registry, bundler, docs table. Observe: 26 fails (the eight-kilometre width floor, a site id shared with
   oak-downtown-lake, the docs table) → declared walkable `scale` honoured, `nb-chinatown-kitchens`, docs section →
   `check_parish_data: 16 parishes, 359 sites … 13639 checks pass, 0 fail`.
3. Reason: the strict engine holds the new maps. Act: add the three ids to `NP_ENGINE_STRICT`. Observe: every engine
   check passed first time (worst high tier 134 meshes / 83 388 triangles, inside 260 / 400 000); 3 fails were the facts
   regex on the header's own word "elevations" → reworded → pass.
4. Reason: check_parishes proves the brief (kinds, hills where they are, named landmarks, pairing, overlap). Act: the
   NEIGHBORHOODS block. Observe: 1 fail — the fleet berths sat within reach of sf-downtown's wharf kitchens → moved
   west → `check_parishes: 23163 passed, 0 failed`.
5. Reason: landmarks draw with LANDMARKS' kit once merged. Act: tag them `lm` with its published kind ids (coit-tower,
   transamerica-pyramid, cable-car-turntable, cable-car, wharf-pier-shed, ferry-building, painted-ladies,
   victorian-house); add a cable car and a second Victorian. Observe: check_parish_data 13645 pass, 0 fail; the kit
   check notes "pending lm-landmarks.js" until the merge.
6. Reason: the consoles that iterate every map still pass. Act: run them singly. Observe: tycoon 1 fail (no waterside
   shop in sf-haight-castro) → the valve house moved beside Laguna Honda Reservoir → `check_tycoon: 4588 passed, 0
   failed`; storyline 19 fails and cognition 4 (no stories or K-12 lessons on the new maps) → re-ran `gen_st_stories`
   and `gen_cg_units` → `All storyline checks pass.`, `check_cognition: 346 passed, 0 failed`; drills, cityworks
   (2903, 0 failed), terraform (204142, 0 failed), menagerie (17 maps, 0 failed), parish_play, treasures, npc, k12,
   krewe pass; check_parishes 23163 passed, 0 failed.
7. Reason: the generated pages follow the new maps. Act: `gen_packs`, `gen_home`, `bundle_webxr.py`. Observe: check_packs
   99 stale → `all 30343 checks pass`; check_home 1 → `All homepage and sign-in checks pass.`; `eval_worlds: 21
   subjects, mean 98, 14 findings` — each new district loses only the play layer's field-lesson count (the finding the
   Oakland maps share; the districts' own sn-fl- lessons are not in that layer's view). No before-run (time).

## Left

- Wire the sn-fl- lessons into the play layer's view (SECONDLINE/BAYOU) so eval_worlds counts them (the −3 each).
- Pair `sf-ss-ocean-avenue-east` when TIDELANDS' sf-outer-mission merges (its mirror at -122.458, 37.721).
- The kit silhouettes appear once LANDMARKS' lm-landmarks.js merges (check_parishes then checks every `lm`).

## Seams

- Data only: `WebXR/shared/np-data-sf-north-beach.js`, `np-data-sf-haight-castro.js`, `np-data-sf-sunset-south.js`,
  registered in `np-parishes.js`; landmarks carry `lm: <LANDMARKS kit kind>` (drawn by `lmBuild` once merged), guarded.
- Mirror connectors added to sf-downtown, sf-mission, sf-marina and sf-golden-gate-park; `sf-ss-ocean-avenue-east`
  ships `to.position: null` for TIDELANDS' sf-outer-mission to pair.
