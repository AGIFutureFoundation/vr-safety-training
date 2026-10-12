# AVATARS-HD-3 (`ah3`, port 9141): the operations room at full detail

Loop 10, round 6. Base 230105b7 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This console owns the figure code
(`aa-*.js`). It did not edit `oh-*.js` (HIVE-6's), `h5-ops-room.js` or `hw-hive-world.js`: the ops room's figures come through
`hwSyncRoom`'s `mount` seam, and the router comes into the aa module as an argument.

The agents are software and look it at the new level too. Each keeps the "software agent · <role>" label, the cool porcelain shell,
the role-coloured visor band, halo and caps, and no skin tone (§9l measures the head and hands at least 0.15 RGB from crew.js's twelve
tones). Nothing in the `aa` modules calls a network, speaks or listens.

## What is here

| File | What |
|---|---|
| `WebXR/shared/aa-agent-hd.js` | `AA_HD_LOD.crowd` and `AA_HD_CROWD_BUDGET` (540 triangles). The crowd level keeps the same forms, colours, bones and pose with fewer rings: a five-ring trunk, a three-ring vest and yoke, four-point limb profiles (four-sided arms), a two-ring neck. It drops the brows and the dark mouth slot; their bones still move, and the lit opening still shows the words. It is **496–524 triangles in 3 meshes**. `full` and `room` are unchanged. |
| `WebXR/shared/aa-agent-avatars.js` | `hd: "crowd"`. `aaCrowdAvatarMount({ voiced, room, router })` is the mount for the ops room. `aaRoomRoute(room, router, opts)` makes a route round `room.colliders` from a router the caller passes in (hw-hive-world.js `hwRouter`), with a 0.3 m body and a 0.05 m margin. **The mouth at any frame rate:** `talkWord(id, charIndex, text, atMs)` stamps a boundary with its own time, mapped onto the mount's clock from the last frame (`now` option, default `performance.now`). `aaVoiceHooks` passes the event's `timeStamp`; the page's `onWord` uses the time of arrival. A frame that comes after a word opened and closed unseen shows the newest word open (`AA_MOUTH_SEEN` 0.15, `AA_MOUTH_CATCHUP` 0.8). Also new: `boundaryLog(id)` and `state().walkPath`. |
| `WebXR/parishes/js/app.js` | The ops room's mount is `aaOpsMountFor(room)` = `aaCrowdAvatarMount({ voiced: aaVoiced, room, router: hwRouter })`, one per room. It replaces `undefined` (HIVE-5's lightened standard figure). The robotics rooms keep `aaRoomMount`. |
| `tools/check_agent_avatars.mjs` | New §9l: the ops room on high, built as the page builds it, through `hwSyncRoom` with the page's mount. It covers seven standing and speaking figures, no skin and the label at the crowd level, balanced and the phone unchanged, the walks over the seeded day, a walk that has to go round, the ops room inside budget over the day, the six robotics rooms over the whole day with the room level, boundary stamps, and the mouth at 1 Hz and 2 Hz. §9k's wiring regex reads the new ops-room mount line. 109 checks (99 before). |
| `tools/check_hive5.mjs` | §5's integration guard now expects the crowd mount for the ops room and still forbids the room-level mount there, with the reason in the comment: seven crowd figures and the room measure 46 meshes and 5,586 triangles. |
| `tools/drive_avatars_hd3.mjs` (new, not in the gate) | The built page: the ops room with the page's mount, its counts with seven standing and with seven speaking, a still of each, and a routed walk caught mid-walk. |
| `docs/perf/checkers-baseline.json` | The `check_agent_avatars` row raised from 7 s to 10 s. This is still an estimate, to re-measure on a quiet machine. |

## Evals (before → after)

