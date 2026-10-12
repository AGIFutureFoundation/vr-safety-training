# Console ENV-HD-3

- Console: ENV-HD-3 (loop 10, round 3, prefix `hd3`, port 9112)
- Brief: `$SP/loop10/brief-r3.md` (section ENV-HD-3), under the Rules of `$SP/loop10/brief.md`, the Shared rules of
  `packs-brief.md` and the reactor loop of `packs-brief-3.md`
- Base: 41e41366 (fast-forward), branch `worktree-agent-ac95b6c7d2798968a`

## What is here
- **Every room style takes the high-detail texture set** (`WebXR/shared/hd2-room-skins.js`). ENV-HD-2 skinned 9 INTERIORS
  styles on top of ROBO-INTERIORS' six robotics rooms (15). The other ten now take it too, 25 of 25:
  - the **kitchen** (23 sites): the tile set with a **stainless variant**: brushed metal on counters, hoods, racks and
    cabinets (`HD2_SKIN_STYLES.kitchen.metal`, a lower roughness and a little more metalness);
  - a third set, **hall**: a plank floor (0.18 m boards, staggered butt joints, grain, a tone per board, tinted from the
    style's floor colour) and the painted block wall, on the **union hall** (6 sites), the **Louisiana crafts hall** (9) and
    TYCOON's **rented room**;
  - the **six LA-ROOMS rooms**: hangar, fabrication shop and compressor building take the industrial set (epoxy floor with
    the door apron, walkway and dashed keep-clear marks, painted concrete); data hall and control room the tile set;
  - TYCOON's **shop** the tile set.
  Meshes, triangles and lights are unchanged on every tier (the skin only sets maps). The skin is now **budget-aware**:
  `hd2RoomBytes` counts what the room already carries (the shell's two 512 × 256 signs and one canvas per LA-ROOMS name sign,
  512 × 120 on high and balanced, 256 × 60 on the phone), and each map (floor, then walls, then metal) is set only while the
  room stays inside `HD2_TEX_BUDGET` (high 24 MiB; balanced and low 3 MiB per room, unchanged).
- **One detail mesh per kind where variants meet; tower canopies** (`WebXR/shared/fc-facades.js`). Off the phone tier, a
  massing kind whose spots in a chunk fall in more than one kit bucket (generic and robotics) or whose kit carries
  ground-floor items is baked into ONE merged, vertex-coloured mesh (`fc-<kind>-merged`, `fcBakeKind`; `userData.fcGroups`
  counts each variant's spots) instead of one InstancedMesh per bucket and part. The robotics tower kit gains an **entrance
  canopy** (a canopy on two posts over the front door, with lobby glazing; a new "base" item drawn unstretched at the foot)
  and its **roof plant** becomes an unstretched roof item sized by the footprint (2.40 m tall on any tower; it used to scale
  with the tower's 30–120 m height). `fcDetailPlace(kind, id)` says where a detail draws (body, roof or base). The phone tier
  builds exactly what it built before.
- **The lots stay clear** (`WebXR/shared/mv-world.js`, `WebXR/shared/mg-life.js`, `WebXR/parishes/js/app.js`).
  `mvPlacements(parish, world, { tier, lots })` and `mvMountMotorworks({ …, lots })` reject a parking spot whose footprint
  (corners grown by 0.5 m) touches a robotics lot (`MV_LOT_MARGIN`, `mvInLots`); `mgPlan(map, { …, lots })` and
  `mgMountLife({ …, lots })` place no animal or person inside one and let nothing that walks step into one (`MG_LOT_MARGIN`,
  `mgLotBoxes`; fliers may cross over). The lots are ROBO-EXTERIORS' lot rectangles and `fxColliders` boxes as DETAIL's
  `dtLotRects(parish)` gives them; the parishes app passes them to the vehicle mount, to the walk's parked boxes and to the
  life mount (`fxLots`). Bay World passes none (no robot sites there), so `mg-life.js` takes no new import.
- **Establishing shots beyond the robot sites** (`WebXR/shared/hd3-scenes.js`, new). Two presets ("wide": 62–86 m out and
  26 m up on the road side, three-quarter, at the first spot with no building within about 18 m; "street": eye height on the near sidewalk of the nearest street, a little along it)
  for each of the three non-robot locations a learner visits most — the catalog's busiest sites by station count, one per kind:
  the **bridge yard** on the San Francisco Marina map (7 stations, the busiest site in the catalog), the **port terminal** on
  the Orleans map (6; the first map the page opens) and the **construction site** on the Mission map (6; construction is the
  busiest kind, 350 stations over 91 sites). The camera spot is the first candidate that stands dry and clear of massing with
  its sight line clear; deterministic. `window.__parishTest.scene(siteId, shot)` routes them (a site on another map returns
  its `?parish=…&scene=…` link, as for robot sites); `window.__parishTest.scenePresets()` lists all 18.
- **Captures** (`tools/drive_hd3_scenes.mjs`, not in the gate): the six presets by day and by night at 1920 × 1080 into
  `$SP/loop10/hd3/`, named `<map>-<kind>-<shot>-<day|night>.png`, with the page's buttons hidden for the still.
- Checkers: `tools/check_room_skins.mjs` (25 styles, the budget-aware maps, the LA rooms built with LA-ROOMS' dressers on a map
  that opens them), `tools/check_facades.mjs` (merged meshes, canopies, roof plant), `tools/check_exteriors.mjs` (the worst
  robot-site chunk; the non-robot scene presets), `tools/check_motorworks.mjs` and `tools/check_menagerie.mjs` (the lots).
  `exports/shared/holodeck-shared.json` is regenerated (FACADES' kits and detail kinds are in the TradeQuest export).
  `tools/drive_hd2_captures.mjs` now counts robotics buildings in merged meshes too.

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| room styles with the high-detail texture set | **15** (ROBO-INTERIORS 6 + ENV-HD-2 9) | **25 of 25** INTERIORS styles (+ kitchen, union hall, rented room, shop, LA hangar, fab shop, data hall, control room, compressor building, crafts hall) | `node tools/check_room_skins.mjs` ("6 (ROBO-INTERIORS) → 15 (ENV-HD-2) → 25 (ENV-HD-3)", "every INTERIORS style carries a set: 25 of 25") |
| meshes / triangles / lights per room, every skinned style × three tiers | — | **identical** with and without the skin (19 styles × 3 tiers; the LA rooms with LA-ROOMS' dressers on a map that opens them) | `check_room_skins` (one line per style and tier) |
| texture bytes per room, worst within budget (shell signs and LA name signs counted) | high 17.33 MiB, balanced and low 2.33 MiB (budget 24 / 3 / 3 MiB) | high **17.33 MiB**, balanced **2.33 MiB**, low **2.86 MiB** (LA data hall: floor + walls at 256 px over 11 name signs); budgets unchanged | `check_room_skins` ("worst texture bytes per room …") |
| LA rooms on balanced, before any skin | not counted (headless, LA-ROOMS draws its name signs as flat panels) | **3.21–6.02 MiB** over the 3 MiB room budget from LA-ROOMS' 512 × 120 name-sign canvases (6–15 a room); the skin adds **0 bytes** there; on low the crafts hall and fab shop take the floor only | `check_room_skins` ("rooms over their budget before the skin …") — a finding for LA-ROOMS (Left) |
| worst robot-site chunk meshes on high (FACADES + kit, vs FC_BUDGET 6) | **6** (San José 9,7: 4 + 2) | **5** (Orleans warehouse 10,8); San José 9,7 **2 + 2** = 4 | before: `$SP/loop10/hd3/before-exteriors.txt` (41e41366); after: `node tools/check_exteriors.mjs` ("worst robot-site chunk on high: 5 meshes … below FC_BUDGET 6") |
| worst robotics-variant chunk (check_facades §7) | low 3 / 202 tris, high **4** meshes / 5,204 tris (bay-san-jose 9,8) | low 3 / 202 (unchanged), high **3** meshes / 5,066 tris (bay-san-jose 8,8) | `node tools/check_facades.mjs` before/after logs |
| robotics chunks drawn one mesh per kind | 0 | **14** chunks (generic and robotics merged) | `check_facades` ("ENV-HD-3: … 14 robotics chunks drawn one mesh per kind") |
| robotics towers with an entrance canopy | 0 | **28 of 28** (San José); roof plant 2.40 m tall on every tower height, canopy top 4.57 m | `check_facades` ("robotics towers with an entrance canopy 28 of 28 …") |
| buildings near robot sites with the robotics variant | 68 of 68 | **68 of 68** (0 beyond 150 m); phone tier unchanged chunk by chunk | `check_facades` §7 |
| parked vehicles inside a robotics lot (5 maps × 3 tiers) | **2** (la-meta-richland data hall, balanced and high) | **0** | `node tools/check_motorworks.mjs` ("ENV-HD-3 lots: … before 2 -> after 0") |
| animals and people placed inside a robotics lot | **0** (30 plans: 5 maps × 3 tiers × day/night; and 0 with the page's CITYWORKS seams, 3 tiers) | **0**, now enforced at placement; chased towards a lot, **0 of 6** stepped in | `node tools/check_menagerie.mjs` ("ENV-HD-3 lots: …") |
| scene presets | **12** (six robot sites × wide/door) | **18** (+ bridge yard, port terminal, construction site × wide/street) | `node tools/check_exteriors.mjs` ("scene presets: 12 … -> 18"; "non-robot scene presets: 6 of 6") |
| stills at 1920 × 1080, page errors in the capture drive | 0 | **12** (6 presets × day/night), every frame looked at; page errors **0**, external requests **0** in each completed drive (1, 3, 4; drive 2 was stopped after one frame when its presets went stale) | `node tools/drive_hd3_scenes.mjs 9112 high $SP/loop10/hd3` (drive 3: 12 captures, 773 s at load 15; drive 4: the Orleans street pair, 113 s at load 10.6) |
| `check_room_skins` | 164 pass (41e41366) | **382** pass | `$SP/loop10/hd3/before-room-skins.txt`; `node tools/check_room_skins.mjs` |
| `check_facades` | 2,957 pass | **2,977** pass | `$SP/loop10/hd3/before-facades.txt`; `node tools/check_facades.mjs` |
| `check_exteriors` | 259 pass | **278** pass | `$SP/loop10/hd3/before-exteriors.txt`; `node tools/check_exteriors.mjs` |
| `check_motorworks` | 37 checks, 0 failed | **69** checks, 0 failed | `$SP/loop10/hd3/before-motorworks.txt`; `node tools/check_motorworks.mjs` |
| `check_menagerie` | 93,998 passed | **94,048** passed, 0 failed | `$SP/loop10/hd3/before-menagerie.txt`; `node tools/check_menagerie.mjs` |
| `check_bridge` | 139/139 | 138/139 after the kit change (stale export) → **139/139** after `node tools/export_shared.mjs` | `node tools/check_bridge.mjs` |
| `check_la_rooms` · `check_interiors` · `check_classrooms` | 3,787 · 925 · 2,057 pass (ENV-HD-2's figures) | **3,787 · 925 · 2,057** pass | each checker |
| `check_imports` | All 1114 modules (ENV-HD-2) | **All 1117** modules call only what they declare or import | `node tools/check_imports.mjs` |
| `check_parse` | — | **All 2696** shipped modules parse | `node tools/check_parse.mjs` |
| `check_newton` | — | **60 checks, 0 failed** ("All NEWTON checks pass") |
| `check_walkable` (`--no-browser`; the app's parked boxes now skip the lots) | 2,720 passed (ROBO-EXTERIORS' figure) | **2,720** passed, 0 failed | `node tools/check_walkable.mjs --no-browser` |
| `check_dean` (reads the shared export) | 3362/3362 (ENV-HD-2's figure) | **3362/3362** | `node tools/check_dean.mjs` | `node tools/check_newton.mjs` |

## Captures
All 1920 × 1080 from the built parishes page (desktop high tier, headless Chromium with SwiftShader), the page's buttons hidden
for the still. Drive 3 (`node tools/drive_hd3_scenes.mjs 9112 high $SP/loop10/hd3`): 12 captures, 0 failed, page errors 0,
external requests 0, 773 s at load 8.3 → 15.0; drive 4 re-shot the Orleans street pair after its camera fix
(`… street port-terminal`). Every frame was looked at. The wide shots are the strongest for the deck (the bridge yard under
the suspension bridge, the port terminal's sheds and cranes, the construction site among the campus blocks); the street shots
are eye-level approaches across each yard, with DETAIL's yard props in the foreground. The first run's frames (with the
buttons, and the old street camera) are in `$SP/loop10/hd3/run1/`; the two blocked Orleans street frames are in `rejected/`.

| still (`$SP/loop10/hd3/`) | preset id (`__parishTest.scene`) | time | draw calls | triangles | drive |
|---|---|---|---|---|---|
| `sf-marina-bridge-wide-day.png` | `bridge-yard:wide` | day | 94 | 149,640 | drive3 (ok) |
| `sf-marina-bridge-wide-night.png` | `bridge-yard:wide` | night | 95 | 153,280 | drive3 (ok) |
| `sf-marina-bridge-street-day.png` | `bridge-yard:street` | day | 202 | 178,302 | drive3 (ok) |
| `sf-marina-bridge-street-night.png` | `bridge-yard:street` | night | 203 | 174,572 | drive3 (ok) |
| `orleans-port-wide-day.png` | `port-terminal:wide` | day | 135 | 145,401 | drive3 (ok) |
| `orleans-port-wide-night.png` | `port-terminal:wide` | night | 137 | 173,665 | drive3 (ok) |
| `orleans-port-street-day.png` | `port-terminal:street` | day | 259 | 154,110 | drive4 (ok) |
| `orleans-port-street-night.png` | `port-terminal:street` | night | 261 | 178,782 | drive4 (ok) |
| `sf-mission-construction-wide-day.png` | `mission-bay-construction-site:wide` | day | 148 | 150,531 | drive3 (ok) |
| `sf-mission-construction-wide-night.png` | `mission-bay-construction-site:wide` | night | 149 | 155,647 | drive3 (ok) |
| `sf-mission-construction-street-day.png` | `mission-bay-construction-site:street` | day | 148 | 159,798 | drive3 (ok) |
| `sf-mission-construction-street-night.png` | `mission-bay-construction-site:street` | night | 156 | 160,072 | drive3 (ok) |

## Cycles
1. Reason: the ten unskinned styles take the set without a new mesh, and every room stays inside its texture budget with
   everything in it counted; proof = `check_room_skins` (25 of 25, counts identical, bytes ≤ budget). Act: the kitchen's
   stainless variant, the hall set (plank floor), the LA rooms and TYCOON's rooms in `HD2_SKIN_STYLES`; the checker builds the
   LA rooms with LA-ROOMS' dressers on a map that opens them. Observe: the first count found the LA rooms carry 6–15 name-sign
   canvases each that headless builds never allocate — on balanced they are 3.2–6.0 MiB before any skin. Fail as planned →
   the skin became budget-aware (`hd2RoomBytes`, floor then walls then metal, each only while it fits) and the checker computes
   the expected maps independently. "ROOM-SKINS: all 382 checks pass"; `check_la_rooms` 3787, `check_interiors` 925,
   `check_classrooms` 2057. Pass; committed 498629ee.
2. Reason: San José 9,7 sits at 6 of 6 meshes on high because generic and robotics towers are separate instanced meshes;
   proof = `check_exteriors` prints the worst robot-site chunk on high below 6, `check_facades` keeps 68 of 68 and the phone
   tier identical. Act: `fcBakeKind` (one world-space mesh per kind where buckets meet, off the phone tier), the tower canopy
   as a base item and the tower roof plant as a roof item (`fcDetailPlace`). Observe: San José 9,7 4+2 → 2+2; worst on high 5
   (Orleans warehouse 10,8); "FACADES: all 2977 checks pass" (canopies 28 of 28, 14 merged chunks, roof plant 2.40 m on any
   height); "ROBO-EXTERIORS: all 260 checks pass". Pass.
3. Reason: FACADES' kits are in the TradeQuest export; proof = `check_bridge`'s fresh-build comparison. Act: `node
   tools/export_shared.mjs`. Observe: 138/139 → 139/139. Pass; committed with cycle 2 (3a356ceb).
4. Reason: parked vehicles and street life must never stand in a robotics lot; proof = a count inside the lots before → 0 in
   `check_motorworks` and `check_menagerie`, both printed. Act: the `lots` option in both modules, the app passing
   `dtLotRects(parish)`. Observe: vehicles 2 → 0 (la-meta-richland's data-hall vehicle stood in the data centre's lot on
   balanced and high); animals 0 → 0 in the checker's plans — then measured again with the page's CITYWORKS seams (0 → 0) and
   with agents chased towards a lot (0 of 6 stepped in). Pass; committed 13f50858.
5. Reason: six establishing-shot presets for the busiest non-robot sites; proof = `check_exteriors` (18 presets, station
   counts, framing, wiring). Act: `hd3-scenes.js`, the scene handle's route, `scenePresets()`. Observe: one FAIL — the wiring
   check's `\b` had become a backspace character through a shell-quoted edit; fixed in the file. "ROBO-EXTERIORS: all 278
   checks pass". Pass; committed a9e6a8f5.
6. Reason: stills good enough for the deck; proof = the drive's ok lines, page errors 0, external requests 0, and looking at
   every frame. Act: `tools/drive_hd3_scenes.mjs` over a rebuilt bundle (`python3 tools/bundle_webxr.py`). Observe: "12
   captures, 0 failed, page errors 0, external requests 0, 571 s, load 13.31" — but looking at the frames, the street shot
   stood inside the yard behind a crate, the page's buttons sat over every still, and the construction site's wide shot was
   framed between two campus blocks filling its near corners. Fail → the street camera moved to the near sidewalk of the
   nearest street, the wide shot prefers a spot with no building within about 18 m, and the drive hides the page's buttons
   for the still (committed 7bb9c100).
7. Reason: the same proof on the fixed presets. Act: rebuild the parishes bundle, drive again. Observe: "12 captures, 0
   failed, page errors 0, external requests 0, 773 s, load 15.03"; looking at the twelve frames, eleven read well and one pair
   did not: the Orleans street camera stood behind the site's own building (the solver skipped that building as the subject),
   a grey wall across the frame. Fail → the street camera and its sight line now count the site's own building (a probe of
   NEWTON's colliders on the three sight lines: no hits); re-shot that pair: "2 captures, 0 failed, page errors 0, external
   requests 0, 113 s, load 10.56"; looked at: the yard at eye level, a worker in a hi-vis vest, the river bridge behind. Pass;
   committed e0afd3ce.

## Seams
- `hd2-room-skins.js`: `HD2_SKIN_STYLES` (25 styles; `set: "industrial" | "tile" | "hall"`, optional `metal` prop kinds),
  `HD2_SIGN_BYTES`, `hd2RoomBytes(group, tier)`, `hd2SkinRoom(...)` now returns `{ style, set, res, maps, skipped, bytes,
  budget }`.
- `fc-facades.js`: `fcDetailPlace(kind, id) -> "body" | "roof" | "base"`; `fcKit(...)` returns `{ ids, body, roof, base }`;
  merged chunk meshes are named `fc-<kind>-merged` with `userData.fcGroups = { <group>: spots }`, `userData.fcKit` (the union
  of detail ids) and `userData.fcOwned` (the group's `dispose()` frees their geometry). A reader that counted robotics
  buildings by `/-robotics$/` InstancedMesh names must also read `fcGroups` (as `check_facades` and `drive_hd2_captures` do).
- `mv-world.js`: `MV_LOT_MARGIN`, `mvInLots(x, z, lots, m)`, `mvPlacements(parish, world, { tier, lots })`,
  `mvMountMotorworks({ …, lots })`. `mg-life.js`: `MG_LOT_MARGIN`, `mgLotBoxes(lots, m)`, `mgPlan(map, { …, lots })`,
  `mgMountLife({ …, lots })`. `lots` = `[[x0, z0, x1, z1]]` (DETAIL's `dtLotRects`).
- `hd3-scenes.js`: `HD3_SHOTS`, `HD3_SCENE_SITES`, `hd3Scene(parish, siteId, shot)`, `hd3ScenePresets()`; bundled after
  `fx-exteriors.js` in the parishes bundle. `window.__parishTest.scene` and `.scenePresets()`; `?scene=<siteId>:<shot>`.
- The committed `WebXR/{parishes,bayworld}/dist/*.html` and `WebXR/dist/{parishes,bayworld}.html` were rebuilt for the drive
  and restored; the coordinator's integration rebuild carries these changes.

## Left
- **The LA rooms on balanced**: LA-ROOMS' name signs (512 × 120 canvases, 6–15 a room) put the six Louisiana rooms at
  3.2–6.0 MiB on balanced before any skin, over the 3 MiB room budget; the skin adds nothing there. An atlas per room (or the
  phone-size signs on balanced) would bring them in (`tools/briefs/next/hd3-next.md` item 1).
- **The merged kind mesh's memory**: `fcBakeKind` holds each spot's parts in world space (no instancing) in the 14 chunks where
  variants meet; its geometry bytes per chunk are not yet measured against a stated byte budget.
- **More scenes**: parks, fire stations, hospitals and schools are the next busiest kinds; a door shot at a site building.
- **Not run here** (the shared machine): `check_mobile` (it drives the dist pages and rewrites `docs/perf/phone-maps.json`),
  `check_walkable`'s browser leg, `eval_worlds`. The phone tier's facade build is proven identical by `check_facades` §7, and
  the phone rooms only take maps that fit the existing budget.
- `check_room_skins`' baseline row is still ENV-HD-2's estimate (to re-measure on a quiet gate).
