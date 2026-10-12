# Next for ENV-HD-4 (`hd4`): brief for the next console

Read `docs/consoles/ENV-HD-4.md` (Seams, Cycles, Left) and `docs/consoles/memory/ENV-HD-4.md`, then
`WebXR/shared/hd4-ultra.js` (the Ultra setting and its budget), `WebXR/shared/hd4-looks.js` (the six looks, the site lights,
the wet tint), `WebXR/shared/hd4-rooms.js` (room lighting, the hive operations room and its screens seam),
`tools/check_hd4.mjs` and `tools/drive_hd4_scenes.mjs`.

## Do
1. **Fill the operations room's screens from the hive console.** HIVE-4's "Omega Hive" tab (instructor console) draws each
   agent's card (portrait, traits, voice, queue, last lines) and the evals table. Give it a painter with the seam's shape —
   `(agent, ctx, w, h, kind)` with `kind` "console" (one 512 × 256 cell per agent on the desktop high tier) or "wall" (the
   1024 × 256 video wall, split either side of the honesty sign) — and set `globalThis.hd4OpsPainter` before the room is
   entered, or call `hd4OpsScreens(room).paint(agentId | "wall", painter)` on enter. Words are fine on a screen (they are
   the console's own UI text), never on floors or walls. Check: a headless build with a stub painter paints 7 cells and the
   wall (`check_hd4` §6), and a still of the room shows the cards (`node tools/drive_hd4_scenes.mjs 9123 high <dir>
   oak-west-oakland dawn rooms`).
2. **Stand the hive in the operations room.** `hwSyncRoom` (hw-hive-world.js) only stands agents in `ixr-*` rooms. For
   `hd4-hive-ops`, stand all seven at `room.spots.agent` (one spot per role key, behind its console, `yaw` facing the video
   wall) with AVATARS-HD's figure; the room has 25 meshes on high, so 7 figures must fit `IX_BUDGET` (120 meshes, 6,000
   triangles on high, 3,000 on the phone tier). Check: the room's meshes and triangles per tier with the figures counted.
3. **Ultra beyond the robot sites.** Ultra draws ROBO-EXTERIORS' atlas and the six robot rooms' floor and walls at 2048 px.
   The 19 other INTERIORS styles (ENV-HD-2's skins) and FACADES' generic kits could take it too, inside a stated Ultra
   budget per room and per chunk (today: 64 MiB a room, 24 MiB of facade atlas a map). Check: `check_hd4` §2–3 extended
   (Ultra inside its budget; high, balanced, the phone and the headset unchanged).
4. **A frame time on real hardware.** The capture machine renders with SwiftShader (software): its figures are for
   comparing Ultra against high on the same machine, not a frame budget. Measure `__parishTest.hd4.frameTime(30)` on a
   desktop GPU with Ultra off and on, report the GPU, and state a frame-time budget for Ultra.
5. **Quiet re-measure.** `check_hd4.mjs`'s row in `docs/perf/checkers-baseline.json` is an estimate.

## Rules that bind this work
- Ultra stays off by default and never on the phone tier, balanced, a headset browser or an XR session
  (`hd4UltraAllowed`); the phone and headset tiers build exactly what they built before (`check_hd4` §3).
- Rooms stay inside `IX_BUDGET` with everything counted (lights 3 on the desktop high tier, 1 on the phone); the room
  lighting adds no texture.
- Procedural only; no words on floors, walls or facades; nothing names a company, union or trade body; rooms and sites
  generic by kind; agents are software and say so.
- Single checkers only; never run `tools/check_all.mjs`; never commit `docs/perf/checkers-last.json`,
  `docs/perf/phone-maps.json` or measured timings. Rebuild the bundle (`python3 tools/bundle_webxr.py parishes`) before a
  drive and restore the committed dist files afterwards.
