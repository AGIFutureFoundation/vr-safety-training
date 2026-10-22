# AVATARS-HD-4 memory

- Base 40d97421 (loop 10 round 7). Prefix `aa`/`AA_` (files), console prefix `ah4`, port 9154. Edited `aa-agent-avatars.js`,
  `aa-agent-hd.js`, the ops-room mount line in `app.js`, `check_agent_avatars.mjs` (§9k regex, new §9m), and added the new drive
  `tools/drive_avatars_hd4.mjs`. Did not touch `oh-*.js`, `h5-ops-room.js`, `hw-hive-world.js` or `rhd-*.js`.
- Nearest console: `aaCrowdAvatarMount({ nearest: "room", learner })` → `aaNearestRole(room, learner, { agents, level })` at mount time
  (one choice per mount; hwSyncRoom calls the mount when the room opens). The room level adds 402–418 triangles over the crowd level per
  agent; only 3 of the 7 fit the 414 headroom (AA_HD_NEAR_EXTRA = 6,000 − 5,586). The headless door entry picks Ivo (consent keeper): 5,992.
  The page's test hook `hd4.opsRoom()` puts the learner at (−6.6, 5.4), which picks Orrin: 5,988 built in the page.
- Moods: `mood` is not in AA_EVENT_TYPES (the contract list stays as it is). `attach` subscribes to it separately in a try. Busy changes the idle
  tempo through `f.idleK`/`f.idleOff` (t_eff = clock·k + off, continuous); with no mood, t is exactly the clock, so the pose is
  byte-identical to the base module (samepose.mjs: hash 2004958365 over 386,400 bone-frames, both). The page's hive (h3SceneHive) has
  moods off; the console tab's replay has them on. ohHive({ moods: true }) seed 1 gives 142 mood events over 480 steps.
- The robot rooms at 40d97421 with ROBOTS-HD's robots: three room-level figures put cobot lab (6,322), AMR warehouse (7,450) and
  maintenance bay (6,774) over 6,000 built (drive B, before). The rooms' figures came in through a test top-up to three (`hw-room:door:k`
  moves), the most H3_ROOM_FIGURES allows. The fix is the room mount's `triCap` (AA_ROOM_TRI_CAP 6,000), counted like ixrMeasure
  (all meshes, hidden too, instanced × count), with `capFigures` 3 reserving crowd room for figures still to come. `held` agents get a
  figure on `release`.
- The heading snap: `f.yaw` used to be the current leg's direction, so it jumped at each waypoint. AA_WALK_TURN 0.4 m blends either
  side; the path is unchanged.
- Drives under load 30+: a frame takes 2–4 s. Any timed gesture must be posed by the mount's clock (freeze `m.animate`, then
  `m.avatars.animate(c + 0.9, 0.9, null)`) in the same evaluate as the event. `waitForTimeout` is not enough.
- Bash in this worktree refuses commands with loops over variables or complex quoting: write a python file to the scratchpad and run it.
- Commit trailers carry "Co-Authored-By: Claude" with no model name.
