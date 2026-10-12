# AVATARS-HD-4 (`ah4`, port 9154): the nearest console in full detail, the room's moods, and robot rooms that keep their budget

Loop 10, round 7. Base 40d97421 (fast-forward, confirmed). SmartCiti.X Holodeck · Powered by AGI Corp. This console owns the figure
code (`aa-*.js`). It did not edit `oh-*.js` or `h5-ops-room.js` (HIVE-7's) or `rhd-*.js` (ROBOTS-HD-2's). The app's ops-room mount
line was edited (as AVATARS-HD-3 did), and nothing else in `app.js`.

The agents are software and look it at every level. Each keeps the "software agent · <role>" label, the porcelain shell, the visor band,
halo and caps, and no skin tone. Moods never touch the face. Nothing in the `aa` modules calls a network, speaks or listens.

## What is here

| File | What |
|---|---|
| `WebXR/shared/aa-agent-avatars.js` | **The nearest console at the room level.** `aaCrowdAvatarMount({ nearest: "room", learner })` picks, when the room mounts, the agent whose spot is nearest the learner (`learner()`, room-local; a pose outside the room, or none, falls back to 0.8 m inside the door). It builds that figure at the room level and the other six at the crowd level. The choice is made once, so nothing swaps while the learner moves (a swap would rebuild a skinned mesh). `aaNearestRole(room, learner, { agents, level })` only picks an agent whose room-level figure adds at most `AA_HD_NEAR_EXTRA` (414) triangles over its crowd figure; otherwise it takes the next nearest. The mount option behind it is `hdFor(agent) -> level`. **Moods.** The mount listens for HIVE-6's `mood` event (`AA_MOOD_EVENT`) besides the contract's types, guarded: an unknown mood or agent is ignored. `setMood` keeps the idle phase continuous when busy changes the tempo. Also new: `state().mood`, `moodCause`, `level` and `held`, plus `moodLog()`. **The robot rooms' triangle cap.** `aaRoomAvatarMount` passes `triCap: AA_ROOM_TRI_CAP` (6,000, IX_BUDGET high) and `capFigures: AA_ROOM_FIGURES` (3). Before it builds a figure it counts the room's triangles the way ixrMeasure does. It uses the room level if that fits with room left for the figures still to come at the crowd level, else the crowd level, else none: the agent is *held* (listed, unbuilt) and gets a figure when another figure leaves (`release`). **The routed turn.** A routed walk's heading turns over `AA_WALK_TURN` (0.4 m) either side of a bend. Before, it snapped at the waypoint. The path is unchanged. |
| `WebXR/shared/aa-agent-hd.js` | `AA_HD_MOODS`, `AA_HD_MOOD_POSE`, `aaHdMoodTempo`. `aaHdPose(spec, { mood })`: concerned puts the head 0.05 rad lower (half the traits' head-pitch span of 0.1) and brings the arms in to 0.6 of the trait's abduction (never under 0.03). Relieved lowers the shoulders 1.2 cm. Busy's idle tempo ×1.12 (at most 1.3, the fastest trait tempo) comes in through the mount's idle clock. Calm or no mood changes nothing. The gestures are posed after the mood, so the stop hand is the same pose in every mood. `AA_HD_NEAR_EXTRA` (414). |
| `WebXR/parishes/js/app.js` | The ops-room mount line only: `aaCrowdAvatarMount({ voiced: aaVoiced, room, router: hwRouter, nearest: "room", learner: () => ixWorld.pose })`. |
| `tools/check_agent_avatars.mjs` | New §9m, ten lines (see Checkers). §9k's wiring regex reads the new mount line. 119 checks (109 before). |
| `tools/drive_avatars_hd4.mjs` (new, not in the gate) | The built page. **A:** the ops room, its counts standing and speaking, the frame time with the load, a still from the learner's entry corner, and the stop hand on the room-level figure and its crowd neighbour. **B:** the six robot rooms with ROBOTS-HD's robots and three agents each, and the frame time in the busiest room. Arguments: port, out dir, `before`/`after`, `A`/`B`. |

## Evals (before → after)

| Measure | Before (40d97421) | After | Source |
|---|---|---|---|
| Ops room on high, page's mount, 7 standing and speaking, headless: meshes / triangles (≤ 120 / 6,000) | 46 / 5,586 (seven crowd figures) | **46 / 5,992**: one room-level figure (Ivo, nearest the door entry, 922 triangles) and six crowd figures. 8 to spare. | §9m |
| The same in the built page (oak-west-oakland, high), learner at the page's entry pose | 46 meshes, 5,586 triangles built, 46 / 59 draw calls standing / speaking, 19.25 / 21.58 MiB (`drive-before.txt`) | **46 meshes, 5,988 triangles built**, 5,890 drawn, 46 / 60 draw calls, 19.25 / 21.58 MiB. Levels {room 1, crowd 6}: Orrin, the console nearest the hook's pose (−6.6, 5.4), is at the room level. | drive A (`$SP/loop10/ah4/drive-after2.txt`) |
| The room level only where it fits (learner at each of the 7 consoles) | — | the chosen figure adds 402–406 triangles (≤ 414). The console itself is chosen 3 of 7 times, the next nearest that fits otherwise. | §9m |
| Swaps while the learner moves | — | **0**: 7 of 7 figures stay the same objects at the same level after the learner walks to the far console | §9m |
| Ops room with the page's mount over the seeded day (480 steps) | 480 of 480 (crowd only) | **480 of 480** inside (worst 5,992); walks through a box 0 of 214, within 0.3 m 0 | §9m |
| Moods on the bones, 7 agents | none | calm: no change 7 of 7. Busy: idle tempo ×1.12 7 of 7 (Orrin 1.000 → 1.120). Concerned: head +0.05 rad (Orrin −0.005 → 0.045) and arm abduction 0.173 → 0.104, 7 of 7. Relieved: shoulders −1.2 cm, 7 of 7. Inside the traits' ranges 7 of 7. Face unchanged. | §9m |
| The stop hand on a refusal in every mood | — | **7 of 7** agents = AA_HD_STOP_POSE within 1e-9 rad | §9m |
| The real hive with moods on (seed 1, 480 steps), the page's ops-room mount | mood events reaching figures 0 (not subscribed) | **142 of 142**; figure mood = the hive's `mood(id)` 2,966 of 2,966 step-checks; head jumps on a tempo change 0 | §9m |
| No mood events: pose against the base module | — | **byte-identical**: 386,400 bone-frames over the seeded day hash the same as the base module at the crowd, room and full levels | `$SP/loop10/ah4/samepose.mjs` (base modules from `git show 40d97421`) |
| **Robot rooms with ROBOTS-HD's robots and three agents each, in the built page (sf-downtown, high)** | **3 of 6 inside IX_BUDGET**: cobot lab 6,322, AMR warehouse 7,450 and maintenance bay 6,774 triangles built (three room-level figures). Cell hall 5,854, port control 4,158, drilling deck 4,646. | see the rooms table below | drive B (`drive-before.txt`, `drive-after2.txt`) |
| Triangle cap in a stand-in room (§9m) | — | 1,000 → room ×3; 4,000 → room, crowd, crowd (5,926); 4,600 → crowd, crowd, held (5,620); the held agent gets a figure when one leaves | §9m |
| A routed walk's heading through a 90° bend at 60 Hz | 1.571 rad in one frame (snap) | **0.072 rad** largest turn between frames | §9m |
| A 4-segment thumb, per figure | — | +80 triangles at both levels: room 978–1,042 (over AA_HD_ROOM_BUDGET 1,000), crowd 576–604 (over 540). Not added. | `$SP/loop10/ah4/thumb/t.mjs` |
| Frame time, median over 10 s | ops room 1,900 ms (5 frames), load 30.5; AMR room 3,367 ms with 3 figures and 4,000 ms with none, load 34 | ops room 2,283 ms (5 frames) at load 31.6, and 1,383 ms (7 frames) at load 25.6 in the last run; robot rooms in the table below | drive (port 9154). **Not meaningful**: software rendering at load 30–38, two to four seconds a frame either way. |
| Page errors / off-host requests | 0 / 0 | **0 / 0** | drives |

### Robot rooms in the built page (sf-downtown, high, ROBOTS-HD's robots, three agents each: the hive's, topped up to three by the door)

| Room | HD robots (triangles) | Before (40d97421): figures, triangles built / drawn | After: figures (levels) + held, triangles built / drawn |
|---|---|---|---|
| cell hall | 1 (1,140) | 3 room, 5,854 / 5,890, inside | 3 (room 3), 0 held, 5,854 / 5,890, inside |
| cobot lab | 2 (2,248) | 3 room, **6,322** / 6,216, **over** | 3 (room 2, crowd 1), 0 held, 5,904 / 5,814, inside |
| AMR warehouse | 2 (1,992) | 3 room, **7,450** / 6,324, **over** | 2 (crowd 2), **1 held**, 5,688 / 4,616, inside |
| port control | 0 | 3 room, 4,158 / 4,052, inside | 3 (room 3), 0 held, 4,158 / 4,052, inside |
| drilling deck | 0 | 3 room, 4,646 / 4,540, inside | 3 (room 3), 0 held, 4,646 / 4,540, inside |
| maintenance bay | 2 (1,988) | 3 room, **6,774** / 5,672, **over** | 3 (room 1, crowd 2), 0 held, 5,918 / 4,848, inside |
| **inside IX_BUDGET** | | **3 of 6** | **6 of 6**, 1 agent held (AMR warehouse) |

Frame time in the busiest room, after (maintenance bay): 1,567 ms with three figures and 1,183 ms with none (7 and 8 frames), load 29 and 28.
Before (AMR warehouse): 3,367 ms and 4,000 ms, load 34. As the evals say, these do not measure the figures.

## Cycles (reason → act → observe)

1. **The nearest console at the room level.**
   - Reason: ah3-next 1. The ops room had 414 triangles of headroom. Check: §9m with the page's mount and captions up.
   - Act: `hdFor` in the mount, and `nearest`/`learner` in the crowd mount.
   - Observe: 5,992 of 6,000 (Ivo, nearest the door). It fits with 8 to spare.
   - Reason: another learner pose could pick a figure that does not fit. Act: the choice only takes an agent that adds ≤ 414.
     Observe: 402–406 from all seven consoles; the console itself is chosen 3 of 7 times.
2. **Moods on the body.**
   - Reason: ah3-next 3; HIVE-6's `mood` event had landed but the mount never subscribed to it. Check: a §9m line per mood on the
     bones, the stop hand, and the real hive with moods on.
   - Observe, first run: **failed**. Concerned was 5 of 7 and the stop hand 4 of 7. A formal agent clasps its hands, so its arm
     abduction is not the trait's (the test was wrong). The stop hand was the same to 1e-16, but `lerp(a, b, 1)` is not bit-exact.
   - Act: the test compares against AA_HD_STOP_POSE within 1e-9 and judges abduction against the trait. Observe: 7 of 7 each; moods
     142 of 142.
3. **The combined case in the built page (the seam).**
   - Reason: the brief's integration rule. Check: drive B measures each robot room with ROBOTS-HD's robots and three agents.
   - Observe, on the committed dist at 40d97421: **3 of 6 rooms over IX_BUDGET**, up to 7,450 triangles built. The HD robots added
     about 2,000 triangles, and nobody had measured them together with three room-level figures.
   - Act: the room mount's triangle cap. A first greedy version put the AMR warehouse at one figure and two held. The cap now keeps
     room for the figures still to come at the crowd level. Observe: §9m's stand-in rooms, then the drive (table above).
4. **The routed walks by eye** (ah3-next 4).
   - Reason: in `ah3-walk-round-console.png` the walk reads naturally, but the heading snapped at each waypoint, which a bend round a
     chair corner turns into a sudden turn.
   - Act: the heading turns over 0.4 m either side of the bend. The path is unchanged, so §9l's clearance line holds (0 of 214 within
     0.3 m). Observe: largest turn between frames 0.072 rad against 1.571 rad.
