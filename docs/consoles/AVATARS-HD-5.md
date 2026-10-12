# AVATARS-HD-5 (`ah5`, port 9163): moods in the page, robot rooms with no held agent, the ops room's last triangles

Loop 10, round 8. Base a10f1ff8 (fast-forward, confirmed). This console owns the figure code (`aa-*.js`). It did not edit `oh-*`, `h5-*`
or `h6-*` (HIVE-8's) or `rhd-*` (ROBOTS-HD-3's). In `app.js` it changed the aa import line and the ops-room mount line, and nothing
else. ROBOTS-HD-3's commits 2085508a and c1d96403 came in by a merge so the combined robot rooms could be measured. They are their
files, and nothing in them was edited here.

The agents are software and look it at every level. Each keeps the "software agent · <role>" label, the porcelain shell, the visor band,
halo and caps, and no skin tone. Moods never touch the face or the stop hand. Nothing in the `aa` modules calls a network, speaks or listens.

## What is here

| File | What |
|---|---|
| `WebXR/shared/aa-agent-avatars.js` | **Moods from the hive's current state.** `aaMoodOf(source, id)` reads an agent's mood from a source that keeps one: HIVE-6's `hive.mood(id)`, or a relay's `.hive`. It is guarded, so a source without moods, a throwing source or an unknown mood gives null. The mount gives each figure that has no mood yet the one its hive already has (`seedMood`). It reads that from a new `moodOf(id)` option, or else from the attached sources, when an agent is added and when a source is attached. A seeded mood is not logged as an event: `moodLog()` stays the hive's own mood events. **The ops room's headroom, measured.** `aaRoomHeadroom(parent, agents, cap)` is the cap less the room group's triangles (counted the way ixrMeasure counts) and every agent's crowd figure. `aaCrowdAvatarMount({ nearest, triCap = AA_ROOM_TRI_CAP })` uses it, instead of the constant AA_HD_NEAR_EXTRA, to choose the room-level figure. |
| `WebXR/parishes/js/app.js` | The ops-room mount adds `moodOf: (id) => aaMoodOf(h3Scene?.relay ?? window.__parishTest?.hive?.hive, id)`. This is the same source `hwSync` feeds the room from. The h5 relay carried no `mood()` until HIVE-8's 96bda3b0. Either path is enough on its own. |
| `tools/check_agent_avatars.mjs` | New §9n, six lines (see Checkers). §9k's wiring regex reads the new mount line. 124 checks (119 before). |
| `tools/drive_avatars_hd5.mjs` (new, not in the gate) | The built page, ops room on high. The hive is stepped to a refusal after minute 150 and the room entered mid-day. The drive compares posture, glow and hive mood for each figure at entry and on each hive step, and takes a still of a concerned figure beside a calm one. Page errors and off-host requests are recorded. Robot rooms: `drive_avatars_hd4.mjs` leg B. |

## Evals (before → after)

| Measure | Before (a10f1ff8) | After | Source |
|---|---|---|---|
| Posture and glow name the same mood: real hive with moods on, seed 1, ops room entered at minutes 0, 150, 300, the page's mount (headless) | 6,348 of 6,370 figure-steps. A figure built mid-day stood calm until its next mood event, while HIVE-7's glow seeded from `hive.mood(id)`. First miss: Orrin at minute 151, glow relieved, posture calm. | **6,370 of 6,370** (posture = glow = `hive.mood(id)`; 1,505 not calm: concerned, relieved, busy). Glow steady when calm, never brighter: 6,370 of 6,370. | §9n |
| The same in the built page (oak-west-oakland, high), entered at minute 158 after 23 refusals | (base page: HIVE-8 read posture = glow 4 of 7 at minute 36, because calm agents read null) | **352 of 352** figure-samples (entry + 60 hive minutes; 138 not calm), in both runs (the second with the still, 864 s at load 21–40) | drive A (`$SP/loop10/ah5/driveA.txt`, `driveA2.txt`) |
| Hidden triangles in the six robot rooms (what AVATARS-HD-4 suspected) | 7,450 built against 6,324 drawn in the AMR warehouse at 40d97421 | The only hidden meshes are ROBOTS-HD's floor zones and the figures' talk lights. Both show in some state. **Hidden for good: 0.** The gap was frustum culling. | §9n, `$SP/loop10/ah5/hidden.mjs` |
| Robot rooms, three agents each, headless as the page builds them | AMR warehouse own 4,940 → crowd, crowd, **held** (5,960). The other five rooms fit three. | with ROBOTS-HD-3's trim (room AMR 996 → 484) merged: AMR warehouse own 3,916 → room, crowd, crowd (5,842); **0 held, 6 of 6 inside** | §9n |
| Robot rooms in the built page (sf-downtown, high), drive B | 6 of 6 inside, **1 held** (AVATARS-HD-4, AMR warehouse) | **6 of 6 inside IX_BUDGET, 0 held** (18 figures in 6 rooms; table below) | drive B (`$SP/loop10/ah5/driveB.txt`) |
| Ops room on high, page's mount, 7 standing and speaking (headless) | 46 / 5,992, margin 8 (constant headroom 414) | **46 / 5,992, margin 8** (measured headroom 414, unchanged). +13 triangles in the room → 7 crowd, 5,599. +300 → 7 crowd, 5,886. | §9n |
| Ops room in the built page with moods, mid-day (6 standing, 1 away) | — | 43 meshes, 5,484 triangles built (margin 516), 47 draw calls, levels room 1 / crowd 5 | drive A |
| Page errors / off-host requests | 0 / 0 | **0 / 0** in drive A (both runs) and drive B | drives |

