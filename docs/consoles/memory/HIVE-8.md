# HIVE-8 memory (`h8`, loop 10 round 8)

- Base a10f1ff8 (fast-forward). Branch: the worktree branch. Port 9162. Scratch: `$SP/loop10/h8/` (drive `drive_h8.mjs <repo> <out>
  <tag> [AB]`; scene on/off `scene.mjs <repo>`; digests `digest.mjs <repo> <baseDir>`; briefed jobs lost `lost.mjs <repo> [seeds]`).
- Ownership: `oh-*`, `h5-*`, `h6-*` and the page's hive options (`app.js` hive lines, `h3SceneHive`); never `aa-*.js`.
- The page has two hives. The **panel's** (`window.__parishTest.hive.hive`, `ohMountHive`) has had `moods: true` since HIVE-6 and
  feeds the ops room, robot rooms and outdoor figures. The **scene's** (`h3SceneHive`, played via `h3SceneRelay`) runs while
  `hiveScene()` plays; `hwSync` follows `h3Scene.relay` then.
- The relay must release a mood with its cause (`follows`), or `releaseRun("bid")` would stop at a mood.
- `aa` mounts keep `state(id).mood` null until the first mood event (no seeding); `h5MountOpsRoom` seeds the glow from
  `source.mood(id)`.
- `briefSaid` entries: `{ jobId, t, done, lost }`. `done` is set at the agent's first award or by `briefLost`.
- The page drive: in software rendering a 1920×1080 screenshot can take 30–150 s, longer than the 27 s scene.
- The usage limit stopped the session at about 20:36. It resumed at 21:27; the dist was rebuilt and restored.
- Commit trailer: `Co-Authored-By: Claude <noreply@anthropic.com>`.
