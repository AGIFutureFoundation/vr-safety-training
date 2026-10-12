# Lessons led by the software agents

Lessons a software agent leads at the station, grounded in its own steps and standards, and packs across the worlds.

## Lessons led by software agents

### Round 8: `LESSONS-X`, agent-led lessons and lesson packs

Round 8: `LESSONS-X`, tip 112a4d68 (read at the merged head 112a4d68), 5 commits of its own since a10f1ff8, merged into the head of round 8, 112a4d68; its console note is committed, and the table below is that note’s own. Each figure is a token of the commit message or note row it is quoted from, checked when this page is built.

- agent-led lessons and lesson packs across the worlds ()

- the walk-in interiors pack on ACCESS's four rooms (sf-downtown's fire station, hospital, school and park; two pad stations per room, inside the 4 pads every tier builds) ()

- the agent-led lesson in the parishes page at a robot site ()

- standardsOf keeps one form of a code ("OSHA 29 CFR 1910.212 ", not also "29 CFR 1910.212 ") ()

- console notes, memory and next brief ()

| Measure | Before (a10f1ff8) | After | Source |
|---|---|---|---|
| Agent-led lessons | 0 | 36: 18 led by hive agents, 18 by the VBRIDGE evaluator; brief → demo → try → debrief in every one | check_lx §3 |
| Lesson lines grounded in their station (a step title or cue found verbatim in the sim file, a standard on the certification, or the points arithmetic) | — | 725 of 725 (36 lessons, plus 6 with a debrief that names a missed step) | check_lx §3b |
| Packs, with every station existing and enterable (catalog row, not flat, sim module present) | 0 | 6 packs across 4 worlds (parishes ×2, Bay World ×2, the Deep, Summit), 36 station slots (35 distinct), 0 refused | check_lx §2 |
| ACCESS's interiors pack | — | 8 stations on pads in 4 rooms (acc-fire-bay, acc-drop-off-lobby, acc-classroom-wing, acc-park-pavilion). Each is station *pad* of its sf-downtown site with pad < 4, so it is on a pad on every tier. The style ids are in ACCESS's b98b57fe, not this tree; they join at integration. | check_lx §2a |
| Standards taken from the stations | — | 60 of 60 | check_lx §2b |
| Steps read from the sims = the catalog's step count | — | 35 of 35 stations (461 steps) | check_lx §1 |
| Impossible requests refused | — | 5 of 5 pack cases (missing station, K-12 station, unknown standard, target above perfect, empty). 3 of 3 prompts, including a diving lesson asked of the robot sites ("no station in The parishes (robot sites) satisfies …"). A lesson at a missing station is also refused. | check_lx §4 |
| Progress stored only for opted-in adults | — | stored in 1 of 6 cases (opted-in adult). Not stored for K-12, demo, signed-out, no adult attestation or not opted in. Revoke deletes; a missing consent deletes on the next read. | check_lx §6, §6b |
| Figure API called; voice off by default; captions always | — | headless: 18 speak events to the mount, 0 spoken with voice off, captions for every line | check_lx §5, §5b |
| Built page, parishes (sf-downtown, high, SwiftShader, ?lxLesson=ad-robot-cell-lockout-and-safe-reentry) | — | the lesson ran, led by Selka (software agent, the robot cell's home agent). Her figure was at rb-site-soma-robot-cell, captioned with the step-1 line after 20 s (4 events sent, 3 lines). Voice off. 0 page errors. | drive 1 ($SP/loop10/lx/drive.mjs) |
| Built page, instructor console | no tab | the Agent lessons tab shows 6 packs. A preview showed 18 lines by phase. Assigning stored {"pack":"lx-pack-parish-robot-sites"} only. 0 page errors, 0 off-host requests (three.js served locally) | drive 2 ($SP/loop10/lx/drive2.mjs) |

Source: `docs/consoles/LESSONS-X.md` at the merged head 112a4d68, the evaluation table as the console wrote it (before → after, with its sources).


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
