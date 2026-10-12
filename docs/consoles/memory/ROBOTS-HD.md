# Memory: ROBOTS-HD (loop 10, round 6, `rhd`, port 9144)

- Base 230105b7 (fast-forward). Branch `worktree-agent-ac54278335ff01c76`.
- **Where the robots are.** Outdoors: `rb-world.js` `rbDrawRig(T, g, kind, lean, add, mat)` draws a rig group `rb-rig-<kind>`
  into the site group; `rbPoseRig` moves the whole group (AMR ellipse 5 × 3.5 m with `rotation.y = -phase`, so its forward is
  local **+z**; gantry `position.z = sin(phase) * 4`; arms `rotation.y` sweep). The cell's box fence is on the site group, not
  the rig. Indoors: `ixr-robo-interiors.js` `ixrPartsFor` draws each room's robot as tagged instances in shared instanced
  meshes (`im.userData.ixrTags`), so a dresser can compact them out by tag.
- **What drives the light.** The site state (`rbSiteEvent`: `mode` full/reduced/stop, `estopped`, `locked`) is the page's own
  SSM state; `rbWorld.state(id)`. The VBRIDGE governor (`vb-governor.js` `monitor`) returns `continue | slow |
  protective-stop | estop` per job step; it is not tied to the site rigs in the page today. `rhdLightState` takes either.
- **Module** `rhd-robots-hd.js`: `rhdKit` merges parts into one non-indexed geometry with vertex colours (+ uv); one shared
  `MeshStandardMaterial` (`rhd-body`) for every robot body; status light `MeshBasicMaterial` with vertexColors (dark parts
  stay dark); zone = a ring and a circle, transparent, `visible` toggled. Arm links: `turret` (yaw, unused — the rig sweeps)
  → `upper` → `fore` → `wrist`, each pitching about x, keys `RHD_ARM_KEYS`, smootherstep. `scale` 1.45 for the heavy arm;
  `pedestal: false` for bench and stand mounts. AMR wheels: one link `rhd-amr-wheels` (both wheels on one axle), `roll(d)`
  keeps `rolled` metres.
- **App** (`WebXR/parishes/js/app.js`): import beside rb-world; `rhdRegisterDressers` right after `ixrRegisterDressers`
  (before `hd4RegisterDressers`, whose check_hd4 regex only orders hd4 vs hd2); `rhdMountRobots` right after
  `rbMountRobotics` → `window.__parishTest.robotsHd`; frame loop: `rhdWorld?.tick(dt, np.x, np.z)` right after
  `rbWorld?.animate`, then `rhdRoomLights(ixWorld.room, rbWorld?.state(ixWorld.room.ixr?.site))` when a room has HD robots.
- **Bundler**: `rhd-robots-hd.js` after `ixr-robo-interiors.js` in the parishes list. Not in `DIST_SHARED` (only the
  parishes page uses it).
- **Checks**: `check_robots_hd` 42 passed; `check_robotics` 19 / 0, `check_robo_interiors` 302 / 0, `check_hd4` 127,
  `check_vbridge` unchanged line; `check_imports` 1,128 modules, `check_parse` 2,707, `check_newton` 60 / 0.
- **Drive**: `node tools/drive_robots_hd.mjs 9144 <dir> [ultra]` — three maps for the four kinds, then the six rooms signed in
  (`localStorage vr-training-auth-v1`) so `__parishTest.hiveWorld.room().placed` shows the agents, then balanced. On a
  loaded machine (load 8–9) it takes about 10 minutes. The amber still freezes the learner's position for the site by
  wrapping `robotics.animate` and `robotsHd.tick` in the page (a drive-only trick) so the camera can back out.
- **Gotchas**: `standAt` must measure the learner from the **site centre** (the SSM distance), not from the robot; the
  gantry and the AMR draw the same number of calls as today's rigs (4 / 3) — they add triangles, not calls.