5. **The stop hand by eye** (ah3-next 5).
   - Reason: there is no thumb at the room and crowd levels. Check: a still, and the cost of a thumb.
   - Observe, first still: **failed by eye**. Neither figure held the stop hand: at load 31 one frame took about 2.3 s and ended the
     1.8 s gesture before the still. Act: the drive freezes the room first and poses the gesture by the mount's own clock.
     Observe: both figures hold the stop hand in the still (state: stop, stop). A 4-segment thumb costs 80 triangles a figure, which takes both levels over their budgets.
6. **Frame time** (ah3-next 2).
   - Observe: the load was 30–38 for the whole round, and a frame took two to four seconds in headless software rendering. The
     medians are recorded but do not compare anything. It stays open.

## Stills (1920×1080, `$SP/loop10/ah4/`, each looked at)

| File | What |
|---|---|
| `ah4-ops-room-nearest.png` | The hive operations room on high from the middle of the door side. Seven figures stand at their consoles facing the wall, each with its "software agent · <role>" label, halo and visor band. Orrin (dispatcher, the room-level figure) is far left behind Selka. The wall shows the day's feed and the refusals. |
| `ah4-stop-hand-room-crowd.png` | Selka (safety steward, crowd level, left) and Orrin (dispatcher, room level, right) from the front, each holding the stop hand on a refusal with its caption "Stopped: the governor's safety check". Orrin's raised right hand reads as a palm held up before the chest, with the tablet in his left. Selka's crowd-level hand reads as a block at chest height, not clearly a palm. Neither has a thumb; without the caption the crowd figure's gesture is the weaker. Labels and halos as everywhere. |
| `ah4-room-ixr-*.png` | The six robot rooms with ROBOTS-HD's robots and their figures (the AMR warehouse still shows Orrin by the aisle with the AMR on its lane; looked at). |

