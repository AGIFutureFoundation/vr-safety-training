# HIVE-IN-WORLD next (`hw`)

Read `docs/consoles/HIVE-IN-WORLD.md` (Seams, Left) and `docs/consoles/memory/HIVE-IN-WORLD.md` first, then
`WebXR/shared/hw-hive-world.js`, `tools/check_hive_world.mjs` and `tools/drive_hive_world.mjs`. Prefix `hw`. Single checkers
only. Rebuild bundles (`python3 tools/bundle_webxr.py parishes instructor`) before any drive.

1. **Visiting agents inside a room.** Today only agents homed at a site stand in its room. When the hive moves another agent
   there for a job, stand it at a free agent spot, or at the door when both spots are taken, and walk it out on its next
   move.
   - Check: in a seeded run with the room open, the visitor appears inside on its `move` and leaves on the next one.
   - Check: the room stays inside `IX_BUDGET` and `IXR_TEX_BUDGET` with three figures (count them on balanced: half-size
     canvases).
2. **The voice in the room.** With voice on, the room figure's talk light follows `onstart`/`onend`.
   - Check: a drive with a stubbed `speechSynthesis` (one local voice, one network voice): the light is on from `onstart`
     to `onend` for each line, and the network voice is never chosen.
3. **Remember "supervise every job"** per profile, on the device only, beside the voice choice. Show it on the instructor
   console's governance tab with the hive's last ten audit lines (oh-next item 3).
   - Check: the setting survives a reload.
   - Check: `check_console` and `check_enterprise3` pass.
4. **Captures.** `?parish=sf-downtown&ixr=ixr-cell-hall` opens the cell hall with the steward and the auditor standing (when
   signed in). Take 1920×1080 stills of each room with its agents for the reel (`IXR_SHOTS`).
   - Check: six stills.
   - Check: page errors 0.
5. **Routes on the page's own walk-ins.** On oak-west-oakland (two robot sites about 980 m apart) the hive's moves re-project
   and walk in.
   - Check: a drive samples a figure every frame and finds no point inside the walk's collider boxes. Expose `wkColliders`
     read-only on `__parishTest` for the drive.
6. **Re-measure** `check_hive_world` on a quiet gate and replace the estimated row in `docs/perf/checkers-baseline.json`.

## Rules that stay

Agents are software and say so (label, hologram tint, no face). No LLM or network call. On-device voices only, off by default.
Captions always show; nothing listens. The phone tier builds no figures. Room figures stay inside `IX_BUDGET` and
`IXR_TEX_BUDGET` (measure with `ixrMeasure`, sprites included, and add the shell signs headlessly). The governor's rules stand.
Never run `tools/check_all.mjs`; never commit `docs/perf/checkers-last.json` or measured timings.
