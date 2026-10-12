# HIVE-IN-WORLD memory

- Base f4884d71 (loop 10 round 2). Prefix `hw`/`HW_`, port 9101. Module `WebXR/shared/hw-hive-world.js` (after
  `aa-agent-avatars.js` and `ixr-robo-interiors.js` in the parishes bundle). Checker `tools/check_hive_world.mjs` (34 checks).
  Drive `tools/drive_hive_world.mjs [port]` (rebuild `parishes instructor` first; not in the gate).
- The hive in the page is `window.__parishTest.hive.hive`. `window.__parishTest.hive` is the PANEL's API (step, run, voice,
  supervise, state, captions), which has no `on()` and no `agents`. Round 1's avatar mount read the panel API, so no hive
  agent was ever embodied outdoors. Fixed: read `.hive`.
- Room figures: the crew figure faces +z, and a room spot's yaw is the learner's (0 faces the back wall). So
  `rotation.y = spot.yaw + π` (`hwFigureYaw`). ROBO-INTERIORS' note "rotation.y = yaw" faces the figure away.
- `ixrAgentSpot(room, agent)` must read `agent.key`: OH_AGENTS' `role` is a sentence ("Dispatcher: announces …").
- `ixrMeasure` skipped sprites, so labels and captions were uncounted. Now counted. On the balanced tier the cell hall
  (2.67 MiB of 3) only fits two figures with half-size canvases (`HW_ROOM_TEXTURE_SCALE.balanced = 0.5`): 2.87 MiB.
- The ixr shell's sign canvases are real in the page but size-stubbed headless. check_robo_interiors adds `IXR_SHELL_SIGNS`
  bytes by hand, and so does check_hive_world. Build ixr rooms with `globalThis.document` undefined (the ixr paint crashes on
  the 2D proxy stub), then install the canvas stub for the figures.
- `wkColliderSeam` files a box under the chunk of its CENTRE: a 45 m shed reaches into the next chunk. `hwBoxesIn` reads the
  chunks within 64 m and keeps the boxes that overlap.
- The return link: `lkStationLink(…, { returnHash: "ixr=<style>" })` produces `return=<page>#site=<parish>/<site>&ixr=<style>`.
  `ppReturnSite` still reads `site`. `?parish=<map>&ixr=<style>` opens straight into a room (good for captures).
- Supervise every job: the award-time gate skips `vbApprove` until the learner approves, and a dispatch-time hold catches jobs
  approved under the standing approval before the switch. A physical-path approval re-creates the job under a NEW id (its
  approve line names the first id); map through `jobs()[i].firstId`.
- The governance tab's toast goes to `#sent` in the Live-class view, which is hidden while the tab is open. Use `#ent3-notice`.
- Headless pace: the parishes page runs at about 4 frames a second in software, and dt is capped at 0.05 s, so a 26 m walk
  takes about 26 s. Hold Shift (14 m/s) until 3 m out, and allow 150 s per leg. Use an 800×450 viewport.
- Label fit: the old label sliced the role at 30 characters, drawn centred at 17 px on a 256 px canvas. Now `aaFitFont` plus
  `fillText`'s maxWidth: 14 px for "software agent · safety steward" in the real font.
- Measured: real hive (seed 1, 152 steps): talk 350/350, captions 350/350, moves 30/30. Rooms: 7/7 agents at spots, 18/18
  room-tiers in budget. Supervise: 150/155 → 0/116 without the learner. Walks inside boxes: 1,082/11,000 → 0/11,424
  points; slots 1/42 → 0/42.
