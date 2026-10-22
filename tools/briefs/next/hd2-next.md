# Next for ENV-HD-2 (`hd2`): brief for the next console

Read `docs/consoles/ENV-HD-2.md` (Seams, Cycles, Left) and `docs/consoles/memory/ENV-HD-2.md`, then
`WebXR/shared/fc-facades.js` (the resolver section), `WebXR/shared/dt-detail.js` (`dtLotRects`), `WebXR/shared/hd2-room-skins.js`,
`tools/check_room_skins.mjs` and `tools/drive_hd2_captures.mjs`.

## Do
1. **Free a mesh where the robotics variant splits a bucket.** San José 9,7 sits at FACADES 4 + kit 2 = 6 of 6 meshes on high
   because generic and robotics towers are two instanced meshes. Merge each kind's variants into one InstancedMesh (one merged
   geometry holding the union of details, with the robotics-only parts collapsed per instance — e.g. a second instanced mesh
   only for the extra parts shared by every variant chunk, or a per-instance scale of 0 on an "extras" instance) so a chunk
   costs one mesh per kind again. Check: `node tools/check_facades.mjs` (§7 still 68 of 68, the phone tier unchanged) and
   `node tools/check_exteriors.mjs` (San José 9,7 ≤ 5 meshes on high).
2. **Towers' ground floor.** An unstretched "base" mesh for towers within 150 m (entrance canopy, lobby glazing), drawn like
   the roof tank (`fcKit`'s `roof` path at y, not y + h). Check: `check_facades` (kits cheapest first, budgets per chunk).
3. **Lots for the other scatter.** MOTORWORKS' parked vehicles and MENAGERIE's animals against `dtLotRects(parish)` (or
   `fxColliders`). Check: a count of each inside the lots, before → 0, in their own checkers (`check_motorworks`,
   `check_menagerie`).
4. **More rooms.** Kitchen (23 sites), the six LA rooms and the union hall take the set (a stainless variant for the kitchen:
   `ixrSetTexture("metal")` on counters and hoods; a terrazzo floor for the civic lobby). Check: `node tools/check_room_skins.mjs`
   (meshes unchanged, bytes inside `HD2_TEX_BUDGET` per tier), `check_la_rooms`, `check_interiors`.
5. **Quiet re-measures.** `check_detail`'s generation median and `check_room_skins`' estimated baseline row on a quiet gate.
6. **Captures.** `node tools/drive_hd2_captures.mjs 9103 high <dir> rb-site-san-jose-robotics-lab` for the towers' look by day
   and night (and any new room), after `python3 tools/bundle_webxr.py parishes`.

## Rules that bind this work
- Phone and headset budgets do not change: the robotics variant must fold back into the generic bucket on the phone tier
  (`check_facades` §7 proves it chunk by chunk); rooms stay inside `HD2_TEX_BUDGET` (high 24 MiB, balanced and low 3 MiB, every
  texture in the room counted).
- Procedural only; no words on facades or floors; nothing names a company, union or trade body; rooms generic by kind.
- Single checkers only; never run `tools/check_all.mjs`; never commit `docs/perf/checkers-last.json` or measured timings; report
  the load beside any timing. Regenerate `exports/shared/holodeck-shared.json` (`node tools/export_shared.mjs`) whenever FACADES'
  kits or detail kinds change.
