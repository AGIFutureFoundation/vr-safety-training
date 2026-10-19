# Console ENV-HD-9

- Console: ENV-HD-9 (loop 10, round 9, prefix `hd9`, port 9173)
- Brief: `$SP/loop10/brief-r9.md` (section "ENV-HD-9"), under the Rules of `$SP/loop10/brief.md` (lines 11–28),
  `brief-r6.md`, `brief-r7.md` and `brief-r8.md`; predecessor `docs/consoles/ENV-HD-8.md`, next briefs
  `tools/briefs/next/hd8-next.md` and `rhd3-next.md` item 1
- Base: 61d85871 (fast-forward, confirmed). Owns `hd*-*.js`, `fc-*.js`, `fx-*.js` and the INTERIORS shell's port room wall.
- One hour (01:29–02:30 UTC). Items 3, 1 and 4 done; item 2 (kerbside variants) not started.

## What is here
- **The port control room's window is a real opening** (brief item 3, rhd3-next 1; `WebXR/shared/ix-interiors.js`).
  `IX_OPENINGS["ixr-port-control"] = [{ wall: 0, x0: -6.5, x1: 6.5, y0: 1.0, y1: 3.0 }]`: the shell builds the north wall
  as a sill (0–1.0 m, named `ix-wall-0` so ROBO-INTERIORS', ENV-HD-2's and Ultra's skins still find it), a lintel
  (3.0–3.8 m) and two piers (x −8.3..−6.5 and 6.5..8.3), all on the one shared wall material; the hole is x −6.5..6.5
  (13 m), y 1.0..3.0 (2 m), through z −6.0 (inner face) to −6.3 (outer face). The wall collider stays the whole wall and
  the walk clamp holds at z −5.6. `room.openings` reports it (`{ wall, side, x0, x1, y0, y1, zIn, zOut, w, h }`) for the
  dressers. The span is exactly ROBO-INTERIORS' picture plane (13 × 2 at z −5.99, y 1–3) and its nine mullions at
  x = −6.5 + i × 1.625, so the picture covers the hole from every interior viewpoint: nothing shows until ROBOTS-HD-4
  moves the picture 20–40 m out and stands the carrier beyond z −6.3. Posted in the heartbeat at 01:35 (minute 6).
  +3 meshes, +36 triangles on every tier; the dressed port room (shell + ixr + rhd + hd4 + skins) 29 meshes / 2,092
  triangles on high (was 26 / 2,056).
- **`tools/check_hd9.mjs`** (31 checks, in `check_all`, an estimated baseline row): the posted geometry; on three tiers
  a ray from inside the room through each of 85 sample points of the opening meets no shell wall while 8 rays at the
  sill, lintel and piers do; 7 wall meshes on one material; four wall colliders; the walk clamp; the combined room inside
  `IX_BUDGET` on every tier; every ray through the opening meets something beyond the room's air (today the picture,
  later the yard: never the void — the seam ROBOTS-HD-4's change meets); every other style keeps four solid walls.
- **The play yard behind the bus** (item 1, hd8-next 1; `hd3-scenes.js`, `hd6-kinds.js`, `WebXR/parishes/js/app.js`).
  `hd6Build`'s site records carry `footprint` ([x0, z0, x1, z1], the bbox of the site's cue parts); the app passes its four
  corners as `hd3Scene(..., { vehicles, subject })`. The solver keeps ENV-HD-8's camera unless a parked vehicle hides part of
  the cue (`hd3Occluders` over building + board + cue); then the first candidate — the street's own set plus spots 23, 29
  and 35 m along it — that shows all three unhidden, 3.5 m clear of massing and 12 m from the site's own building, takes
  over (NEWTON's cars clear first, then not). With no `subject` or no vehicles nothing runs: every camera is ENV-HD-8's.
  The school camera moves (−613.0, 97.5) → (−627.1, 112.4); the other six are unchanged (their cues were already unhidden).
- **Stills** (item 4): a wetland and a workshop site by day and night on sf-marina, looked at (below).

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| port room's north wall | one solid box; the window an opaque picture | **a real 13 × 2 m opening** (x −6.5..6.5, y 1.0..3.0, z −6.0..−6.3), 85 of 85 rays through it meet no shell wall, 8 of 8 beside it do, on 3 tiers | `node tools/check_hd9.mjs` §2 |
| port room inside budget on every tier, with every dresser | 26 meshes / 2,056 tris (high) | **29 / 2,092** (high), low inside 3,000; ≤ 120 meshes on all three | `check_hd9` §3, `check_robots_hd` §5 |
| rays through the opening meeting the void | — | **0** of 85 on 3 tiers (the picture still covers it) | `check_hd9` §3 |
| other room styles' shells changed | — | **0** of 33 | `check_hd9` §4 |
| school street shot with the yard visible | yard behind the bus (ENV-HD-8's Left) | **yard unhidden**: camera (−627.1, 112.4); building, board and yard clear of every vehicle | `check_hd6` ("the play yard was hidden … with the cue outline passed the camera moves"), still `sf-mission-school-street-day.jpg` (drive B) |
| street cameras with building, board and cue unhidden (fixture) | 6 of 7 | **7 of 7** (balanced and high); cameras moved whose cue was already unhidden: **0** | `check_hd6` ("with the cue outline passed") |
| street cameras with no subject passed | — | **ENV-HD-8's**, 7 of 7 | `check_hd6` |
| sites skipping a group | 24 of 297 | **24** (item 2 not started) | `check_hd6` |
| stills | 1 | **5** (wetland day/night, workshop day/night, school street re-shot) | `$SP/loop10/hd9/` |
| badly placed parts | 0 | **0** | `check_hd6` §2 |
| page errors / external requests | 0 / 0 | **0 / 0** (drive A, 340 s at load 38.6) | `$SP/loop10/hd9/driveA.txt` |
| `check_hd6` · `check_hd9` | 958 · — | **967 · 31** pass | each checker |
| `check_exteriors` · `check_interiors` · `check_robo_interiors` · `check_robots_hd` | 316 · 1,085 · 302 · 62 | **316 · 1,085 · 302 · 62** pass | each checker |
| `check_newton` · `check_imports` · `check_parse` | — | **pass · 1,148 modules · parse pass** | each checker |

## Stills (`$SP/loop10/hd9/`, 1920 × 1080 JPEG q90, built parishes page on port 9173, high tier)
| still | what | draw calls | triangles |
|---|---|---|---|
| `sf-marina-wetland-day.jpg` | `crissy-marsh-crew` three-quarter from 38 m: the timber deck on posts with rails and a step at the building's back-left, reed clumps along it, the gauge post (white, blue bands), the louvred screen on the door face; the marsh channel at left | 163 | 174,065 |
| `sf-marina-wetland-night.jpg` | the same at night: the board lamp lit, the town's windows behind | 165 | 183,225 |
| `sf-marina-workshop-day.jpg` | `ma-sw-western-addition-garment-workshop`: the roll-up door flush on the wall beside the entrance, the lean-to over its workbench at the right, pallet and timber stack, two roof vents (an outlying site on open ground) | 55 | 135,370 |
| `sf-marina-workshop-night.jpg` | the same at night | 55 | 129,470 |
| `sf-mission-school-street-day.jpg` | `mission-school-campus:street` with the app's parked vehicles and the cue outline passed | see drive B | — |

## Cycles
1. Reason: ROBOTS-HD-4 waits on the opening, so it goes first; proof = rays through the hole meet no wall. Act: the wall
   as sill, lintel and piers from `IX_OPENINGS`, the collider whole. Observe: 16 shell meshes, interiors 1,085 /
   robo_interiors 302 / robots_hd 62 unchanged; geometry posted at minute 6. Commit 7d24e92f with `check_hd9`.
2. Reason: the hole must not show the void when the picture moves; proof = every ray through it meets something.
   Act: `check_hd9` §3 tests against every non-shell mesh (today the picture). Observe: 85 of 85 on three tiers.
3. Reason: the yard behind the bus; ENV-HD-8 found that growing the subject for every pass moved two other cameras.
   Act: the cue as a last pass that runs only when the chosen camera has the cue hidden. Observe (first run): the pass
   loop's `break` left the inner loop only, so later passes overwrote the choice — 7 check_hd6 failures and a wrong
   hospital camera; fixed with an outer `break`. Then the school moves to (−627.1, 112.4), the other six stay, 967 pass.
   Commit 87ad6626.
4. Reason: in-page proof and the stills. Act: bundle, drive A (four stills, one map) and drive B (the school). Observe:
   page errors 0; the stills looked at (the wetland deck reads small from 38 m; the workshop's lean-to and roll-up door
   read clearly).

## Seams
- `ix-interiors.js`: `IX_OPENINGS` (exported), `room.openings`; the north wall's meshes `ix-wall-0` (sill),
  `ix-wall-0-lintel`, `ix-wall-0-pier-a`, `ix-wall-0-pier-b`.
- `hd3-scenes.js`: `hd3Scene(parish, siteId, shot, { vehicles, subject })`.
- `hd6-kinds.js`: `hd6Build(...)`'s `userData.hd6.sites[i].footprint`.
- `WebXR/parishes/js/app.js`: the scene handle reads `hd6Cues.userData.hd6.sites` for the site's footprint.
- `tools/check_hd9.mjs` (new, in `check_all.mjs`; `docs/perf/checkers-baseline.json` row is an estimate, 1 s).

## Left
- **Kerbside variants** (item 2, hd8-next 2) not started: 24 sites still skip a group.
- **The yard beyond the window** is ROBOTS-HD-4's: move the picture 20–40 m out (and widen it to fill the view), stand
  the carrier at full scale beyond z −6.3; `check_hd9` §3 will then prove no void through the hole in their build.
- Port cue for the 22 catalog port sites (hd8-next 3), the next kinds (hd8-next 4).
- `check_hd9`'s and `check_hd6`'s baseline rows stay estimates (load 3–38 this hour).
- The dist files were rebuilt for the drives and restored; the integration rebuild carries these changes.
