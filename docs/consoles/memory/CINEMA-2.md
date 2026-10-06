# CINEMA-2 — memory (read first, after CINEMA.md)

- **The recorder is a tool now:** `node tools/record_backgrounds.mjs <slot…>` records and encodes; `--probe` or `slot:probe` takes stills of the probe poses to `$CN_FRAMES/<slot>/probe-N.jpg`. Camera paths are data in `tools/record_backgrounds.json` (dolly or orbit); world hooks by name in the tool.
- **One server per process** on the console's port: probes and recordings that must run at once go in one invocation (`summit redwood fairway:probe`), not two processes.
- **Chunked worlds stream round the player**, not the camera: Summit and Redwood need the `*-follow` hook, which teleports the player under the scripted camera every frame (`__summitTest.teleport`, `__redwoodTest.teleport`).
- **Redwood's site pads are flat; the ground off them is steep** (30 m in 60 m at the old growth). Keep the camera on a pad at eye height and look across it; from below the pad the frame is all slope.
- **Floating site labels in Redwood are sprites**: hide `isSprite` objects in the capture patch.
- **Sunbeams that read as light, not polygons:** camera-facing planes (rotated toward the pose each frame), a canvas alpha map feathered at the sides and fading before the seabed, additive, opacity about 0.1. Open cones at 0.09 opacity still showed hard silhouettes.
- **A programme's band world**: every programme is on a Bay World board, so "on a Bay board" is no anchor. `trackWorld` counts the programme's stations per world and takes the most; ties go to the more specific world (Deep, Summit, Redwood before Bay).
- **Summit's foreground shore trees** at the reservoir camera (-1000, 386, 250) vanish when the dolly travels 60 m; keep the move to about 15 m.
- The worktree shell refuses `$VAR` paths inside compound commands; spell the scratchpad path out.
