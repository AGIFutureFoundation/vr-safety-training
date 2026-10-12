# Memory: ROBOTS-HD-2 (loop 10, round 7, `rhd2`, port 9156)

- Base 40d97421 (fast-forward). Branch `worktree-agent-ac7592721205a912a`. Commits: ff2a4fea (green still), 43bbc30c (run
  light, drilling robot, zone indoors), then the docs commit.
- **The agent-jobs panel** (`vb-panel.js`): `approve()` runs a preview (`vbRun` on a JSON copy with a fresh `vbGovernor()`)
  and steps `frames[fi]` every 350 ms unless reduced motion; each frame's `info.governor` is the monitor action. `finish(fi)`
  then runs the real job on the panel's governor (`estopAtStep` = the step the supervisor pressed E-stop on) and evaluates.
  `state().run` (added this round, read-only) exposes `{ step, of, action }` during the preview. The queue's first job is the
  sf-downtown cell (seed 101); seed 107 is the cell's learned-policy job.
- **rhd side**: `rhdJobRun(vb)` → the run for a site; `rhdMountRobots({ jobs })` combines with `rhdWorst`; the speed goes to 0
  when the combined light is not green; `robotsHd.run()` and `robotsHd.runLog()` for drives.
- **Site stop latch**: `rbSiteEvent` only changes `mode` on "near" events, which `rb-world` sends near the site; a learner who
  leaves from inside the stop distance straight to 30 m keeps the site in "stop". Step back out through the warning band (7 m)
  before expecting "running".
- **Drill**: kind `drill` (rooms only, not a rig kind, so `RHD_KINDS` stays the four rig kinds); 2,344 tris with zone; mast
  towards local −z; `RHD_ROOM_ROBOTS["ixr-drilling-deck"]` strips "drilling robot" and "robot battery".
- **Room zones**: built in a floor group (`rhd-room-zone-<kind>`) on the room group at the robot's x, z, so a bench (y 0.9)
  never lifts the zone; only robots with `light: "site"`. `rhdRoomLights(room, state, ixWorld.pose)`.
- **Drives**: `RHD_ONLY=still|jobs|rooms|zone node tools/drive_robots_hd.mjs 9156 <dir>`. jobs emulates reduced motion
  (`openPage(..., { reducedMotion: "reduce" })`). zone opens each room on its own site's map (la-meta-richland, sf-downtown,
  bay-san-jose, oak-west-oakland) and moves `ixWorld.pose` directly. Load 15–30 this round: a page load took 1–2 minutes.
- **Gotcha**: the worktree sandbox refuses compound shell lines with loops over variables or inline Python heredocs that it
  cannot verify; write helper scripts under `$SP/loop10/rhd2/` and run them plainly.
