# LESSONS-X-2 memory (loop 10, round 9)

- **The passport record is the real try.** `ppRecordStation` (shared/passport.js) stores `score` and `debrief: s.debrief()` from
  `game.js`: `debrief.steps` is the station's own step log (`id`, `corrections`, `hazards`, `clean`, `seconds`, `points`). A run
  that stopped early logs only the steps it reached, so the station's later steps are misses too. `ppRecords()` is in order; the last
  record for a station is the run just finished. The parishes page knows the robot site it returned from: `npReturnSiteId` is an
  `rb-site-…` id when the station was launched from a robot site (`stationHref` → `npLink(id, siteId)`).
- **The INTERFACE menu:** a new control is a `<div id="menu-…">` inside a tab panel of `WebXR/parishes/parishes.html`, plus the id in
  `UX_TAB_MOUNTS` of `tools/check_interface.mjs` (else "every mount id reachable from its tab" cannot see it). `check_interface`
  takes `UX_PORT=<port>` and about 3 minutes at load 30.
- **Reaching a site:** nothing in the page says "arrived"; poll `np.x, np.z` against the site's `position` while `np.playing` and
  `!ixWorld.inside()`. A 9 m radius matches the job board's prompt distance (`npNearest`).
- **A figure in a room** is `aaRoomAvatarMount()` called the way `hwMountRoomAgents` does: `parent: room.group`, `siteAt` answers
  only the room's own pseudo-site ids (a real site id → the figure waits unbuilt), `spotFor` gives the spot. `room.agentSpots` is
  on every ACCESS room (`IX_AGENT_SPOTS`, two per room); `room.id` is the style id. The mount counts the room's triangles first
  (room level under 6,000, else crowd, else held).
- **The bundler refuses a module whose import is not in the app's list**, so per-world pack data cannot simply replace
  `lx-packs-data.js` while `lx-lessons.js` imports it. A split needs a registry (`lxPacksRegister`) in the core data file and
  per-world files that call it, listed after it.
- **The drive's robot-cell teleport** (4 m south of the site position) lands the camera inside the cell; the figure stands at the
  site's agent spot about 25 m away. Teleport to the spot (`__parishTest.agentAvatars.state(id).at`) for a close still.
- A room lesson and an outdoor (armed) lesson can overlap unless one stops the other; `lxRoomSync` stops the outdoor run.
