# LESSONS-X-2 (`lx2`, port 9177): the lesson from the menu, the real try in the debrief, lessons in ACCESS's rooms, four personas

Loop 10, round 9. Base 61d85871 (fast-forward, confirmed). This console owns `lx-*.js` and the additions to `WebXR/shared/lessons.js`;
it also wired the parishes page (`WebXR/parishes/js/app.js`, `parishes.html`: one mount, `#menu-lx`) and listed that mount in
`tools/check_interface.mjs`. It did not edit `oh-*`, `aa-*`, `acc-*`, `ix-interiors.js` or `dx-*`: the figures come through
`aaRoomAvatarMount()` and the page's `aaWorld` mount (attach / addAgents), the rooms' agent spots are read from `room.agentSpots`,
and the learner's result comes from the passport (`ppRecords()`), gated by `dxCollecting` through `lxProgressStore`.

Every line is still built from the station's own steps (title and cue) or the standards its certification names, and captioned
"<name> (software agent): …". No LLM, no network call, nothing listens. Voice is on-device (`ohSpeakAs`) and off by default.

## What is here (all in `WebXR/shared/lx-lessons.js` unless said)

| Item | What |
|---|---|
| 1. Menu entry | `lxArmLesson(el, { sites, start, where, at, playing, within, poll, toast })`: "Lesson with the site's agent: <site>" buttons under **Learn → `#menu-lx`**, one per robot site with a station. A click *arms* the site; the lesson starts when the learner is within 9 m while playing and outdoors (polled every 500 ms), never at load. `check_interface` lists `menu-lx` under `learn`. Page hook: `window.__parishTest.lxMenu` (`arm`, `armed`, `tick`, `run`). |
| 2. The real try feeds the debrief | `lxResultOf(record)` turns a passport station record into `{ score, missed }`: missed = the steps the record's own step log (`debrief.steps`, from `game.js`) marks not clean (corrections or hazards), plus the station's steps the log never reached; a record with points but no log gives `missed: null` and the debrief says the points alone. `lxLatestRecord(stationId, ppRecords())`. `lxDebriefAtRobotSite(world, sites, stationId, { records, store })` refuses unless `store.allowed()` (an opted-in adult: never K-12, demo or signed-out), records the attempt under every pack holding the station, and runs the debrief phase alone through the site's agent. The page calls it 2.5 s after a return from a robot site's station (`npReturnSiteId`). |
| 3. Lessons in ACCESS's rooms | `lxRoomStation(styleId)` finds the interiors pack's station for a room; `lxRoomLesson({ room, three, mount: aaRoomAvatarMount(), lesson, tier })` mounts the cast in the room's group with the leader at `room.agentSpots[0]` (the others at the spots that follow), `siteAt` keeps every figure in the room, and paces the lines. The page polls `ixWorld.room` once a second (`lxRoomSync`) and runs the room's lesson on entry, stopping it on exit. |
| 4. All four VBRIDGE personas | `LX_VBRIDGE_PARTS` / `lxCastFor`: on a VBRIDGE pack the safety governor states the station's standards in the brief, the evaluator gives the order and the debrief, the robot-site (provider) agent demonstrates and the client agent hands over the try. `lesson.cast` lists the four; every line's `agent` and caption are the speaker's. Hive lessons keep one voice (byte-identical lines). `lxLessonSource` moves the whole cast to the site; `lxRunInWorld` adds whichever cast members the mount lacks and speaks each line in its own agent's voice when voice is on. |
| 5. Page weight | Measured, not split (see Evals). `check_lx` §12 prints the bytes each round. |
| `tools/check_lx.mjs` | Sections 8–12 added (17 passed). |

## Evals (before → after)

