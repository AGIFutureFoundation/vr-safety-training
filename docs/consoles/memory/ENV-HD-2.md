# ENV-HD-2 memory (loop 10 round 2, prefix `hd2`, port 9103)

- Base f4884d71 (fast-forward). Branch `worktree-agent-a9ba36692c4f14d98`.
- **FACADES resolver** (`fc-facades.js`): `FC_KIT_RESOLVERS` is an array of `({ parish, kind, spot, group }) -> group | null`,
  consulted per spot inside `fcDetails`' bucketing; the first non-null group that names a kit of the kind wins. The built-in
  `fcRoboticsGroup` reads `RB_SITES` (anchor + offset on the parish's sites, cached per map in `fcRobotCache`) and returns
  "robotics" for sheds and towers within 150 m. After resolving, a variant whose details on this tier equal the default kit's
  (sorted ids) folds back into the default bucket: that is how the phone tier stays byte-identical (the robotics kits keep
  windowBand + rollUpDoor for sheds, cornice + mullions for towers as their two cheapest).
- Robotics kits live in unit-height space (no roof mesh): roof plant heights are per kind (`hu` 0.16 on a shed, 0.03 on a
  tower). Cheapest-first order is by `fcDetailTriangles` (shed 4/6/36/48/108, tower 12/32/36/48); `check_facades` §7 proves the
  full order, not only the phone pair.
- Changing `FC_KITS` or `FC_DETAIL_KINDS` makes `exports/shared/holodeck-shared.json` stale: run `node tools/export_shared.mjs`
  and `node tools/check_bridge.mjs`.
- **DETAIL lots** (`dt-detail.js`): `dtLotRects(parish)` = each fx layout's `lot` AABB plus its `boxes`, cached by parish id;
  per chunk the touching rects (grown by `DT_LOT_MARGIN` 0.5 m) go into a Float64Array; `put` returns after its four random
  draws and before the tier tally when (x, z) is inside one. 834 props stood inside the six lots at high before (probe:
  `$SP/loop10/hd2/probe-dt.mjs <module>` — run it on a copy of the base module placed in `WebXR/shared/` and delete the copy).
- **Room skins** (`hd2-room-skins.js`): a dresser per style (IX_DRESSERS holds arrays, so it adds to CLASSROOMS'/LA-ROOMS'
  dressers rather than replacing them); it only sets `.map` on `ix-floor`, the shared wall material (`ix-wall-0`'s, all four
  walls) and `ix-dress-(rack|machine|tank|cabinet|hood)`. Floors: industrial = `ixrFloorTexture(..., marks)`, tile =
  `hd2TileFloor`; walls: `ixrSetTexture("concrete")` or `hd2BlockWall` (cached base, a clone per room for the repeat).
  ix-interiors' exit disposes every map, so a room's canvases do not pile up.
- Texture bytes in a room (high): floor 5.33 MiB + wall 5.33 + metal 5.33 + two 512 × 256 signs 1.33 = 17.33 MiB (tile rooms
  without metal props 12.00); 256 px tiers 3 × 0.33 + 1.33 = 2.33 MiB. Headless, ixr/hd2 make same-size stubs so the bytes are
  still measured; the shell's signs are added from `IXR_SHELL_SIGNS` (no canvas headless).
- Capture presets: `__parishTest.hd2.room(styleId)` (corner camera, yaw = atan2(2x, 2z) from the door-side corner) and
  `__parishTest.hd2.hood(siteId)` (fx wide shot pushed back 110 m and up 62 m; uses `fxShot`, so walking ends it).
  `tools/drive_hd2_captures.mjs <port> <tier> <outDir> [siteId]` writes the stills.
- Dist: `python3 tools/bundle_webxr.py parishes` before a drive; restore `WebXR/parishes/dist/parishes.html` (and the SEO
  files the bundler stamps) before committing — the coordinator rebuilds at integration.
- Pitfalls: the worktree guard refuses shell variables in commands (`$SP`, loop variables) — spell paths out; three.js
  `InstancedMesh` needs one geometry, so a variant in a chunk costs one more mesh on the tiers where its details differ.
