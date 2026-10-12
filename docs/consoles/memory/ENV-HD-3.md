# Memory: ENV-HD-3 (loop 10, round 3, `hd3`, port 9112)

- Base 41e41366 (fast-forward). Branch `worktree-agent-ac95b6c7d2798968a`.
- **Rooms (item 1).** `hd2-room-skins.js` now skins all 25 INTERIORS styles. New: kitchen (tile set + stainless: brushed
  metal on counters, hoods, racks, cabinets via `HD2_SKIN_STYLES.kitchen.metal`), a third set "hall" (plank floor + block
  wall) for the union hall, the Louisiana crafts hall and the rented room, the six LA-ROOMS rooms (hangar, fab shop and
  compressor industrial; data hall and control room tile), TYCOON's shop (tile). The skin is budget-aware: `hd2RoomBytes`
  counts the shell's two signs and LA-ROOMS' name-sign canvases (headless they are flat panels, so they are counted by mesh:
  `lar-sign-*`), and a map is set only while the room stays inside `HD2_TEX_BUDGET`, floor first, then walls, then metal.
  On balanced the six LA rooms were already 3.2–6.0 MiB (name signs at 512 × 120), so the skin adds nothing there; on low the
  crafts hall and the fab shop take the floor only.
- **Facades (item 2).** `fcDetails` merges a kind into one world-space mesh (`fc-<kind>-merged`, `userData.fcGroups`) off the
  phone tier when its spots fall in more than one kit bucket or its kit has base items. Robotics towers: `canopy` detail
  (base item, unstretched at the foot) and the tower roof plant as a roof item (2.40 m tall on any tower). `fcDetailPlace`
  says where a detail draws. Worst robot-site chunk on high 6 → 5; San José 9,7 4+2 → 2+2. Export regenerated.
- **Lots (item 3).** `mvPlacements(..., { lots })`, `mvMountMotorworks({ lots })`, `mgPlan(map, { lots })`,
  `mgMountLife({ lots })`; the parishes app passes `fxLots = dtLotRects(parish)`. Vehicles in lots 2 → 0 (la-meta-richland
  data hall); animals 0 → 0 (now enforced, and walking never steps in).
- **Scenes (item 4).** `hd3-scenes.js`: three busiest non-robot sites (bridge yard sf-marina 7 stations, port terminal orleans 6,
  construction site sf-mission 6) × "wide" / "street"; `__parishTest.scene` routes them; `__parishTest.scenePresets()` lists
  all 18. Stills via `tools/drive_hd3_scenes.mjs` (hides the HUD overlays for the still).
- Gotchas: a `python3 -c "..."` edit with `\\b` in a JS regex wrote a backspace character (bash leaves `\\b` as `\b`, Python
  reads it as backspace): write edit scripts to a file instead. `drive_hd2_captures.mjs` counted robotics buildings by
  `-robotics$` InstancedMesh names; merged meshes carry `userData.fcGroups` (fixed there).
- The dist bundles were rebuilt for the drive and restored (the coordinator's integration rebuild carries the changes).