| Measure | Before (61d85871) | After | Source |
|---|---|---|---|
| Lesson starts from the menu | only `?lxLesson=` / the test hook, at load | `#menu-lx` under Learn; armed, waited with the menu open and 108 m away, started once at 6 m | `check_lx` §9 |
| Built page: the figure on screen while its caption shows | — | sf-downtown, high, SwiftShader: the Learn tab shows 1 entry (visible), armed → no run with the menu open and after Start walking (108 m away) → teleported 4 m from the site → the lesson ran on the next tick: Selka (software agent), 18 lines, voice off, the figure's state `at: rb-site-soma-robot-cell` with the brief's caption on its plate while the same line was in the toast. **0 page errors, 0 off-host requests.** In the still the camera is inside the cell (the teleport point) and the figure with its caption plate is about 25 m away behind the fence, small but on screen. | drive (`$SP/loop10/lx2/drive.mjs`), `lx2-lesson-on-arrival.png` |
| Debrief names the missed steps from a real result | none (only a caller-passed `{ score, missed }`) | **3 of 3** from a passport record (score 540, two steps with corrections/hazards, one never reached); the points line first; stored under 1 pack | `check_lx` §10 |
| Nothing read or stored for K-12, demo, signed-out or not opted in | — | **4 of 4** refused: no result read, no caption, no key | `check_lx` §10 |
| In-room lessons | 0 (ACCESS's styles were 0 of 4 in the tree) | **4 of 4** rooms: leader at `agentSpots[0]`, in the room's group, every line to the figure; styles in `ix-interiors.js` 4 of 4 | `check_lx` §11, §2a |
| Built page: a room lesson with the room inside IX_BUDGET | — | entered the fire station apparatus bay (`acc-fire-bay`, Mission Dolores Fire Station): `lxRoom.run()` present, led by Tamsa (software agent · trainer, the interiors pack's hive leader), 18 lines, the room figure built (`world`), the room at **20 meshes / 1,702 triangles** with her standing (IX_BUDGET 120 / 6,000; the mount counts the room's triangles before it builds). The still shows her at `agentSpots[0]` with the brief's caption. (In that drive the outdoor lesson's toast was still running underneath; 0bd36788 stops an outdoor lesson when a room lesson starts.) | drive, `lx2-room-lesson.png` |
| Persona lines grounded | 725 of 725 (one persona) | **725 of 725**, with all four personas in 18 of 18 VBRIDGE lessons (governor: standards; provider: demo; client: try; evaluator: order and debrief); 18 of 18 hive lessons one voice | `check_lx` §3b, §8 |
| Bundle bytes | parishes 8,920,476; instructor 4,866,483 (committed dist) | parishes 8,934,178 (+13,702); instructor 4,877,709 (+11,226) — the new code, no data change | `ls -l WebXR/*/dist` after `bundle_webxr.py` |
| `lx-packs-data.js` in the parishes bundle | 113,254 B (all 6 packs, 35 stations) | unchanged. Measured: the parishes page needs 2 packs / 12 stations = 36,959 B of 112,464 B of JSON (a 75,505 B saving, 67 %). Not split: the bundler requires every module a file imports to be in the list, so the split needs a mutable registry (`lxPacksRegister`) and per-world data files; the design is in `lx2-next.md`. | `check_lx` §12; `node -e` over the data |

## Cycles (reason → act → observe)

1. **Reason:** the lesson at a robot site started at load, behind the welcome menu. **Act:** `lxArmLesson` arms a site from a Learn-tab
   button and starts on arrival, gated on `np.playing` and outdoors. **Observe:** §9: no start at arm, none with the menu open, none at
   108 m, one at 6 m, none twice.
2. **Reason:** the debrief could only name misses a caller invented. **Act:** read the passport record's `debrief.steps` (the station's
   own step log). **Observe:** the first draft named only unclean steps; a run that stopped early never logs the steps after it, so
   those are missed too (§10 names 3 of 3). A record with no log must not say "every step held": `missed: null` → the points line only.
3. **Reason:** DATAWORKS. **Act:** the debrief path goes through `lxProgressStore.allowed()` before any record is read. **Observe:** §10,
   4 of 4 ineligible sessions: refused, no caption, no key.
4. **Reason:** ACCESS's rooms are in the tree now (§2a 4 of 4 on the base). **Act:** `lxRoomLesson` follows `hwMountRoomAgents`'s
   pattern (pseudo-site ids, `siteAt` only for the room's places) but through `aaRoomAvatarMount()`, which counts the room's triangles
   before it builds (room level, else crowd, else held). **Observe:** §11 4 of 4; the built-page measure is in the drive line above.
5. **Reason:** VBRIDGE lessons had one speaker. **Act:** a cast with parts. **Observe:** §8 18 of 18 with all four, §3b still 725 of 725
   (the words did not change, only who says them); hive lessons 18 of 18 one voice.

## Checkers (single runs; the box was at load 25–34 with ten consoles)

- `check_lx` 17 passed, 0 failed. `check_lessons`: all pass. `check_newton` 60 checks, all pass. `check_imports`: all 1,148 modules pass.
- `check_interface` (UX_PORT=9177): OK, **21 passed, 0 failed** (177.6 s at load 30; mounts 44/44 ids present, every mount reachable from its tab 21/21 with `menu-lx`).
- `check_parse`: CHECK_PARSE
- Not run: `tools/check_all.mjs` (the coordinator gates).

## Stills (`$SP/loop10/lx2/`, each looked at)

- `lx2-learn-tab-entry.png`: the welcome menu on the Learn tab (the entry is below the paths; the drive measured its button visible).
- `lx2-lesson-on-arrival.png`: inside the robot cell after the teleport; the arm in front, Selka's figure and caption plate beyond the fence (see Read honestly).
- `lx2-room-lesson.png`: the apparatus bay with Tamsa (software agent · trainer) at the first agent spot, her caption plate reading the brief ("Cardiac Arrest — Pit Crew: 14 steps, from confirm the arrest before anything else to check…").

## Read honestly

- Item 1's arrival test is the module's `tick()` with the page's `where`/`playing`; the drive teleports to the site rather than walking.
- Item 2 runs on return from the station in the same browser (the passport is local). The record's step log carries `clean`,
  `corrections` and `hazards` per step; interruption misses are not mapped to steps.
- Item 3's room figure is a software agent standing at the room's first agent spot; the lesson's station is the pack's pad station
  for that room (its deep link is on the pad). The hive's own room mounts (`hwSyncRoom`) are untouched and only apply to robotics rooms.
- Item 5 is measured, not split. The saving (75 KB of a 8.9 MB page) is under 1 %.