### Robot rooms in the built page (sf-downtown, high, with ROBOTS-HD-3's robots at ed54ad3d, three agents each: the hive's, topped up to three by the door)

| Room | HD robots (triangles) | AVATARS-HD-4 after (40d97421) | After (this branch + ed54ad3d): figures (levels), held, triangles built / drawn, meshes |
|---|---|---|---|
| cell hall | 1 (1,140) | 3 room, 0 held, 5,854 | 3 (room 3), 0 held, 5,990 / 5,890, 41 |
| cobot lab | 2 (2,248) | room 2 + crowd 1, 5,904 | 3 (room 1, crowd 2), 0 held, 5,738 / 5,392, 48 |
| AMR warehouse | 2 (968; 1,992 before the trim) | crowd 2, **1 held**, 5,688 | 3 (room 1, crowd 2), **0 held**, 5,842 / 4,988, 42 |
| port control | 1 (696, the straddle carrier in the window; 0 before) | 3 room, 4,158 | 3 (room 3), 0 held, 4,854 / 4,748, 35 |
| drilling deck | 1 (2,208) | 3 room, 4,646 | 3 (crowd 3), 0 held, 5,624 / 5,430, 37 |
| maintenance bay | 2 (1,476) | room 1 + crowd 2, 5,918 | 3 (room 2, crowd 1), 0 held, 5,844 / 5,270, 40 |
| **inside IX_BUDGET** | | 6 of 6, 1 held | **6 of 6, 0 held** |

The drive's frame time (cell hall, 2,817 ms with three figures, 2,567 ms with none, 4–5 frames) ran at load 38–40 and does not measure the figures.

## The robot-room cap rule (agreed with ROBOTS-HD-3 in the heartbeat, 20:20 and 20:22)

The cap counts every mesh that can be drawn, exactly as ixrMeasure counts. That includes shown meshes, and meshes hidden now but shown by
a state: the floor zones when the learner is inside 6 m, and a figure's talk light while it speaks. A mesh hidden for good must leave the
room's group, and that is its owner's job. Counting only what the camera draws would make the cap depend on the view, so it was not
adopted. ROBOTS-HD-3 tags the zones `userData.rhdCanShow`. They trimmed the room AMR so the AMR warehouse's own triangles (3,916) leave
room for three crowd figures (6,000 − 3 × 540 = 4,380). `AA_ROOM_TRI_CAP`, `capLevel` and §9m's cap line are unchanged.

## Cycles (reason → act → observe)

1. **Posture and glow in the page.**
   - Reason: brief item 1 and ah4-next 1. HIVE-8 turned the scene hive's moods on; the panel's hive already had them. Check: a §9n line
     with the ops room opened mid-day.
   - Observe, before: 6,348 of 6,370. The aa mount set a mood only on an event; the glow seeded from `hive.mood(id)` on opening.
   - Act: `aaMoodOf`, `seedMood`, `moodOf`. Observe: 6,370 of 6,370. §9m's "log = events" line still passes, because seeds are not logged.
