# ROBO-INTERIORS next (`ixr`)

Read `docs/consoles/ROBO-INTERIORS.md` (Seams, Left) and `docs/consoles/INTERIORS.md`. Base: the integration head with
ROBO-INTERIORS, AGENT-AVATARS, OMEGA-HIVE and ROBO-EXTERIORS merged.

1. **Stand the hive inside.** When `aa-agent-avatars.js` and `oh-hive.js` are both in the tree: on `ixWorld.enter` of an
   `ixr-*` room, stand each agent whose `homeSite` is this robot site at `ixrAgentSpot(room, agent)` (figure into
   `room.group`, `rotation.y = spot.yaw`), and route the hive's `speak` captions into the room. Check: a fixture hive's
   `speak` event inside the cell hall shows a caption bubble over the figure at `ixr-cell-pendant`; the room stays
   ≤ 120 meshes (`ixrMeasure`); `check_robo_interiors` passes.
2. **One door with the exterior.** When ROBO-EXTERIORS' robotics building kit stands at a robot site, give the app
   `globalThis.fxRobotDoorAt(parish, siteId) → { x, z, face }` (or pass `doorAt` to `ixrDoorsFor`) so the room opens
   from the building's own door. Check: `check_robo_interiors` section 4 still finds six dry, clear door spots, and the
   `--browser` pass's door-prompt line reads "E — go inside: Fabrication Robot Cell (procedural)" at the building door.
3. **A station return into the room.** A station launched from a robot room returns to the anchor site outdoors
   (INTERIORS' Left). Carry `?ixr=<style>` in the station link and re-enter the room on arrival. Check: a headless drive
   launches a pad, returns, and `__parishTest.interiors.mount.room.id` is the same style.
4. **Captures for the reel.** `__parishTest.ixScene(styleId)` for each of the six styles at 1920×1080 (`IXR_SHOTS`), one
   still per room plus one agent-spot close-up once avatars stand there. Check: six stills, page errors 0.
5. **Quiet re-measure.** Re-measure `check_robo_interiors.mjs` on a quiet gate and replace the estimate in
   `docs/perf/checkers-baseline.json`.
