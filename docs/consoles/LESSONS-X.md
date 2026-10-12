# LESSONS-X (`lx`, port 9169): lessons led by software agents, and lesson packs across the worlds

Loop 10, round 8b. Base a10f1ff8 (fast-forward, confirmed). This console owns the new `lx-*.js` files and the additions to
`WebXR/shared/lessons.js`. It did not edit `oh-*`, `aa-*`, `h5-*`, `h6-*`, `hd*-*`, `ix-interiors.js` or `dx-*`. It calls the
hive's and the figures' exports: `OH_AGENTS`, `ohSpeakAs`, `AA_VBRIDGE_PERSONAS`, and the page's `aaMountAgentAvatars` api
(`attach`, `addAgents`, `agents`).

Agents are software and say so: every line's caption reads "<name> (software agent): …". Every line is built from the station's
own steps (the title and cue strings in its sim module) or from the standards its certification names. There is no LLM and no
network call. Voice goes through `ohSpeakAs` (on-device voices only) and is off by default; captions always show. Nothing listens.

## What is here

| File | What |
|---|---|
| `WebXR/shared/lessons.js` | **Additions only.** `standardsOf(station)` returns the codes a certification names, one form per code. `composePack(spec, roster, { stepsOf })` refuses the whole pack, with reasons, when it has no stations, a station not in the roster, a K-12 station, a station with no steps to ground a lesson in, a requested standard no station carries, or a target above a clean run. `composeLesson` and `lessonProgress` are unchanged (`check_lessons` passes). |
| `tools/gen_lx_packs.mjs` → `WebXR/shared/lx-packs-data.js` (generated, 113 KB) | Six packs, declared by world and site. Their stations come off each world's own site list: `RB_SITES`; `BAY_SITES` (port, estuary); `DEEP_SITES` (pier); `SM_SITES` (water plant, dam, substation); and `NP_SF_DOWNTOWN`'s four kind sites for ACCESS's rooms. Each station's steps (id, title, cue) are parsed out of its sim module. Each station's catalog row is included too (`LX_STATION_META`), so a page needs no catalog.json. K-12 stations are left out (listed in `left`). `--check` re-builds and compares. |
| `WebXR/shared/lx-lessons.js` | `lxAgentLesson` runs brief → demo (one line per step: title and cue) → try → debrief (points against the target; the missed steps by name when a result is given). The leader is a hive agent (the site's home agent, else Tamsa the trainer) or the VBRIDGE evaluator persona. It also holds: `lxPacks`; `lxComposeIn`, which composes a prompt against one world's stations and refuses what that world cannot satisfy; `lxLessonSource`, a contract source for the figure mount; `lxMountLessonFigure`; and `lxRunInWorld` / `lxLessonAtRobotSite`, which run the lesson through the page's existing figure mount at the figures' reading pace. `lxVoice` shows captions always and speaks only when voice is on. `lxProgressStore` writes only while `dxCollecting()` is true; with no consent it deletes on the next read, and `revoke()` calls `dxRevoke` and deletes. `lxAssign` / `lxAssigned` store a pack id only. |
| `WebXR/shared/lx-panel.js` | The instructor console's **Agent lessons** tab. It lists the packs (world, stations, standards, target, leader), previews any station's lesson by phase, and assigns a pack. No learner data is on the console. |
| `WebXR/instructor/index.html`, `WebXR/instructor/js/app.js` | The tab button and panel, and a lazy mount once `rawCatalog` has landed. |
| `WebXR/parishes/js/app.js` | One import and three lines after the figure mount: `__parishTest.lxLesson(id)` and `?lxLesson=<stationId>` run the lesson at the robot site. Captions go to the toast. |
| `tools/bundle_webxr.py` | Instructor bundle: `lessons.js`, `lx-packs-data.js`, `oh-voice.js`, `lx-lessons.js`, `lx-panel.js`. Parishes bundle: `lessons.js`, `lx-packs-data.js`, `lx-lessons.js`. |
| `tools/check_lx.mjs` | 12 sections (see Evals); in `check_all` and in the baseline as a **3 s estimate** (re-measure on a quiet gate). |

## Evals (before → after)

| Measure | Before (a10f1ff8) | After | Source |
|---|---|---|---|
| Agent-led lessons | 0 | **36**: 18 led by hive agents, 18 by the VBRIDGE evaluator; brief → demo → try → debrief in every one | `check_lx` §3 |
| Lesson lines grounded in their station (a step title or cue found verbatim in the sim file, a standard on the certification, or the points arithmetic) | — | **725 of 725** (36 lessons, plus 6 with a debrief that names a missed step) | `check_lx` §3b |
| Packs, with every station existing and enterable (catalog row, not flat, sim module present) | 0 | **6 packs across 4 worlds** (parishes ×2, Bay World ×2, the Deep, Summit), 36 station slots (35 distinct), 0 refused | `check_lx` §2 |
| ACCESS's interiors pack | — | 8 stations on pads in 4 rooms (acc-fire-bay, acc-drop-off-lobby, acc-classroom-wing, acc-park-pavilion). Each is station *pad* of its sf-downtown site with pad < 4, so it is on a pad on every tier. The style ids are in ACCESS's b98b57fe, not this tree; they join at integration. | `check_lx` §2a |
| Standards taken from the stations | — | **60 of 60** | `check_lx` §2b |
| Steps read from the sims = the catalog's step count | — | 35 of 35 stations (461 steps) | `check_lx` §1 |
| Impossible requests refused | — | 5 of 5 pack cases (missing station, K-12 station, unknown standard, target above perfect, empty). 3 of 3 prompts, including a diving lesson asked of the robot sites ("no station in The parishes (robot sites) satisfies …"). A lesson at a missing station is also refused. | `check_lx` §4 |
| Progress stored only for opted-in adults | — | stored in **1 of 6** cases (opted-in adult). Not stored for K-12, demo, signed-out, no adult attestation or not opted in. Revoke deletes; a missing consent deletes on the next read. | `check_lx` §6, §6b |
| Figure API called; voice off by default; captions always | — | headless: 18 speak events to the mount, 0 spoken with voice off, captions for every line | `check_lx` §5, §5b |
| **Built page, parishes** (sf-downtown, high, SwiftShader, `?lxLesson=ad-robot-cell-lockout-and-safe-reentry`) | — | the lesson ran, led by Selka (software agent, the robot cell's home agent). Her figure was at `rb-site-soma-robot-cell`, captioned with the step-1 line after 20 s (4 events sent, 3 lines). Voice off. **0 page errors.** | drive 1 (`$SP/loop10/lx/drive.mjs`) |
| **Built page, instructor console** | no tab | the Agent lessons tab shows 6 packs. A preview showed 18 lines by phase. Assigning stored `{"pack":"lx-pack-parish-robot-sites"}` only. **0 page errors, 0 off-host requests** (three.js served locally) | drive 2 (`$SP/loop10/lx/drive2.mjs`) |

## Cycles (reason → act → observe)

1. **Reason:** a line can only be grounded if the station's steps are readable as data, and the catalog has counts but no text.
   **Act:** parse each sim module's `steps: [` block into its top-level objects. **Observe:** the first, line-based parser read 4 of
   27 stations. Most sims write a step over several lines, or with quoted keys. A brace-depth splitter that skips strings read
   27 of 27, every count equal to the catalog.
2. **Reason:** check that every line quotes its station. **Act:** §3b. **Observe:** it failed on 3 lines: a brief at a station
   with no standards was grounded in "all steps" but quoted none. The brief now names the first and last step titles: 581 of 581.
3. **Reason:** section 6 printed `[object Promise]`. Revoke is async, and the section reported before it ran. **Act:** await the
   revoke between sections. **Observe:** §6b checks the result.
4. **Reason:** ACCESS posted its room ids (20:25, b98b57fe). **Act:** read its commit. The pads are the site's first stations
   (`slice(0, low ? 4 : 8)`), so the pack takes sf-downtown's four kind sites, two pad stations per room. **Observe:** §2a 8 of 8.
   §4's "robot sites" prompt then picked up the interiors pack (same world), so the test now names the robot pack by id.
5. **Reason:** a figure must deliver the lesson in the world, and the parishes page already has the hive's figures. **Act:**
   `lxRunInWorld` attaches the lesson's source to the page's mount (adding the leader if it is missing) and paces one line per
   reading time. **Observe:** §5b, headless: Selka, 18 lines. Drive 1, built page: her figure captioned at the robot cell.
6. **Reason:** drive 2 found 0 cards. **Observe:** the drive aborted the CDN three.js the instructor bundle imports, so nothing
   ran. Served locally (as `check_interface` does): 6 cards. The still showed standards printed twice ("OSHA 29 CFR 1910.212"
   and "29 CFR 1910.212"). **Act:** `standardsOf` keeps the longer form. **Observe:** §2b 64 → 60 of 60.

## Checkers (single runs)

- `check_lx` 12 passed, 0 failed. `check_lessons`: all pass. `check_academy` ok (1,526 checks). `check_scholar`: all pass.
  `check_dataworks` 59 passed, 0 failed.
- `check_newton` all pass (60 checks). `check_imports`: all 1,144 modules pass. `check_parse`: 2,729 modules parse (run after the
  first commit; re-run at the end, see the hand-back).
- `check_interface` (port 9169) 21 passed, 0 failed. I added the instructor tab's controls; the parishes page's menu is unchanged.
- Not run: `tools/check_all.mjs` (the coordinator gates).

## Stills (`$SP/loop10/lx/`, each looked at)

- `lx-parishes-robot-cell-lesson.png`: sf-downtown at load with the welcome menu open. The toast reads "Selka (software agent):
  Step 2, Read the lockout procedure: …". The figure itself is behind the menu: the URL starts the lesson at load, before
  "Start walking".
- `lx-instructor-tab.png`: the Agent lessons tab. The robot-sites pack: 4 stations, target 4,452 of 6,360, standards from the
  stations, "Assigned on this device".

## Read honestly

- The lesson in the parishes page is started by a URL parameter or the test hook. There is no menu button yet (that would be an
  INTERFACE control). It also starts at load, so a learner still in the welcome menu sees the captions but not the figure.
- The try is the learner running the station itself (its deep link). The debrief names missed steps only when the caller passes
  `{ score, missed }`. Nothing yet feeds a station's real result back into the debrief.
- The VBRIDGE packs are led by the evaluator persona alone. The client, provider and governor personas are not given lines.
- The interiors pack is grounded in real stations on real pads. ACCESS's room ids join at integration; this tree's
  `ix-interiors.js` has 0 of 4 (check_lx says so). The in-room run (`aaRoomAvatarMount` with `room.agentSpots`) is a seam, not
  wired.
- `lx-packs-data.js` adds 113 KB to the parishes and instructor bundles. Not measured against a page-weight budget.

## Seams

- `composePack(spec, roster, { stepsOf })`, `standardsOf(station)` (lessons.js).
- `lxAgentLesson`, `lxPacks`, `lxComposeIn`, `lxLessonSource`, `lxMountLessonFigure({ mount, lesson, ...opts })`,
  `lxRunInWorld(world, lesson, { caption, voice, schedule })`, `lxLessonAtRobotSite(world, sites, stationId, opts)`,
  `lxProgressStore`, `lxAssign` / `lxAssigned` (lx-lessons.js); `lxMountPackPanel(el, { catalog })` (lx-panel.js).
- Page hooks: `?lxLesson=<stationId>`, `window.__parishTest.lxLesson(id)`, `window.__parishTest.lxRun`.
- **ACCESS:** in a room, call `lxMountLessonFigure({ mount: aaRoomAvatarMount(), lesson, ...roomOpts })` at `room.agentSpots[0]`.
  No edit of `ix-interiors.js` is needed from this side.
