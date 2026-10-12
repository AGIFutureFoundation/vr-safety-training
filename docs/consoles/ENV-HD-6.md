# Console ENV-HD-6

- Console: ENV-HD-6 (loop 10, round 6, prefix `hd6`, port 9143)
- Brief: `$SP/loop10/brief-r6.md` (section ENV-HD-6), under the Rules of `$SP/loop10/brief.md`, the Shared rules of
  `packs-brief.md` and the reactor loop of `packs-brief-3.md`
- Base: 230105b7 (fast-forward; loop 10 rounds 1–5 merged)

## What is here
- **Buildings that read as their kind** (`WebXR/shared/hd6-kinds.js`, new). The busiest park, fire station, hospital and
  school (ENV-HD-5's four "kind" presets) were the parish engine's plain box with a door. Each now carries a cue of its kind,
  procedural and generic: two apparatus-bay doors (red frames, roll-up panels with a glazed band, concrete aprons), a trim
  band and a hose-drying tower for the fire station; a covered drop-off canopy on two posts, a drop-off lane with kerb lines
  and a white "H" on a blue square (built from boxes; no red cross or other protected emblem, no words) for the hospital;
  an entrance canopy and a fenced play yard with its surface and a climbing frame (no flagpole) for the school; a green
  gable roof with timber gable ends and corner boards, an open pavilion with a picnic table, gravel paths, a planting bed and
  a tool shed for the park crew yard. One merged, vertex-coloured mesh per map, no texture, no light; high and balanced
  (balanced the lighter build); the phone tier and a headset browser build nothing (the engine's own site buildings are
  untouched).
- **The job board's lamp at night** (same module). The "white bar in the sky" was ATMOS's site lamp — a lit 1.4 × 0.5 m quad
  6.5 m over every board with nothing holding it. Every board now has a post beside it, an arm, a housing just over the lit
  face and a back plate (48 triangles a board, in the same mesh; high and balanced). ATMOS is unchanged.
- **The street camera knows every tree** (`WebXR/shared/hd3-scenes.js`). The crown over the park's street shot was KREWE's
  live oak (`kw-place.js`), which the scene solver never read (it read the massing's crowns). `hd3KitRects` adds KREWE's
  placements to the solver's obstacles (a live oak by its crown plus 8 m, other kits 6 m). Only the park's street camera
  moves; the nearest crown edge goes from 0.2 m to 11.0 m.
- **Ultra on the four kinds' hero buildings** (same module). With the opt-in Ultra setting on, the four buildings take one
  2048 px canvas facade atlas (a 1024 px cell per kind: red brick with a stone band and tall windows; white panels with
  ribbon windows and a blue band; buff brick with tall teal-framed windows; timber boards), drawn on four wall planes 3 cm
  proud of each building. Stated budget: +1 mesh a map, 8 triangles a building, 24 MiB of texture a map (measured 21.33 MiB).

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| kinds with a cue | **0** of 4 | **4 of 4** (fire station, hospital, school, park) | `node tools/check_hd6.mjs` ("kinds with a cue: 0 -> 4 of 4"); stills in drives A and B |
| cue triangles per site, balanced / high (budget 1,200 / 3,600) | — | park 276 / 420, fire station 192 / 384, hospital 156 / 180, school 480 / 1,968 | `check_hd6` (the "cue triangles per site" line) |
| cue mesh per map (headless), low / balanced / high | 0 / 0 / 0 | **0 / 1 mesh / 1 mesh**: sf-marina 0 / 1,572 / 1,716 tris, orleans 0 / 2,028 / 2,244, sf-mission 0 / 1,824 / 3,312 (lamps included: 27, 35, 28 boards) | `check_hd6` §1b (measured = model on 6 of 6 builds); the node measure in `docs/consoles/memory/ENV-HD-6.md` |
| the same in the built page (orleans, hospital street shot) | — | low: **0** cue meshes, 151 draw calls, 67,599 tris; balanced: 1 mesh, 2,028 tris (fire 192, hospital 156, 35 lamps), 199 calls; high: 1 mesh, 2,244 tris, 209 calls; high + Ultra: 2 meshes, Ultra 16 tris, 2048 px, 21.33 MiB, 209 calls | drive C (`$SP/loop10/hd6/driveC.txt`: "page errors 0, external requests 0, 409 s, load 19.24") |
| chunk meshes and triangles with FACADES, every cued chunk | — | **inside FC_BUDGET** on balanced and high (FACADES + 1 mesh ≤ 6, triangles ≤ 24,000), nothing added on the phone tier | `check_hd6` §3 (one check per cued chunk and tier) |
| cue parts on a carriageway / in water / into another building / within 1.5 m of the board | — | **0 / 0 / 0 / 0** at all four sites | `check_hd6` §2; mutations: yards on the board's side → "11 parts within 1.5 m"; a 60 m lane → "1 part on a carriageway" |
| night lamp bars floating (boards with no post) | **90** on the three maps (every board: 27 + 35 + 28) | **0** (90 of 90 with a post, arm and housing over the lit face) | `check_hd6` §4; looked at in every night still |
| street cameras clear of every tree (no crown within 5 m) | **6 of 7** (the park: 0.2 m from a KREWE live oak's crown) | **7 of 7** (the park: 11.0 m) | `node tools/check_exteriors.mjs` (7 new lines); `$SP/loop10/hd6/probe/cams.mjs` (13 of 14 cameras unchanged) |
| Ultra hero buildings | **0** of 4 | **4 of 4** built, inside the stated budget (2048 px atlas 21.33 MiB ≤ 24 MiB a map; 8 tris a building), measured in the page on all three maps and shot 4 of 4 (8 stills) | `check_hd6` §5; drives C and D |
| phone tier unchanged | — | **unchanged**: no hd6 mesh on low (headless and in the page), np-world.js untouched; `check_facades` 2,977 and `check_hd4` 127 pass as before | `check_hd6` §1b and §6; drive C (low: 0 cue meshes) |
| page errors / external requests | — | **0 / 0** in drives A, B, C, D | the drives' last lines |
| `check_exteriors` | 309 pass | **316** pass | `node tools/check_exteriors.mjs` |
| `check_hd6` | — (new) | **118** pass | `node tools/check_hd6.mjs` |
| `check_facades` · `check_hd4` | 2,977 · 127 | **2,977 · 127** pass | each checker |
| `check_newton` · `check_imports` · `check_parse` | — | **60 checks, 0 failed · all 1,128 modules · all 2,707 modules** | each checker |

## Stills
All 1920 × 1080 JPEG (q92) from the built parishes page on port 9143 (headless Chromium, SwiftShader), the page's buttons
hidden, every frame looked at. Named `<map>-<kind>-<shot>-<day|night>.jpg` (and `-ultra-day` for Ultra); the preset id is
what `window.__parishTest.scene(siteId, shot)` takes.

**Drive A** (`$SP/loop10/hd6/scenes/`: `node tools/drive_hd3_scenes.mjs 9143 high $SP/loop10/hd6/scenes wide,street
presidio-crew-yard,no-sw-mid-city-fire-station,hospital-district,mission-school-campus` — "16 captures, 0 failed, page errors 0,
external requests 0, 1241 s, load 13.83"):

| still | preset id | draw calls | triangles | notes |
|---|---|---|---|---|
| `orleans-fire-station-wide-day.jpg` | `no-sw-mid-city-fire-station:wide` | 214 (ENV-HD-5: 213) | 220,766 | two red bay frames, aprons, the hose tower; the board's lamp on its post |
| `orleans-fire-station-street-day.jpg` | `no-sw-mid-city-fire-station:street` | 175 (175) | 213,940 | reads as a fire station: bays, trim band, tower with slits; the lamp a lamp |
| `orleans-fire-station-wide-night.jpg` | `no-sw-mid-city-fire-station:wide` | 216 (215) | 225,766 | the lamp's lit face on its post by the board |
| `orleans-fire-station-street-night.jpg` | `no-sw-mid-city-fire-station:street` | 177 (176) | 213,298 | the bar in the sky is now a lit lamp head on an arm |
| `orleans-hospital-wide-day.jpg` | `hospital-district:wide` | 198 (197) | 219,721 | the canopy and the H sign read from 70 m |
| `orleans-hospital-street-day.jpg` | `hospital-district:street` | 210 (208) | 229,451 | drop-off canopy, lane with kerb lines, white H on blue |
| `orleans-hospital-wide-night.jpg` | `hospital-district:wide` | 200 (199) | 228,813 | the lamp lit by the board |
| `orleans-hospital-street-night.jpg` | `hospital-district:street` | 211 (210) | 230,041 | H sign reads by the street lamps; the board lamp on its post |
| `sf-mission-school-wide-day.jpg` | `mission-school-campus:wide` | 123 (122) | 220,779 | entrance canopy, the fenced play yard with its frame |
| `sf-mission-school-street-day.jpg` | `mission-school-campus:street` | 115 (114) | 227,794 | the canopy shows behind the yard's bus and a container; the play yard is on the far side (Left) |
| `sf-mission-school-wide-night.jpg` | `mission-school-campus:wide` | 125 (124) | 234,657 | the yard and canopy under lit rowhouse windows |
| `sf-mission-school-street-night.jpg` | `mission-school-campus:street` | 116 (115) | 229,800 | as by day |

The four park stills of drive A were moved to `scenes/rejected/`: the street camera, now off the oak's trunk, still had a
crown across the top-left corner and faced the crew house's blank back wall, so the pavilion alone did not say "park"
(cycle 5). **Drive B** after the fix (`… scenes wide,street presidio-crew-yard` — "4 captures, 0 failed, page errors 0, external
requests 0, 284 s, load 14.55"):

| still | preset id | draw calls | triangles | notes |
|---|---|---|---|---|
| `sf-marina-park-wide-day.jpg` | `presidio-crew-yard:wide` | 153 (140) | 166,195 | the green gable roof, pavilion and shed among the park's oaks, the suspension bridge behind |
| `sf-marina-park-street-day.jpg` | `presidio-crew-yard:street` | 119 (151) | 185,155 | no crown overhead; the crew house's gable, timber ends and corner boards; the board lamp |
| `sf-marina-park-wide-night.jpg` | `presidio-crew-yard:wide` | 142 (153) | 178,017 | the lamp lit on its post |
| `sf-marina-park-street-night.jpg` | `presidio-crew-yard:street` | 120 (152) | 181,451 | the lamp's lit face under its housing |

**Ultra** (`$SP/loop10/hd6/ultra/`, drive C: `node $SP/loop10/hd6/probe/tiers.mjs 9143 orleans hospital-district street
$SP/loop10/hd6/ultra '[…]'`, page `?tier=high&ultra=1`):

| still | preset id | draw calls | triangles | notes |
|---|---|---|---|---|
| `orleans-fire-station-street-ultra-day.jpg` | `no-sw-mid-city-fire-station:street` (Ultra) | 176 | 205,784 | red brick, stone band, tall windows over the bays |
| `orleans-fire-station-wide-ultra-day.jpg` | `no-sw-mid-city-fire-station:wide` (Ultra) | 216 | 224,862 | the brick reads from 70 m |
| `orleans-hospital-street-ultra-day.jpg` | `hospital-district:street` (Ultra) | 211 | 169,499 | white panels, two ribbon-window bands, a blue band |
| `orleans-hospital-wide-ultra-day.jpg` | `hospital-district:wide` (Ultra) | 200 | 222,053 | the panelled block behind the canopy |

Drive D (the same probe with only the Ultra load, on sf-mission and sf-marina — "page errors 0, external requests 0, 251 s,
load 22.51" and "… 258 s, load 24.22"; Ultra 2048 px, 21.33 MiB, 8 triangles on each map):

| still | preset id | draw calls | triangles | notes |
|---|---|---|---|---|
| `sf-mission-school-street-ultra-day.jpg` | `mission-school-campus:street` (Ultra) | 115 | 226,610 | buff brick, tall teal-framed windows, a yellow band; the canopy behind the yard's bus |
| `sf-mission-school-wide-ultra-day.jpg` | `mission-school-campus:wide` (Ultra) | 125 | 235,835 | the brick school with its canopy and fenced play yard among the rowhouses |
| `sf-marina-park-street-ultra-day.jpg` | `presidio-crew-yard:street` (Ultra) | 120 | 179,225 | timber boards and windows under the green gable roof |
| `sf-marina-park-wide-ultra-day.jpg` | `presidio-crew-yard:wide` (Ultra) | 154 | 181,873 | the timber crew house, pavilion and shed, the bridge behind |

**For the video review and the deck:** `orleans-fire-station-street-day.jpg` (bays and hose tower),
`orleans-hospital-street-ultra-day.jpg` (the canopy, the H and the panelled facade), `orleans-fire-station-street-night.jpg`
(the board lamp on its post) and `sf-marina-park-wide-day.jpg` (the crew house under the bridge).

## Cycles
1. Reason: the park's street shot stood under a tree the solver could not see; proof = a probe of every tree source near
   each street camera, then `check_exteriors`. Act: probes of the massing (nothing within 25 m), DETAIL's tree and palm
   families (nothing within 7 m) and KREWE's placements: a live oak 7.95 m from the camera (crown 15.5 × 14.6 m). Added
   `hd3KitRects` to `hd3Obstacles`, and a `check_exteriors` line per street camera: no crown (massing trees, KREWE live oaks)
   within 5 m. Observe: only the park's street camera moved (14 compared); "all 316 checks pass" (309). Committed bcb28fdd.
2. Reason: the four kinds read as "a low building"; proof = `check_hd6` (a cue per kind inside its budget, where each part
   stands, the chunk budgets with FACADES, nothing on the phone tier or a headset) and the stills. Act: `hd6-kinds.js`
   (cues in the door face's frame, yards on the side away from the board), the board lamp posts, Ultra's atlas, the app
   mount, the bundler entry, `check_hd6` in check_all with an estimated row. Observe: "ENV-HD-6: all 118 checks pass";
   mutations bite (yards on the board's side: 1 fail; a 60 m lane: 3 fails). Committed e208b564.
3. Reason: a new module must not move another console's check; proof = `check_hd4` and `check_facades`. Observe:
   `check_hd4` failed 1 (its §7 wants the three hd4 modules adjacent in the bundle list). Act: `hd6-kinds.js` listed after
   `hd4-rooms.js` (still after its imports), not a change to the checker. Observe: `check_hd4` 127, `check_facades` 2,977
   pass. Committed cb2511ba.
4. Reason: the cues must read in the page by day and night; proof = drive A's lines and looking at every frame. Act:
   rebuild, drive A (16). Observe: "16 captures, 0 failed, page errors 0, external requests 0"; fire station and hospital
   read as their kind from both shots; the board lamp reads as a lamp at night in every frame (no floating bar); the school
   reads from the wide shot. Two faults by eye: the park's street shot (cycle 5) and the school's street shot, where the
   yard's bus and a container stand in front of the canopy (Left).
5. Reason: the park frames failed by eye — a crown still across the street shot's corner (the camera 17 m from two live
   oaks) and the camera facing the crew house's blank back; proof = re-shot frames. Act: a live oak counts by its crown plus
   8 m (crown edge 0.2 → 11.0 m, still only that camera moves); the park cue gains a green gable roof, stepped timber gable
   ends and corner boards so it reads from every side. Observe: `check_hd6` 118 and `check_exteriors` 316 pass; drive B
   "4 captures, 0 failed, page errors 0, external requests 0": no crown in the street frame, the crew house reads as a
   park building from its back. Committed 8b0d2b7c.
6. Reason: per-tier counts must come from the page, not only the model; proof = drive C. Act: one load per tier on Orleans
   (low, balanced, high, high + Ultra), the cue mesh read through `__parishTest.hd6()` and the renderer's counts, Ultra
   stills of the two Orleans kinds. Observe: low 0 cue meshes; balanced 1 (2,028 tris); high 1 (2,244); Ultra 2 (16 tris,
   2048 px, 21.33 MiB) — the same as `check_hd6`; "page errors 0, external requests 0". The Ultra facades read (brick and
   panels) and nothing z-fights with the bay frames or the canopy.

## Seams
- `hd6-kinds.js`: `HD6_KINDS`, `HD6_KIND_BUDGET` (meshesPerMap low 0 / balanced 1 / high 1; trianglesPerSite 0 / 1,200 /
  3,600; lampTriangles 0 / 48 / 48; lights 0; textureBytes 0; ultra: +1 mesh, 2048 px, 24 MiB, 8 tris a site),
  `hd6KindSites(parish)`, `hd6CueParts(parish, site, tier)`, `hd6LampParts(board)`, `hd6Build({ THREE, parish, boards, tier,
  ua })` → mesh `hd6-kind-cues`, `hd6UltraShells({ THREE, parish, doc })` → mesh `hd6-ultra-kinds`.
- `hd3-scenes.js`: `HD3_KW_HALF`, `hd3KitRects(parish)`; `hd3Obstacles` reads them.
- App: `window.__parishTest.hd6()` → `{ cues, ultra }`.

## Left
- **The school's street shot**: the yard props (a bus, a container) stand in front of the entrance canopy and the play yard
  is on the building's far side; the school reads from the wide shot. Moving the yard toward the camera's side or the
  camera off the props is the next step.
- **Only the busiest site of each kind** is cued (the four presets); every other park, fire station, hospital and school
  site keeps the plain box (next brief item 1).
- **The H sign at night** reads only by the street lamps (vertex colours, no emissive); next brief item 3.
- **The park's gable ends** are stepped boxes, visible as steps up close.
- **Not run here** (the shared machine): `check_mobile`, `check_walkable`'s browser leg, `eval_worlds`, `check_interface`
  (no control was added or changed).
- `check_hd6`'s row in `docs/perf/checkers-baseline.json` is an estimate (to re-measure quiet).
- The committed `WebXR/dist/parishes.html` and `WebXR/parishes/dist/parishes.html` were rebuilt for the drives and restored;
  the coordinator's integration rebuild carries these changes.
