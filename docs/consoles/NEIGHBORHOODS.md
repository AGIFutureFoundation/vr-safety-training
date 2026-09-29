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

## Seams

- Data only: `WebXR/shared/np-data-sf-north-beach.js`, `np-data-sf-haight-castro.js`, `np-data-sf-sunset-south.js`,
  registered in `np-parishes.js`; landmark `kind`s name LANDMARKS' registry (`lmBuild(kind, opts)`), guarded.
- Mirror connectors added to sf-downtown, sf-mission, sf-marina and sf-golden-gate-park; `sf-ss-ocean-avenue-east`
  ships `to.position: null` for TIDELANDS' sf-outer-mission to pair.