To reproduce: `python3 tools/bundle_webxr.py parishes && node tools/drive_avatars_hd4.mjs 9154 <dir> after`; for the base, use the
committed dist and `before`.

## Read honestly

- The ops room on high is at 5,988–5,992 of 6,000 triangles with the room-level figure. That leaves no room for anything else in it on
  high. A future addition to the room has to come out of this figure or out of the room.
- In the page, the nearest console is chosen from the pose the room has when `hwSync` mounts it. The test hook (`hd4.opsRoom`) stands
  the learner in the left front corner, so Orrin was chosen there. A learner who walks in through the door gets the door's nearest
  (Ivo).
- The robot rooms' cap is a guard in the figure code against a room whose own triangles grew (ROBOTS-HD's robots). A held agent has no
  figure while it is held. The room's chip and the hive still list it. A better fix sits in the robots' or the room's triangles: in the
  AMR warehouse 7,450 were built but 6,324 drawn at 40d97421.
- Moods show on the high tier's HD figures only. Balanced and the phone are unchanged. **The page's hive does not turn moods on**
  (`h3SceneHive(ohHive, { seed })`; only the console tab's replay does). So in the page the figures carry no mood until HIVE-7 turns
  `moods` on. The mount is ready and subscribed.
- Frame time was not measured in any useful way (see the evals).
- Two §9 voice-timing lines (wall-clock bound) failed once each while a drive was running (26.7 ms against 25; 158 of 159 words). Both
  passed on the next run (119 of 119).

## Checkers (single runs)

- `node tools/check_agent_avatars.mjs`: all 119 pass (109 before). New in §9m: the mixed ops room inside budget; no swap while the
  learner moves; the mixed room over the day; moods on the bones; the stop hand in every mood; the room level only where it fits; the
  robot-room triangle cap; the routed turn; the real hive with moods; no mood events the same frame for frame.
- `node tools/check_hive5.mjs`: 5 passed, 0 failed. `check_hive_world` 35, `check_hive3` 32, `check_hive6` 7 passed, `check_avatars`
  all pass.
- `node tools/check_imports.mjs`: all 1,137 modules. `node tools/check_newton.mjs`: all pass. `node tools/check_parse.mjs`: all 2,716 shipped modules parse.
- `check_interface`: not run, because no control was added or changed.
- Not run: `tools/check_all.mjs`.

## Seams

- **HIVE-7 (ops room):** the figures listen for `mood` on the room's relay (h5MountOpsRoom forwards every type but `move`). Turn
  `moods: true` on in the page's hive and the bodies follow. `state(id).mood` equals `hive.mood(id).mood` (§9m: 2,966 of 2,966). The
  combined room is 46 / 5,988 in the built page. `check_hive5`'s guard (`aaOpsMount = aaCrowdAvatarMount({`) is still true and unedited.
- **ROBOTS-HD-2 (robot rooms):** `AA_ROOM_TRI_CAP` counts every mesh under the room's group, hidden or not, as ixrMeasure does. Robots
  that grow a room's triangles now cost figure detail, then figures. Trimming hidden rig triangles would give them back.
- `aaCrowdAvatarMount({ nearest, learner })`, `aaNearestRole`, `hdFor`, `triCap`/`capFigures`, `AA_ROOM_TRI_CAP`, `AA_ROOM_FIGURES`,
  `AA_HD_NEAR_EXTRA`, `AA_MOOD_EVENT`, `AA_HD_MOODS`, `AA_HD_MOOD_POSE`, `aaHdMoodTempo`, `AA_WALK_TURN`; `state()` adds `mood`,
  `moodCause`, `level`, `held`; `moodLog()`, `heldLog()`; `counts().levels`.

## Left

- Frame time on a quiet machine (open since ah-next 5).
- The page's hive with moods on (HIVE-7's call), then a still of a concerned figure.
- Robot rooms: trim hidden triangles with ROBOTS-HD-2 so no agent is held.
- The bundle was rebuilt for the drives and restored (the coordinator regenerates it).
