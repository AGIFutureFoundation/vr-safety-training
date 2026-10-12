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