2. **The built page.**
   - Act: drive A on 9163 at load 3 rising to 37 (other consoles' drives).
   - Observe: 352 of 352. The first still **failed**: the pair finder spread the state after setting the mood, so a calm figure's null
     replaced "calm". Act: fixed the order, and the still is now taken while the refusal is fresh. Observe: Tamsa concerned beside Quen calm.
3. **Robot rooms: where are the hidden triangles?**
   - Reason: ah4-next 2 assumed a hidden rig. Check: a headless probe of every mesh under each room's group.
   - Observe: hidden meshes are only the zones (warehouse 272, cobot 272, cell 136, drill 136) and the talk lights, all of which can show.
     ROBOTS-HD-3 found the same independently. So "count what is drawn" gives nothing back, and the rooms need fewer triangles.
   - Act: agreed the rule; ROBOTS-HD-3 trimmed. I added the §9n rule line and the rooms line.
4. **The ops room's last 8 triangles.**
   - Reason: brief item 3 (ah4-next 4). Keep the room-level figure, or take a ring off the crowd level?
   - Act: the room-level figure stays, and the headroom is measured at mount. Observe: as built, the same 5,992. Anything added later
     demotes the figure first (+13 → all crowd, 5,599).

## Decision: the ops room's last triangles

The room-level figure for the console nearest the learner **stays**. Taking a ring off the crowd level would cost all seven figures
detail to free about 40 triangles each, for nothing that is planned. Instead, the headroom is measured when the room mounts. If HIVE or
ENV-HD add anything to the ops room on high, it comes out of the room-level figure first: all seven fall back to the crowd level, which
leaves 414 triangles for additions. Beyond that, the addition has to come out of the room itself. HIVE-8 and ENV-HD-8 were told in the
heartbeat (20:37).

## Stills (1920×1080, `$SP/loop10/ah5/`, each looked at)

| File | What |
|---|---|
| `ah5-concerned-beside-calm.png` | The ops room on high, from the front of two crowd-level figures, mid-day after a refusal. Quen (auditor, calm, left) holds the tablet with both arms out. Tamsa (trainer, concerned, right) has its arms in close at its sides and its head a little lower. Labels, halos and visor bands are as everywhere, and the consoles' dark tops are in the foreground. The difference reads up close but is subtle. The glow's pulse (concerned: a slow 28 % dip) does not show in a still. |

## Read honestly

- The concerned posture is subtle at the crowd level: arms in, head 0.05 rad lower. It reads from 2–3 m, not from the door (ah5-next 1).
- The robot rooms' 0 held depends on ROBOTS-HD-3's trim (merged here from ed54ad3d). Without it, the AMR warehouse holds 1 agent, which
  the §9n rule line allows because the room's own triangles leave room for fewer than three crowd figures.
- Frame time was not in this round's section. The drives ran at load 21–40, so the medians they print do not measure anything.
- The usage limit stopped this console at about 20:36. It resumed at 21:27 after a machine restart and finished drive B then.
- The §9 mouth-timing line (wall-clock bound) failed once while other drives ran: 158 of 159 words. AVATARS-HD-4 saw the same.

## Checkers (single runs, on this branch with ROBOTS-HD-3's ed54ad3d merged)

- `node tools/check_agent_avatars.mjs`: 123 of 124 at load 30–47. The one failure is §9f's mouth-boundary line (157–158 of 159 words).
  Its mount takes no `now`, so word boundaries are mapped by `performance.now()` between frames, which makes the line depend on the load.
  Run against the base `aa-agent-avatars.js` at the same load, it passed 159 of 159 once. That is why it is listed here rather than
  waved away. It should pass on a quiet machine, and CI is the record. Everything new passes: in §9n, posture = glow over mid-day
  entries (6,370 of 6,370); the aaMoodOf guards; the ops room's last triangles (margin 8 as built; +13 → all crowd, 5,599; +300 → 5,886);
  the cap rule (hidden for good 0, hidden but can show 1,120 triangles); the six robot rooms inside the cap with 0 held.
- `check_robots_hd`: 62 passed, 0 failed. `check_hive5`: pass. `check_hive6`, `check_hive_world` (35), `check_hive3` (32) and
  `check_avatars` all passed after item 1.
- `check_newton`: all pass. `check_imports`: all 1,141 modules. `check_parse`: all 2,726 shipped modules parse.
- `check_interface`: not run, because no control was added or changed. Not run: `tools/check_all.mjs`.

## Seams

- **HIVE-8:** posture follows `hive.mood(id)` from the moment a figure is built, through `moodOf` on the page's mount or their relay's new
  `mood(id)`. The glow is theirs, unchanged. `check_hive5`'s guard (`aaOpsMount = aaCrowdAvatarMount({`) is still true.
- **ROBOTS-HD-3:** the rule above. A robot that makes a room grow costs figure detail, then figures. A room robot that is hidden for good
  must leave the group.
- **ENV-HD-8 / HIVE-8 (ops room):** additions on high come out of the room-level figure first (414), then out of the room.
- New: `aaMoodOf`, `aaRoomHeadroom`, the `moodOf` mount option, the `triCap` option on `aaCrowdAvatarMount`; state's `mood` can come from a seed.

## Left

- A mood cue that reads from the door (ah5-next 1).
- Frame time on a quiet machine (open since ah-next 5).
- The bundle was rebuilt for the drives and restored. The coordinator regenerates it.
