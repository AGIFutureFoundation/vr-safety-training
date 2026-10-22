# AVATARS-HD-3 memory

- Base 230105b7 (loop 10 round 6). Prefix `aa`/`AA_`, port 9141. This round edited `aa-agent-hd.js`, `aa-agent-avatars.js`, the ops
  room's mount line in `app.js`, `check_agent_avatars.mjs` (§9k's wiring regex, new §9l) and `check_hive5.mjs` §5's integration guard.
  `h5-ops-room.js` and `hw-hive-world.js` (HIVE's) were not edited: the ops room's figures come through `hwSyncRoom`'s `mount` seam,
  and `h5MountOpsRoom`'s `lite()` leaves an HD figure as built (its geometry is a plain BufferGeometry, so `h5LiteFigure` finds no
  primitive to coarsen; §9l checks before == after). Balanced still gets HIVE-5's lightened standard figure, which it needs for its
  3 MiB.
- The crowd level (`AA_HD_LOD.crowd`): 496–524 triangles, 3 meshes. What it drops against the room level: two trunk rings, two vest
  rings (one reflective band at 1.2 H instead of two), the yoke's middle ring, the neck's middle ring, the limbs' rounded end rings
  (four-point profiles, four-sided arms), the brows and the dark mouth slot (the lit opening still shows the words; the brow and mouth
  bones still move). Head 8 × 5, halo 8 × 3, eyes 3 × 2. The budget: (6,000 − 2,022) / 7 = 568; AA_HD_CROWD_BUDGET is 540.
- The ops room measured headless (§9l, as the page builds it): shell 25 meshes / 2,022 triangles; HIVE-5's lightened figure 88 / 4,878;
  the room level 46 / 8,508; the crowd level 46 / 5,586 (20.25 MiB). The page draws a speaking figure's caption as a sprite; ixrMeasure
  counts meshes only.
- Routing: `aaRoomRoute(room, router)` filters `room.colliders` for hw-hive-world.js's `hwRouter` (passed in, so the aa module imports
  nothing of the hive's). A 0.3 m body + 0.05 m margin: with 0.15 m margin every outer walk bent because the spots stand only 0.42 m
  from their chairs. A straight walk from the door never crossed a console box (0 of 214 over the seeded day, closest 0.65 m mid-walk);
  only the two outer consoles' walks bend (round a chair corner). A walk from the wall side of the arc crosses a console 7 of 7 straight
  and 0 of 7 routed: that is what the router is for if spots or doors move. hwSegBox against AABBs grown by r has square corners:
  measure clearance with a Euclidean point-box distance (§9l samples every 2 cm).
- Mouth timing: `talkWord(id, charIndex, text, atMs)`; aaVoiceHooks passes `e.timeStamp`. The page's onWord (oh-panel.js, HIVE's) does
  not carry the event, so the mount uses `now()` (performance.now) when the boundary arrives. A stamp is `clock + (ms − frameMs) / 1000`,
  where frameMs is now() at the last animate; a stray timestamp more than 2 s from the frame falls back to the frame. `mouthShown`
  shows the newest unseen word at AA_MOUTH_CATCHUP (0.8) when its opening passed between frames. Base 230105b7 at 1 Hz: stamps 0 of 20
  (up to 992 ms off), frames after a new word with the mouth open 0 of 4 (2 Hz: 1 of 8); now 20 of 20, 4 of 4, 8 of 8; 60 Hz 20 of 20
  both (`$SP/loop10/ah3/before.mjs` runs the base module from `git show`).
- Rooms over the hive's day (ah2-next 4): §9l mounts all six robotics rooms on one hive with `aaRoomAvatarMount()` and walks 480 steps,
  measuring each room each step; the busiest is the cell hall (4,886 triangles, up to three figures).
- The drive (`tools/drive_avatars_hd3.mjs`): `__parishTest.hive.step()` to the first quiet minute after 150, `__parishTest.hd4.opsRoom()`
  enters, `__parishTest.hiveWorld.room()` is the ops mount, `__parishTest.hd4.measure()` the page's counts; camera through
  `__parishTest.interiors.mount.pose` and `__parishTest.np.yaw/pitch` (yaw 0 looks along −z; forward = (−sin yaw, −cos yaw)).
- Commit trailers carry "Co-Authored-By: Claude" with no model name.
