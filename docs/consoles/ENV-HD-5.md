# Console ENV-HD-5

- Console: ENV-HD-5 (loop 10, round 5, prefix `hd5`, port 9133)
- Brief: `$SP/loop10/brief-r5.md` (section ENV-HD-5), under the Rules of `$SP/loop10/brief.md`, the Shared rules of
  `packs-brief.md` and the reactor loop of `packs-brief-3.md`
- Base: e252b25f (fast-forward; loop 10 rounds 1–4 merged), branch `worktree-agent-a6814868e45070b08`

## What is here
- **The Louisiana rooms inside the balanced budget** (`WebXR/shared/lar-rooms.js`, `WebXR/shared/hd2-room-skins.js`).
  LA-ROOMS drew one 512 × 120 canvas per name sign on balanced as on high, which put its six rooms at 3.21–6.02 MiB on
  balanced before any skin, over the 3 MiB room budget. `LAR_SIGN_PX` now gives balanced the phone tier's 256 × 60 (high
  keeps 512 × 120), `larSignMaterial` takes the tier, and `HD2_SIGN_BYTES.balanced` counts the same. The six rooms are
  2.47–2.86 MiB on balanced with the skin's floor (and walls where they fit); meshes, triangles and lights are unchanged
  (only a canvas's resolution changed; the sign planes are 1.8 × 0.42 m on every tier).
- **Scenes beyond the robot sites** (`WebXR/shared/hd3-scenes.js`). Two establishing shots ("wide", "street") for the busiest
  park, fire station, hospital and school — the four busiest kinds by catalog stations that had no preset (parks 214
  stations over 54 sites, fire stations 178 over 46, hospitals 169 over 40, schools 168 over 43), the busiest site of each:
  the park crew yard on the Marina map (5 stations), the fire station and the hospital campus on the Orleans map (4 and 6)
  and the school campus on the Mission map (5). Labels name the kind only; the frame is the parish engine's generic
  building. Through `window.__parishTest.scene(siteId, shot[, look])`, listed by `__parishTest.scenePresets()`: 18 → 26.
  `tools/drive_hd3_scenes.mjs` now writes JPEG (q92) and loads each map once.
- **Balanced lighting in the robot rooms** (`WebXR/shared/hd4-rooms.js`). On balanced (not in a headset browser) each of the
  six robot rooms and the hive operations room takes a light-weight version of the high tier's lighting: the same LED
  ceiling panels, a flush warm panel on the ceiling over every station pad (and ops console) in place of the pendant and its
  floor pool, and the three amber beacons' lenses — emissive boxes in ONE instanced mesh (one draw call), no real light, no
  texture, no additive pool. +1 mesh and +132–228 triangles a room; lights and texture bytes unchanged. The phone tier and a
  headset browser build exactly what they built before.

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| LA rooms on balanced (texture bytes per room, every texture counted) | **3.21–6.02 MiB**, 0 of 6 ≤ 3 MiB (512 × 120 name signs, 6–15 a room) | **2.47–2.86 MiB** with the skin's floor (walls where they fit), **6 of 6** ≤ 3 MiB; measured = model on 18 of 18 builds (six rooms × three tiers) | before: `$SP/loop10/hd5/before-room-skins.txt` ("rooms over their budget before the skin: lar-craft-hall/balanced 6.02 MiB … lar-hangar/balanced 3.21 MiB"); after: `node tools/check_room_skins.mjs` ("LA rooms on balanced 3.21–6.02 MiB (before) → 2.47 MiB–2.86 MiB with the skin, 6 of 6 ≤ 3.00 MiB") |
| LA rooms' meshes / triangles / lights, every tier | — | **unchanged** (only the canvas resolution changed; the sign planes 1.8 × 0.42 m on all three tiers) | `check_room_skins` (one line per style and tier; "the name-sign planes are the same size on every tier") |
| rooms over their texture budget before the skin | 6 (reported, not failed) | **0**, and now a failing check | `check_room_skins` ("every room fits its texture budget on every tier before the skin (0 over …)") |
| scene presets (`__parishTest.scene`) | **18** (12 robot-site + 6 non-robot) | **26** (+ park crew yard, fire station, hospital campus, school campus × wide/street) | before: `$SP/loop10/hd5/before-exteriors.txt` ("12 … -> 18"); after: `node tools/check_exteriors.mjs` ("12 → 18 (ENV-HD-3) → 26 (ENV-HD-5)"); the page lists 26 (drive B's lines) |
| street cameras ≥ 12 m from the site's own building | 6 of 7 (the hospital campus at 8.3 m) | **7 of 7** (hospital 19.7 m) | `check_exteriors` ("the street camera stands … m from the site's own building") |
| balanced robot rooms with lighting | **0** of 6 | **6 of 6** (+ the ops room): LED panels, a flush panel over every station pad, 3 beacon lenses; one instanced mesh, 0 real lights, 0 texture bytes | `node tools/check_hd4.mjs` ("balanced robot rooms with lighting: 0 -> 6 of 6") |
| balanced robot rooms, meshes / triangles / lights / texture bytes | 18–20 / 1,016–2,340 / 2 / 2.33–2.67 MiB | **19–21 / 1,148–2,568 / 2 / 2.33–2.67 MiB** (+1 mesh, +132–228 triangles; stated budget +1 / ≤ 400 / +0 / +0; IX_BUDGET 120 / 6,000) | `check_hd4` §3 (one line per room) |
| ops room on balanced | 21 meshes / 1,334 tris / 2 lights / 2.42 MiB | **22 / 1,538 / 2 / 2.42 MiB** (stated budget 40 / 6,000 / 2 / 3 MiB) | `check_hd4` §6 |
| phone tier and headset browser | — | **identical**: robot rooms 18 of 18 builds (phone; a headset on balanced; a headset on high, Ultra asked for); LA rooms on the phone tier unchanged (256 × 60 signs as before) | `check_hd4` §3; `check_room_skins` (low rows unchanged against the before log) |
| stills re-shot after the dawn-sky and sign-fit fixes | 0 | **13** (San José and West Oakland at dawn and fog-at-dawn: 6; the seven lit rooms) | drive A (`$SP/loop10/hd5/driveA.txt`) |
| new stills | 0 | **25** (the four new scenes × wide/street × day/night: 16, the hospital street pair re-shot: 2, the seven balanced rooms: 7); 2 rejected by eye and re-shot | drives B, C1, C2 (`$SP/loop10/hd5/driveB.txt`, `driveC1.txt`, `driveC2.txt`) |
| page errors / external requests in the drives | — | **0 / 0** in all four drives (38 captures, 0 failed) | the drives' last lines |
| `check_room_skins` | 401 pass | **480** pass | `$SP/loop10/hd5/before-room-skins.txt`; `node tools/check_room_skins.mjs` |
| `check_exteriors` | 278 pass | **309** pass | `$SP/loop10/hd5/before-exteriors.txt`; `node tools/check_exteriors.mjs` |
| `check_hd4` | 118 pass | **127** pass | `$SP/loop10/hd5/before-hd4.txt`; `node tools/check_hd4.mjs` |
| `check_la_rooms` · `check_interiors` · `check_robo_interiors` · `check_classrooms` · `check_hive_world` · `check_bridge` | 3,787 · 957 · 302 · 2,057 · 35 · 139/139 (ENV-HD-4's figures) | **3,787 · 957 · 302 · 2,057 · 35 · 139/139** pass | each checker |
| `check_newton` · `check_imports` · `check_parse` | — | **60 checks, 0 failed · all 1,124 modules · all 2,703 modules** | each checker |

## Stills
All 1920 × 1080 JPEG (q92) from the built parishes page on port 9133 (headless Chromium, SwiftShader), the page's buttons
hidden for the still, every frame looked at. Named by location, kind, preset and time of day:
`<site>-wide-<look>-<time>.jpg` (robot sites), `<map>-<kind>-<shot>-<day|night>.jpg` (the new scenes) and
`<site>-<style>-lit[-balanced]-interior.jpg` (rooms; the site whose door opens the room). The preset id is what
`window.__parishTest.scene(siteId, shot[, look])` takes; rooms open through `__parishTest.ixScene(style)` and
`__parishTest.hd4.opsRoom()`.

**Re-shot after the dawn-sky and sign-fit fixes** (`$SP/loop10/hd5/reshoot/`, drive A: "13 captures, 0 failed, page errors
0, external requests 0, 232 s, load 5.15"):

| still | preset id | draw calls | triangles | notes |
|---|---|---|---|---|
| `san-jose-robotics-lab-wide-dawn-dawn.jpg` | `rb-site-san-jose-robotics-lab:wide:dawn` | 163 | 193,541 | rose-violet low sky between the towers, the lab's floodlights on (0.6) |
| `san-jose-robotics-lab-wide-fog-dawn.jpg` | `rb-site-san-jose-robotics-lab:wide:fog` | 169 | 220,419 | rose haze on the far towers, fog 13.8–230 m |
| `west-oakland-port-automation-wide-dawn-dawn.jpg` | `rb-site-west-oakland-port-automation:wide:dawn` | 210 | 154,149 | the low sun in the east over the cranes, deep-blue zenith with stars |
| `west-oakland-port-automation-wide-fog-dawn.jpg` | `rb-site-west-oakland-port-automation:wide:fog` | 212 | 169,233 | the cranes fade into the rose fog |
| `west-oakland-warehouse-wide-dawn-dawn.jpg` | `rb-site-west-oakland-warehouse:wide:dawn` | 217 | 175,759 | dock lamps and floodlight pools under the dawn sky |
| `west-oakland-warehouse-wide-fog-dawn.jpg` | `rb-site-west-oakland-warehouse:wide:fog` | 219 | 178,635 | ground fog over the yards, the lamps glowing |
| `soma-robot-cell-ixr-cell-hall-lit-interior.jpg` | `ixScene('ixr-cell-hall')` | 25 | 2,184 drawn (3 lights, 22.67 MiB) | title fits; a fence post covers part of the honesty line (framing) |
| `san-jose-robotics-lab-ixr-cobot-lab-lit-interior.jpg` | `ixScene('ixr-cobot-lab')` | 23 | 1,748 drawn (3 lights, 17.33 MiB) | sign reads in full |
| `west-oakland-warehouse-ixr-amr-warehouse-lit-interior.jpg` | `ixScene('ixr-amr-warehouse')` | 22 | 2,716 drawn (3 lights, 17.33 MiB) | sign reads in full |
| `west-oakland-port-automation-ixr-port-control-lit-interior.jpg` | `ixScene('ixr-port-control')` | 24 | 1,320 drawn (3 lights, 18.67 MiB) | title fits; window mullions draw over the sign (framing) |
| `richland-drilling-robot-ixr-drilling-deck-lit-interior.jpg` | `ixScene('ixr-drilling-deck')` | 23 | 1,864 drawn (3 lights, 17.33 MiB) | "CEILING-DRILLING DECK" fits (was clipped) |
| `orleans-warehouse-ixr-maint-bay-lit-interior.jpg` | `ixScene('ixr-maint-bay')` | 22 | 2,068 drawn (3 lights, 17.33 MiB) | sign reads in full |
| `west-oakland-warehouse-hd4-hive-ops-lit-interior.jpg` | `hd4.opsRoom()` | 25 | 1,982 drawn (3 lights, 18.67 MiB) | "HIVE OPERATIONS ROOM" fits (was clipped) |

**The new scenes, by day and night** (`$SP/loop10/hd5/scenes/`, drive B: `node tools/drive_hd3_scenes.mjs 9133 high
$SP/loop10/hd5/scenes wide,street presidio-crew-yard,no-sw-mid-city-fire-station,hospital-district,mission-school-campus` —
"16 captures, 0 failed, page errors 0, external requests 0, 787 s, load 7.22"; the page listed 26 presets):

| still | preset id | draw calls | triangles | notes |
|---|---|---|---|---|
| `sf-marina-park-wide-day.jpg` | `presidio-crew-yard:wide` | 140 | 170,889 | the crew yard among park trees, the suspension bridge over the bay behind — the strongest of the set |
| `sf-marina-park-wide-night.jpg` | `presidio-crew-yard:wide` | 153 | 176,445 | lit windows, the bridge against the night sky |
| `sf-marina-park-street-day.jpg` | `presidio-crew-yard:street` | 151 | 175,163 | eye level across the yard; a tree crown overhead fills the top-left (Left) |
| `sf-marina-park-street-night.jpg` | `presidio-crew-yard:street` | 152 | 169,689 | the same; the board's lamp a small bar in the sky |
| `orleans-fire-station-wide-day.jpg` | `no-sw-mid-city-fire-station:wide` | 213 | 218,522 | the yard by its road, the neighbourhood's houses and trees beyond |
| `orleans-fire-station-wide-night.jpg` | `no-sw-mid-city-fire-station:wide` | 215 | 224,210 | lit windows, stars |
| `orleans-fire-station-street-day.jpg` | `no-sw-mid-city-fire-station:street` | 175 | 212,600 | across the road: the building, cones, the board from behind |
| `orleans-fire-station-street-night.jpg` | `no-sw-mid-city-fire-station:street` | 176 | 211,054 | the board's lamp reads as a white bar in the sky (Left) |
| `orleans-hospital-wide-day.jpg` | `hospital-district:wide` | 197 | 221,419 | the campus yard by a wide road and crossing, a red vehicle in the yard |
| `orleans-hospital-wide-night.jpg` | `hospital-district:wide` | 199 | 226,569 | street lamps and their pools along the road |
| `sf-mission-school-wide-day.jpg` | `mission-school-campus:wide` | 122 | 227,681 | the solver's fallback, 30 m up over the rowhouses, hills behind |
| `sf-mission-school-wide-night.jpg` | `mission-school-campus:wide` | 124 | 231,345 | lit rowhouse windows |
| `sf-mission-school-street-day.jpg` | `mission-school-campus:street` | 114 | 225,960 | eye level across the yard: the building, a bus, the rowhouses |
| `sf-mission-school-street-night.jpg` | `mission-school-campus:street` | 115 | 226,488 | the same at night |

The hospital's first street pair (253 / 256 draw calls) stood 8.3 m from the site's own wall, which filled the left of the
frame: moved to `scenes/rejected/` and re-shot after cycle 5 (drive C1: `node tools/drive_hd3_scenes.mjs 9133 high
$SP/loop10/hd5/scenes street hospital-district` — "2 captures, 0 failed, page errors 0, external requests 0, 124 s, load
13.93"):

| still | preset id | draw calls | triangles | notes |
|---|---|---|---|---|
| `orleans-hospital-street-day.jpg` | `hospital-district:street` | 208 | 162,881 | the whole building and its door, the board and cones, the neighbourhood behind; fewer yard props than at night (likely still streaming at load 13.9) |
| `orleans-hospital-street-night.jpg` | `hospital-district:street` | 210 | 223,151 | the same at night, the yard props in, the board's lamp a bar in the sky |

**Balanced lit rooms** (`$SP/loop10/hd5/balanced/`, drive C2: `node tools/drive_hd4_scenes.mjs 9133 balanced
$SP/loop10/hd5/balanced oak-west-oakland dawn rooms high notime none` — "7 captures, 0 failed, page errors 0, external
requests 0, 81 s, load 10.84"; measured in the page, the same counts as `check_hd4`):

| still | preset id | meshes / draw calls | triangles built | lights | textures | lighting |
|---|---|---|---|---|---|---|
| `soma-robot-cell-ixr-cell-hall-lit-balanced-interior.jpg` | `ixScene('ixr-cell-hall')` on balanced | 21 / 22 | 1,868 | 2 | 2.67 MiB | 8 panels, 4 task panels, 3 beacons |
| `san-jose-robotics-lab-ixr-cobot-lab-lit-balanced-interior.jpg` | `ixScene('ixr-cobot-lab')` | 20 / 20 | 1,576 | 2 | 2.33 MiB | 6, 4, 3 |
| `west-oakland-warehouse-ixr-amr-warehouse-lit-balanced-interior.jpg` | `ixScene('ixr-amr-warehouse')` | 20 / 19 | 2,568 | 2 | 2.33 MiB | 12, 4, 3 |
| `west-oakland-port-automation-ixr-port-control-lit-balanced-interior.jpg` | `ixScene('ixr-port-control')` | 21 / 21 | 1,148 | 2 | 2.67 MiB | 4, 4, 3 |
| `richland-drilling-robot-ixr-drilling-deck-lit-balanced-interior.jpg` | `ixScene('ixr-drilling-deck')` | 20 / 20 | 1,736 | 2 | 2.33 MiB | 6, 3, 3 |
| `orleans-warehouse-ixr-maint-bay-lit-balanced-interior.jpg` | `ixScene('ixr-maint-bay')` | 19 / 19 | 1,896 | 2 | 2.33 MiB | 6, 4, 3 |
| `west-oakland-warehouse-hd4-hive-ops-lit-balanced-interior.jpg` | `hd4.opsRoom()` on balanced | 22 / 22 | 1,538 | 2 | 2.42 MiB | 6, 11 (4 pads + 7 consoles), 0 |

**For the video review and the deck:** `sf-marina-park-wide-day.jpg` (the park crew yard under the suspension bridge),
`west-oakland-port-automation-wide-fog-dawn.jpg` (the cranes in a rose fog at dawn), `west-oakland-warehouse-hd4-hive-ops-lit-interior.jpg`
(the ops room's sign now fits) and `west-oakland-port-automation-ixr-port-control-lit-balanced-interior.jpg` (balanced's warm
task panels).

## Cycles
1. Reason: the LA rooms fit balanced's 3 MiB with their name signs at the phone size, and the checker's model of a sign
   canvas must follow the module (a coordinator attempt changed the size alone and 24 checks failed: `check_room_skins`
   line 81 modelled 512 × 120 on balanced); proof = `check_room_skins` ("rooms over their budget before the skin … none",
   6 of 6 ≤ 3 MiB measured). Act: `LAR_SIGN_PX` and `larSignMaterial(THREE, text, tier)`; `HD2_SIGN_BYTES.balanced`
   256 × 60; the checker's model `larSignPx(tier)`, a failing check for any room over its budget before the skin (it was
   reported only), and a measured pass — the six LA rooms built again on three tiers under a recording canvas stub, with
   LA-ROOMS' dressers and the skin, every texture measured (shell signs, name signs, skin maps) against the model and
   `HD2_SIGN_BYTES`. Observe: "ROOM-SKINS: all 480 checks pass" (401 before); LA rooms on balanced 3.21–6.02 → 2.47–2.86
   MiB, 6 of 6 ≤ 3 MiB, measured = model on 18 of 18 builds. Mutation test: with balanced set back to 512 × 120 the measured
   pass fails (canvases 512 × 120 against the model's 256 × 60; 6.35 MiB measured against 2.84). `check_la_rooms` 3,787,
   `check_hd4` 118, `check_interiors` 957 pass. Committed 36799b3e.
2. Reason: re-shoot what ENV-HD-4 could not after its last two fixes — San José's and West Oakland's dawn and fog-at-dawn
   frames (they predate `hd4DawnSky`) and the seven lit rooms (they predate the sign fit); proof = the drive's ok lines and
   looking at every frame. Act: `python3 tools/bundle_webxr.py` (only the two parishes dist files change), then `node
   tools/drive_hd4_scenes.mjs 9133 high $SP/loop10/hd5/reshoot bay-san-jose,oak-west-oakland dawn,fog rooms high notime`.
   Observe: "13 captures, 0 failed, page errors 0, external requests 0, 232 s, load 5.15". Looked at all 13: the three sites
   at dawn now show the rose-violet low sky with the sun in the east and a deep-blue zenith with stars (the fog look fades
   the cranes and towers into a rose haze); every room sign's title fits, "HIVE OPERATIONS ROOM" and "CEILING-DRILLING
   DECK" included. Two framing notes, not faults of the fit: a guard-fence post covers part of the cell hall's honesty line,
   and the port control room's window mullions draw over its sign (Left). Pass.
3. Reason: establishing shots for the next busiest kinds — a park, a fire station, a hospital and a school — generic by
   kind; proof = `check_exteriors` (presets 18 → 26, the four kinds computed from the catalog, labels name the kind only).
   Act: four sites in `HD3_SCENE_SITES` with `by: "kind"` (the busiest site of each of the four busiest kinds without a
   preset: park 214 stations, fire station 178, hospital 169, school 168; a tie of the busiest count goes to a map the
   presets already open); the checker's "three sites, top three overall" became "three by site + four by kind", each rule
   computed from the catalog, plus a label check. Observe: "ROBO-EXTERIORS: all 302 checks pass" (278 before); "scene
   presets: 12 → 18 (ENV-HD-3) → 26 (ENV-HD-5)". The school's wide camera is the solver's fallback (30 m up): the campus
   sits among low rowhouses (72 massing boxes within 140 m, the tallest 9.9 m) so no spot 62–86 m out is 5 m clear; a probe
   found the fallback camera outside every box, above every roof. `check_bridge` 139/139. Pass; committed e3bd3134.
4. Reason: the robot rooms' lighting on balanced, light-weight and inside its budget — emissive fixtures only, no real light,
   no texture; proof = `check_hd4` (balanced adds exactly 1 mesh, 0 lights, 0 texture bytes and ≤ 400 triangles, inside
   IX_BUDGET; the phone tier and a headset browser on high and on balanced identical). Act: `hd4LightRoomBalanced` (one
   InstancedMesh, MeshBasicMaterial, per-instance colour: the LED panels where high puts them, a flush warm panel on the
   ceiling over every station pad and ops console instead of the pendant and its pool, the three beacons' lenses), called
   from `hd4LightRoom` on balanced outside a headset; `HD4_ROOM_LIGHT_BUDGET.balanced` 0 → 1 mesh / 400 triangles. The
   checker proved balanced identical (§3); it now proves balanced against that budget, adds a headset browser on balanced to
   the identical builds (18 of 18) and lists the balanced fixtures per room (§5). Observe: "ENV-HD-4: all 127 checks pass"
   (118 before); balanced robot rooms 18–20 → 19–21 meshes, +132–228 triangles (1,016–2,340 → 1,148–2,568), lights 2 → 2,
   texture bytes unchanged (2.33–2.67 MiB); the ops room on balanced 21 → 22 meshes, 1,334 → 1,538 triangles, inside its
   stated budget (40 / 6,000 / 2 / 3 MiB). Pass; committed 1cc43e0a.
5. Reason: the scene stills must read well, not only be set; proof = looking at drive B's frames, then
   `check_exteriors`. Observe (drive B, first 8 frames): the hospital campus's street shot stood 8.3 m from the site's own
   building, whose 24 m wall filled the left 45 % of the frame (a probe of every street camera: the other six stand 16–36
   m from theirs). Act: the street solver's first pass now asks 12 m from the site's own building and 3.5 m clear of every
   grown footprint, the old 1.2 m pass the fallback; `check_exteriors` checks every street camera ≥ 12 m from its own
   building. Observe: only the hospital's street camera moves (14 presets compared before → after; 8.3 → 19.7 m); "all 309
   checks pass". Re-shot in drive C.
6. Reason: the scenes, the re-shot hospital pair and the balanced rooms in the page, page errors 0; proof = drives B and C's
   last lines and looking at every frame. Act: rebuild, drive B (16), drive C1 (the hospital street pair), drive C2 (the
   seven rooms on balanced), one at a time on port 9133. Observe: B "16 captures, 0 failed, page errors 0, external requests
   0, 787 s, load 7.22", C1 "2 captures … 0 … 0, 124 s, load 13.93", C2 "7 captures … 0 … 0, 81 s, load 10.84"; the page
   lists 26 presets; the balanced rooms measure in the page what `check_hd4` says (19–22 meshes, 2 lights, 2.33–2.67 MiB, the
   fixtures per room). Every frame looked at: the re-shot hospital street frames the whole building; the balanced rooms show
   the panels, the warm task panels and the beacon lenses, no pendants or pools. Found by eye and left (Left): the park
   street shot under a tree crown, the board's lamp at night, the plain generic building. Pass.

## Seams
- `lar-rooms.js`: `LAR_SIGN_PX` (`{ high: [512, 120], balanced: [256, 60], low: [256, 60] }`), `larSignMaterial(THREE, text,
  tier)` (was `low`).
- `hd2-room-skins.js`: `HD2_SIGN_BYTES.balanced` = 256 × 60 × 4 × 4/3.
- `hd3-scenes.js`: `HD3_SCENE_SITES` entries carry `by: "site" | "kind"`; seven sites, `hd3ScenePresets()` 14. The app's
  `__parishTest.scene` routes any entry (no app change beyond comments).
- `hd4-rooms.js`: `hd4LightRoomBalanced({ three, group, room })` → `room.hd4Lights = { tier: "balanced", panels, pendants: 0,
  taskPanels, beacons, lights: 0, meshes: 1, triangles }` (mesh `hd4-light-balanced`); `HD4_ROOM_LIGHT_BUDGET` balanced
  `meshesAdded` 1, `trianglesAdded` 400.

## Left
- **The four new kinds read as "a low building".** Their presets frame the parish engine's plain generic site building (a
  box with a door) with its yard props and job board; nothing in the frame says fire station, hospital, school or park
  crew yard beyond the setting (the park's trees and bridge, the hospital's wide road, the school's rowhouses). A kind cue
  on the site building, generic and procedural, is the next step (`tools/briefs/next/hd5-next.md` item 1).
- **The park's street shot stands under a tree crown** the solver does not see: `hd3Obstacles` reads the massing's crowns,
  and the tree in the frame comes from another source (not found in the time; next item 2).
- **The job board's lamp at night** reads as a small white bar over each board, and as a bar in the sky in the low street
  shots (the fire station's night street shot shows it large); its arm or post is not drawn (next item 3).
- **Room sign framing** (seen in the re-shoot): a guard-fence post covers part of the cell hall's honesty line and the port
  control room's window mullions draw over its sign (next item 4).
- **The low sun at dawn** is sky.js's dusk disc: at the warehouse's wide shot it sits large and stretched near the frame's
  corner. sky.js is shared with other worlds and was not changed.
- **Not run here** (the shared machine): `check_mobile` (it drives the dist pages and rewrites `docs/perf/phone-maps.json`),
  `check_walkable`'s browser leg, `eval_worlds`, `check_interface` (no control was added or changed). The phone and headset
  tiers are proven unchanged by `check_hd4` §3 and `check_room_skins`' low rows.
- `check_room_skins`' and `check_hd4`'s rows in `docs/perf/checkers-baseline.json` are estimates (to re-measure quiet).
- The committed `WebXR/dist/parishes.html` and `WebXR/parishes/dist/parishes.html` were rebuilt for the drives and
  restored; the coordinator's integration rebuild carries these changes.
