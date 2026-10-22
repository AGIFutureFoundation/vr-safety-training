# Memory: ENV-HD-4 (loop 10, round 4, `hd4`, port 9123)

- Base de429b36 (fast-forward; round 3 merged, ENV-HD-3 included). Branch `worktree-agent-ac6731bb907776b59`.
- **Ultra (item 1).** `hd4-ultra.js`: `hd4UltraAllowed` (desktop high only: not the phone tier or a coarse pointer or a
  screen under 600 px, not balanced, not a headset UA — OculusBrowser, PICO, Quest, Wolvic, Mobile VR — not in XR),
  `hd4UltraChoice` (`?ultra=1|0`, else localStorage `holodeck-ultra-v1` = "on", else off), `hd4MountUltraToggle` (the Me
  tab, after "Reduced motion", 44 px, hidden where not offered; switching reloads without `?ultra`). With Ultra on the app
  passes `atlasPx: 2048` to `fxMountExteriors` (ignored off the high tier), mounts `hd4MountUltraSites` (one merged mesh a
  site: roof railings, roof plant with fans and louvres, a cat ladder; the construction site's slab-edge guardrails and
  stair tower) and `hd4RegisterDressers(..., { ultra: true })` swaps each robot room's floor and walls for 2048 px
  (`ixrFloorTexture`, `ixrSetTexture("concrete")`) and adds trusses and cable trays (two instanced meshes).
  `HD4_ULTRA_BUDGET`: 24 MiB facade atlas a map, 64 MiB a room, +1 mesh / 6,000 tris a site, +2 meshes / 2,500 tris a room.
- **Looks (item 2).** `hd4-looks.js`: `HD4_LOOKS` dawn/day/dusk/night/fog (dawn, `fogScale` 0.4)/rain (dusk, 0.7). The app's
  `NP_WEATHERS` gains "rain" last (indices carried across maps keep their meaning). `hd4ApplyLook(look)` in app.js sets
  `np.timeIdx`/`np.weatherIdx`, runs `npApplySky()` (which calls `hd4Sites.set`), re-mounts life when night flips, and draws
  the fog in by `hd4LookFog` (floor 180 m = 3 × AT_BOARD_READ). `__parishTest.scene(siteId, shot, look)`;
  `?scene=site:shot:look`; `__parishTest.hd4.lookPresets()` = 36. Site lights (high tier, not a headset): 3 merged meshes a
  map (masts; lamp heads and dock lamps, MeshBasic dimmed by day; pools and lamp glares, additive vertex-colour fans), the
  fx atlas material's emissive follows `hd4LightLevel`, and `hd4WetUp` patches the fx materials and the masts (up-facing
  darkening + cool sheen by `uHd4Wet`). sky.js maps the string "dawn" to day: the app now passes the hour 5.5 at dawn
  and `hd4DawnSky(sky.root)` turns that dome half round (sun in the east) and tints it 0xd6c6ff (rose-violet), so dawn and
  dusk read apart (the sun light itself is unchanged).
- **Rooms (item 3).** `hd4-rooms.js`: `hd4LightRoom` (high, not a headset): LED panels between the shell's lamp columns,
  a pendant over every station pad (and every ops console) with a floor pool, three wall beacons in robot rooms, one
  SpotLight (`hd4-task-spot`, at `HD4_ROOM_TARGETS[style]`) → 3 lights. The ops room `hd4-hive-ops` is an INTERIORS style
  (IX_STYLES + IX_FEATURES in ix-interiors.js, the tile skin in HD2_SKIN_STYLES): `hd4DressOps` puts seven consoles in an
  arc (radius 5.6 m round (0, −6.4)), screens = one canvas (2 × 4 cells of 2:1; 1024 px on high, 256 elsewhere), the video
  wall either side of the shell's honesty sign (1024 × 256 / 256 × 64), seven agent spots (one per role) 1.8 m behind the
  consoles, desks and chairs as colliders. Door: `hd4OpsDoor` 3 m along the wall from the dispatcher's home site's robot
  room door (`hd4OpsHome()` = rb-site-west-oakland-warehouse), its own list `hd4OpsDoors` (check_robo_interiors greps the
  `for (const dd of ixrDoors)` loop, so the ops door has its own loop).
- **Gotchas.** The bundler refuses a top-level name declared in two modules (hd4MiB → hd4OpsMiB); check_hd4 now checks it.
  sky.js cannot be imported in node (three.js from its CDN URL): the checker reads its source. A shell-quoted multi-command
  with a glob or a computed node argument is refused by the worktree guard: one plain command per call.
- **Drives** (`tools/drive_hd4_scenes.mjs`, port 9123, JPEG q92 stills in `$SP/loop10/hd4/`): B = West Oakland's two sites ×
  six looks + seven lit rooms (19, 0 failed, page errors 0); C = Ultra (`?ultra=1`): the warehouse at night + seven rooms
  (8, 0 failed; facade atlas 22.67 MiB allocated, rooms 49.33–54.67 MiB; frame time within noise of high under
  SwiftShader); D = the other four maps × six looks + the rooms re-shot after the pool/beacon/title fixes. Looking at the
  frames found what the checker could not: dawn's midday sky, invisible flood heads, buried pools, white pool ellipses in
  the rooms, a clipped sign title.
- The dist bundle was rebuilt for the drives and restored (the coordinator's integration rebuild carries the changes).
