# Next for ENV-HD-3 (`hd3`): brief for the next console

Read `docs/consoles/ENV-HD-3.md` (Seams, Cycles, Left) and `docs/consoles/memory/ENV-HD-3.md`, then
`WebXR/shared/hd2-room-skins.js` (the budget-aware skin), `WebXR/shared/fc-facades.js` (`fcBakeKind`, `fcDetailPlace`),
`WebXR/shared/hd3-scenes.js`, `tools/check_room_skins.mjs`, `tools/check_exteriors.mjs` (the non-robot scene section) and
`tools/drive_hd3_scenes.mjs`.

## Do
1. **The Louisiana rooms on the balanced tier.** LA-ROOMS draws one 512 × 120 canvas per name sign on balanced (the phone
   tier draws 256 × 60), so the six Louisiana rooms carry 3.2–6.0 MiB on balanced before any skin, over the 3 MiB room
   budget; the skin adds nothing there (`check_room_skins` lists them). Put the names on one atlas per room, or draw them at
   the phone size on balanced, so the rooms fit and the skin's floor fits after them. Check: `node tools/check_room_skins.mjs`
   ("rooms over their budget before the skin … none"), `node tools/check_la_rooms.mjs`.
2. **The merged kind mesh's memory.** `fcBakeKind` bakes each spot's parts in world space where generic and robotics variants
   meet (14 chunks on the five robot-site maps). Measure the geometry bytes per chunk against the instanced form it replaced and
   state a per-chunk byte budget; if a chunk grows past it, fall back to per-instance visibility (one geometry with the union of
   details, an instanced "extras" mesh). Check: `node tools/check_facades.mjs` (one mesh per kind, 68 of 68, phone unchanged).
3. **More establishing shots.** The busiest kinds after construction are parks (214 stations over 54 sites), fire stations (178
   over 46), hospitals (169 over 40) and schools (168 over 43): add one site of each to `HD3_SCENE_SITES` (busiest of its kind,
   generic label), and a "door" shot at a site building's door (`cwDoorOf`). Check: `node tools/check_exteriors.mjs` (presets
   18 → N), then `node tools/drive_hd3_scenes.mjs 9112 high <dir>` after `python3 tools/bundle_webxr.py parishes`; look at
   every still.
4. **Quiet re-measures.** `check_detail`'s generation median and the estimated rows in `docs/perf/checkers-baseline.json`
   (`check_room_skins`) on a quiet gate.

## Rules that bind this work
- Phone and headset budgets do not change: the phone tier's facade build is identical (check_facades section 7), rooms stay
  inside `HD2_TEX_BUDGET` per tier with every texture in the room counted (LA-ROOMS' name signs included).
- Procedural only; no words on floors, walls or facades; nothing names a company, union or trade body; rooms and sites generic
  by kind; the stills show the procedural world only.
- Single checkers only; never run `tools/check_all.mjs`; never commit `docs/perf/checkers-last.json`, `docs/perf/phone-maps.json`
  or measured timings. Regenerate `exports/shared/holodeck-shared.json` (`node tools/export_shared.mjs`) whenever FACADES' kits
  or detail kinds change (`check_bridge` compares it with a fresh build).
