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
   found the fallback camera outside every box, above every roof. `check_bridge` 139/139. Pass.

## Seams
- `lar-rooms.js`: `LAR_SIGN_PX` (`{ high: [512, 120], balanced: [256, 60], low: [256, 60] }`), `larSignMaterial(THREE, text,
  tier)` (was `low`).
- `hd2-room-skins.js`: `HD2_SIGN_BYTES.balanced` = 256 × 60 × 4 × 4/3.

## Left