| Measure | Before (230105b7) | After | Source |
|---|---|---|---|
| Ops room on high, 7 figures standing and speaking: meshes / triangles (IX_BUDGET 120 / 6,000) | HIVE-5's lightened standard figure **88 / 4,878**; the room level would be 46 / 8,508 (over) | **46 / 5,586** (crowd level, high detail), 20.25 MiB | §9l |
| The same in the built page (oak-west-oakland, high), 7 of 7 standing | 88 meshes, 4,878 triangles built (HIVE-5's drive 3 and the round-5 reel's cut 13) | **46 meshes, 5,586 triangles built** (the checker's figure exactly), 46 draw calls, 5,504 drawn, 19.25 MiB. Speaking, captions up: 46 / 5,586, 57 draw calls, 21.58 MiB. hdLevel "crowd", 7 of 7 | drive (`$SP/loop10/ah3/drive1.txt`, `drive2.txt`) |
| Triangles per figure in the ops room | 408, faceted (h5LiteFigure coarsens today's 1,008) | **496–524** at the crowd level (≤ 540), 3 meshes against 9. `h5LiteFigure` leaves it as built | §9l |
| No skin and the label at the crowd level | — | closest skin tone 0.177 (≥ 0.15); labelled 7 of 7 | §9l |
| Balanced and the phone in the ops room | lightened standard figure / none | **unchanged**: 4,394 triangles and 85 meshes on balanced, as before; the phone builds none | §9l |
| Walks crossing a console or chair box (seed 1, 480 steps) | **0 of 214** (straight; closest 0.65 m mid-walk) | **0 of 214** (routed; 0 within a 0.3 m body's half-width; the two outer consoles' walks bend round a chair corner) | §9l |
| A walk that has to go round (wall side of the arc → each spot) | through a console **7 of 7** (straight) | **0 of 7** | §9l |
| Word boundaries stamped with their own time, 1 Hz frames, each arriving late | **0 of 20** (up to 992 ms off: the last frame's time) | **20 of 20** within 1 ms | §9l; `$SP/loop10/ah3/before.mjs` (base module from `git show`) |
| Frames after a new word that show the mouth open | 1 Hz **0 of 4**, 2 Hz **1 of 8** | 1 Hz **4 of 4**, 2 Hz **8 of 8**; 60 Hz 20 of 20 both | §9l; `before.mjs` |
| §9f at 60 Hz (stubbed boundaries / caption timing) | 15.3 / 15.1 ms | **15.3 / 15.1 ms** (within 25 ms) | §9f |
| Rooms inside budget over a whole seeded day (480 steps, high) | not checked (§9k is a worst case; check_hive3 §1 uses today's figure) | robotics rooms with the room level **6 of 6** × 480 steps (busiest cell hall 4,886 triangles); ops room with the crowd level **480 of 480** steps | §9l |
| Page errors / off-host requests | 0 / 0 | **0 / 0** in all five drives (the last one took 119 s) | drive (port 9141) |

## Cycles (reason → act → observe)

1. **A crowd level that fits seven.**
   - Reason: (6,000 − 2,022) / 7 = 568 triangles a figure. Check: the triangles per agent per level from `aaHdGeometry`
     (`$SP/loop10/ah3/tris.mjs`), then §9l in the room.
   - Act: a first crowd LOD with fewer segments only.
   - Observe: 664–712, over. Act: four-point limb profiles, four-sided arms, a two-ring neck, thinner vest and yoke, no brows or mouth
     slot. Observe: 496–524.
2. **The ops room in the checker with the page's mount.**
   - Reason: round 5's integration lesson (the room-level mount took the ops room to 8,508). Check: §9l builds the room as the page
     does, through `hwSyncRoom`, with seven speaking figures.
   - Observe: 46 meshes and 5,586 triangles on high; balanced and the phone unchanged. `check_hive5` §5's guard was updated with its
     reason in the same commit and passes 5 of 5.
3. **Walks round the consoles.**
   - Reason: h5-next 2. Check: every walk over the seeded day against the room's boxes.
   - Act: `aaRoomRoute` with `hwRouter`.
   - Observe, first run: **failed**, 62 of 214 routed walks "within 0.3 m". The test grew AABBs and so had square corners; the real
     distance at the corner was 0.39 m. The check now uses a Euclidean point-box distance: 0 of 214.
   - Observe, also: straight walks were already clear (0 of 214 cross, closest 0.65 m mid-walk). The margin went from 0.15 to 0.05 m
     so a clear walk stays straight. A go-round case was added to show the router working: 7 → 0 of 7.
4. **The mouth at a low frame rate.**
   - Reason: ah2-next 3. Check: stamps within 1 ms, and every frame after a new word open, at 1 and 2 Hz.
   - Act: `stampOf` and `mouthShown`.
   - Observe: 20 of 20, 4 of 4, 8 of 8. The base module, run the same way, gives 0 of 20, 0 of 4 and 1 of 8. §9f at 60 Hz is unchanged.
     A syntax slip (a comment swallowed a statement) broke the first run; it was fixed before the commit.
5. **Rooms over the hive's day.**
   - Reason: ah2-next 4. Check: all six robotics rooms mounted on one hive with the room level, plus the ops room with the crowd level,
     each measured at each of 480 steps.
   - Observe: 6 of 6 rooms and 480 of 480 steps.
6. **The built page.**
   - Reason: measure the combined case (HIVE-5's room with the app's mount) where it runs. Check: the drive's counts and stills.
   - Observe, first drive: 7 of 7 standing at the crowd level, 46 meshes and 5,586 triangles built, and the room still taken. The walk
     search **failed**: the quiet-minute rule counted queued jobs, so the hive was stepped to minute 470, near the day's end. Act: HIVE-5's
     rule (moving or running). Second drive: minute 159, 7 of 7 and the same counts (speaking: 60 draw calls). The walk still caught Lio
     already past the bend and at the door. It was **failed by eye**. Third drive: a `return` followed by a line comment returned
     undefined. Fourth drive: the figure reached its spot before the screenshot. Fifth drive: the figures are frozen (the room mount's
     `animate` is replaced for the still) 1.5–4 m before the bend, and Orrin is caught mid-stride. Page errors 0, off-host 0.

## Stills (1920×1080, `$SP/loop10/ah3/`, each looked at)

| File | What |
|---|---|
| `ah3-ops-room-crowd.png` | The hive operations room from the door side, on high. All seven crowd-level figures stand at their consoles facing the video wall: Orrin and Selka on the left, Brann, Ivo in the middle, Tamsa, Quen and Lio on the right. Each has its "software agent · <role>" label, halo and visor band; Selka has her vest and Brann his yoke. The bodies read as rounded, not faceted. The wall shows the day's feed and the governor's refusals, and each console shows its card. |
| `ah3-walk-round-console.png` | Orrin (the dispatcher) caught mid-stride on a routed walk in from the door to the outermost console. The figures are frozen for the still and released after. Orrin is 1.79 m before the path's bend round the chair corner, walking past Selka at the safety steward's spot and beside the console row. The wall's feed reads "Today's feed · hive minute 165 (02:45)" with Orrin's own "walking home" line. Orrin's label sits behind Selka's from this angle. |

To reproduce: `python3 tools/bundle_webxr.py parishes && node tools/drive_avatars_hd3.mjs 9141 <dir>`.

## Read honestly

- Straight walks between the door and the consoles never crossed a box in this layout, so "walks that cross a console" is 0 → 0. The
  routing is a guard: it bends only the two outer consoles' walks, by a few tens of centimetres, and it shows its worth only when a
  walk starts on the far side (7 → 0 of 7).
- The crowd level gives up the brows, the mouth slot and the thumb. From the room's distance the figure keeps its build, colours,
  label, visor and halo; up close the limbs are four- and five-sided.
- In the page, `onWord` (oh-panel.js, HIVE's) does not pass the voice event, so a boundary is stamped when it arrives, which is within
  the event loop's latency. The event's own `timeStamp` is used when the voice hooks are called directly (`aaVoiceHooks`).
- Frame time was not measured: the load average was 15–20 the whole round.

## Checkers (single runs)

- `node tools/check_agent_avatars.mjs`: all 109 checks pass (99 before).
- `node tools/check_hive5.mjs`: 5 passed, 0 failed (the §5 guard updated with its reason).
- `node tools/check_hive_world.mjs`: all 35 pass. `node tools/check_hive3.mjs`: all 32 pass. `node tools/check_avatars.mjs`: all pass.
- `node tools/check_imports.mjs`: all 1,127 modules. `node tools/check_parse.mjs`: all 2,706 modules parse. `node tools/check_newton.mjs`:
  all NEWTON checks pass.
- `node tools/drive_avatars_hd3.mjs 9141`: all drive steps pass, page errors 0, off-host 0.
- `check_interface`: not run, because no control was added or changed.
- Not run: `tools/check_all.mjs` (the coordinator gates).

## Seams

- `aaCrowdAvatarMount({ voiced, room, router })` → a mount for `hwSyncRoom` (the ops room). `aaRoomRoute(room, router, { radius, margin,
  step, reach })` → `route(from, to)` or null. `hd: "crowd"`.
- `AA_HD_LOD.crowd`, `AA_HD_CROWD_BUDGET` (540).
- `talkWord(id, charIndex, text?, atMs?)`; the `now()` mount option (ms); `AA_MOUTH_SEEN`, `AA_MOUTH_CATCHUP`; `boundaryLog(id)`;
  `state()` adds `walkPath` and `caughtUp`.
- **HIVE-6 / HIVE:** `h5MountOpsRoom`'s `lite()` can stay. It is a no-op on an HD figure, and balanced still needs it. If HIVE wants to
  drop it on high, skip it when `figure.userData.aaAgent.hd` is true.

## Left

- One room-level figure for the console nearest the learner (about 414 triangles of headroom; see `ah3-next.md`).
- Frame time on a quiet machine (open since ah-next 5).
- Moods on the body once HIVE-6's `mood` event lands.
- The stop hand by eye in a room (no thumb at the room and crowd levels).
- The bundle was rebuilt for the drives and restored (the coordinator regenerates it).
