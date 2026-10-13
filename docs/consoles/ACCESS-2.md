# Console ACCESS-2

- Console: ACCESS-2 (loop 10, round 9, prefix `acc2`, port 9176)
- Brief: `$SP/loop10/brief-r9.md` (section ACCESS-2), under the Rules of `brief.md`, `brief-r6.md`, `brief-r7.md` and `brief-r8.md`
- Base: 61d85871 (fast-forward, confirmed)
- Predecessor: `docs/consoles/ACCESS.md`, `tools/briefs/next/acc-next.md`

## What is here
- **Street routes by a dry-ground path search** (`acc-access.js`, `accPathRoute`, `ACC_ROUTE`). ACCESS left 123 entrances
  with an open apron only: 28 whose straight and one-corner legs crossed water and 95 with no CITYWORKS line within 400 m
  (the nearest 400–1,370 m away). Where those legs fail, `accStepFree` now runs an A* over 4 m cells, each cell clear of every
  site footprint (+ the avatar radius), out of water and inside the map, to the nearest street point and to the nearest street
  points of probes 300 and 600 m out in eight directions (one search, up to 17 goals, the heuristic the distance to the nearest).
  The found path is then sampled every metre like the straight legs; a leg that crosses a stream narrower than a cell closes
  its cells and the search runs again (eight times at most). The route says how it was found (`via: "straight" | "path"`) and,
  when it fails, why (`pathBlocked`, with `detail`).
- **A real opening to read** (`accParts`): a dark door panel (0x23272c) inside the frame, its face 5 cm behind the jambs' —
  the jambs stand 0–8 cm proud of the facade, the panel 0–3 cm, since the engine's box building has no opening to cut — and on
  high a push bar across it at 1.0 m. No words, no emblem. Balanced sits exactly at its 168-triangle budget (14 parts), high at
  264 of 360 (22 parts).
- **The combined chunk count** (`accChunkTriangles(parish, tier)`, `check_acc` 2b, `drive_acc2.mjs`): FACADES' details +
  ENV-HD-6/7's kind cues (each site's cue charged to every chunk its footprint touches, as `check_hd6` charges it, plus 48
  triangles a board lamp) + the entrance parts by the door's chunk, per cued chunk, balanced and high, against `FC_BUDGET`.
  Headless on all 46 maps; in the built page (Orleans, both tiers) at every kind-cued site's door after the detail pool drains.
  The two entrance meshes are per map, so they add no mesh to any chunk. The app exposes `__parishTest.access.chunks()`.
- **Stills** by day and night from the built page, in `$SP/loop10/acc2/` (see Stills).

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| entrances with a street route | 740 of 863 (123 open apron only) | **839 of 863** (740 straight or one corner + 99 by the path search; 24 open apron only, 0 neither); the 24 listed by reason: 18 in water and 4 with no street within 400 m with no dry path to any street point (islands of 750–1,020 reachable cells), 2 whose every found path crossed water on a sampled leg | `node tools/check_acc.mjs` ("marked door + step-free route", "entrances with a street route", "no street route (N)") |
| marked door + step-free route (street or apron) | 863 of 863 | **863 of 863**, per map N of N on all 46 | `check_acc` §1 |
| path routes that start at the door spot and end on a street | — | **99 of 99** (420–1,407 m, 90–343 cells each) | `check_acc` §1 ("the path route runs from the door spot to a street") |
| recessed door panel inside the frame (5 cm behind the jambs, darker, full height) | 0 of 863 | **863 of 863** | `check_acc` §1 ("every entrance has a recessed door panel") |
| entrance triangles | balanced 156, high 240 an entrance | **balanced 168 ≤ 168, high 264 ≤ 360**; Orleans 35 entrances: 5,880 / 8,820 triangles, 2 meshes; worst chunk ≤ 2,400 / 4,800; 0 texture, 0 light; phone 0; headset 0 | `check_acc` §2 |
| combined chunk count, headless (FACADES + cues + lamps + entrances per cued chunk) | not summed | **inside FC_BUDGET on every cued chunk, balanced and high**; worst balanced sf-bayview 2,1: 11,322 + 156 + 0 = 11,478 of 24,000; worst high sf-marina 14,10: 10,640 + 1,464 + 252 = 12,356 of 24,000 (2 FACADES meshes + 1 cue mesh of 6) | `check_acc` 2b |
| combined chunk count, built page (Orleans, 16 kind-cued sites, measured at each door after the detail pool drained) | — | **high 16 of 16 inside 24,000**, worst the Lower Ninth Ward clinic's chunk 14,8: FACADES 3,552 + cues 180 + lamps 48 + entrances 252 = 4,032; **balanced 16 of 16**, worst the same chunk at 3,924 (entrances 168); entrances 2 meshes / 8,820 triangles / 35 entrances on high, kind cues 16 sites / 8,616 triangles / 35 lamps; FACADES per cued chunk 0–3,552 (two edge chunks hold no massing, so no FACADES group) | `node tools/drive_acc2.mjs 9176 $SP/loop10/acc2 orleans high,balanced` → "PASS drive_acc2: 41 ok, 0 failed, external requests 0, 309 s" |
| door reads in the still | the white jambs read weakly on the dark door box (ACCESS); in this round's first stills the frame did not show at all (behind CITYWORKS' 0.17 m door box) | **reads by day and at night** at 3.2 m and 9 m: jambs, head, recessed panel, push bar, sill, lit lamp face; the jambs read grey in shade by day | the stills (below); second drive "PASS drive_acc2: 21 ok, 0 failed, external requests 0, 181 s" (high, 16 of 16 chunks, 0 errors) |
| page errors | — | **0** on high and on balanced (both drives) | the same drive |
| `check_acc` | 1,467 | **1,569 passed, 0 failed** | the checker |
| `check_interiors` · `check_walkable --no-browser` | 1,085 · 2,720 | **1,085 · 2,720 passed, 0 failed** | each checker |
| `check_newton` · `check_imports` · `check_parse` | — | **pass · all 1,148 modules · all 2,733 shipped modules** (parse ran at 27cc36bf under load 24; `check_acc` imported the final module after) | each checker |
| headless route time, all 863 entrances | about 10 s (`check_acc` §1) | 6.3 s quiet with one goal; 33.5 s at load 18 with up to 17 goals (not re-timed quiet) | `$SP/loop10/acc2/reasons.mjs` |

## Cycles
1. Reason: before routing, know why the 123 fail; proof = a breakdown by reason. Act: `reasons.mjs` over all 863. Observe:
   28 water, 95 "no street within 400 m" (nearest 400–1,370 m; SF Marina, Bayview, the industrial and shoreline maps).
2. Reason: a path search over dry ground must stay cheap for `check_acc`; proof = time and cells. Act: A* on 4 m cells with
   the Euclidean heuristic, the found path re-sampled every metre. Observe: 740 → 829 in 6.3 s; the corridor opened 90–341
   cells per route; 34 left (26 water, 8 no street), 2 of them by a sampled leg crossing a stream the cell missed.
3. Reason: the nearest street point is across the water on the shoreline maps while another street is dry; proof = more goals.
   Act: goals from probes 300 and 600 m out in eight directions, one search. Observe: 829 → 838, one regression (a different
   goal's path failed its sampled leg and three retries ran out).
4. Reason: the retry budget, not the search, lost that entrance. Act: `ACC_ROUTE.retries = 8`; stable reason strings with the
   digits in `detail` so the checker can group by reason. Observe: 839 of 863; `check_acc` 1,569 passed, 0 failed.
5. Reason: the panel must read as recessed although the facade has no opening. Act: jambs 0–8 cm proud, panel 0–3 cm, a push
   bar on high; the checker measures the recess from the parts' geometry. Observe: 863 of 863, balanced exactly at budget.
6. Reason: the combined count needs the cue charge `check_hd6` uses, or the two checkers disagree. Act: `hd6FitCue` per site,
   footprint corners → chunks, + lamps + `accChunkTriangles`. Observe: worst high 12,356 of 24,000 (sf-marina 14,10).
7. Reason: the built page is the proof; the first drive failed a chunk for having no FACADES group and waited a minute per site
   for the pool. Act: a chunk at the map's edge legitimately has no massing; `detail.drain()` after the chunks stream instead
   of waiting for `pending === 0`. Observe: 41 ok, 0 failed, 309 s for both tiers; 16 of 16 chunks inside budget on each.
8. Reason: the first stills showed the sill and the lamp but no jambs, no head and a brown panel, not my slate one; a pixel at
   the jamb's place was the facade grey. Act: found CITYWORKS' own door box (`cw-streets-world.js`: 1.6 × 2.4 m, 0.01–0.17 m
   proud, brown) in front of the whole frame; `ACC_DOOR.proud = 0.18` moves the jambs, head, panel and push bar just past it,
   the recess unchanged. Observe: `check_acc` 1,569 passed; the re-shot stills (below).

## Stills
Stills are in `$SP/loop10/acc2/`, from the built page on port 9176 (Orleans, high, the Medical District Hospital Campus door on
Tulane Avenue, 3.2 m and 9 m out). I looked at each one.
- `orleans-hospital-door-day.jpg` (3.2 m, day): the door now reads as a door — two jambs, the amber head, the black recessed
  panel with the grey push bar at hand height, the amber sill strip, the lit lamp housing over the head, the pictogram sign
  on its post at the left. CITYWORKS' brown door box shows as a 0.2 m surround outside the jambs. The jamb faces toward the
  camera are in shade, so they read grey rather than white by day. The HUD reads "Tulane Avenue · the medical district".
- `orleans-hospital-door-night.jpg` (3.2 m, night): the lamp's lit face stays bright with no light (unlit material), the
  panel is black, the push bar and the sill still read; the jambs are dim grey.
- `orleans-hospital-entrance-night.jpg` (9 m, night): the framed door with its head and sill, the push bar, the lit lamp face
  over it, the sign with its walking figure, door and arrow; the street furniture and a cone around. The first run's stills
  (before `ACC_DOOR.proud`) showed only CITYWORKS' brown box, the sill and the lamp — the frame and panel were behind it.

## Seams
`acc-access.js`: `ACC_ROUTE`, `accChunkTriangles(parish, tier)`, `route.via`, `route.pathBlocked`, `route.detail`, `route.path`
(the found path's points). App: `window.__parishTest.access.chunks()`. `tools/drive_acc2.mjs` (port 9176). `check_acc` 2b.

## Left
- The 24 island entrances (listed by reason in `check_acc`) need CITYWORKS' fabric, a track or a boardwalk (acc2-next 1).
- The found path is proven, not drawn or spoken (acc2-next 2).
- The page's `mass-details-<key>` group reports fewer FACADES triangles than `fcDetails` headless at ring 0 (acc2-next 3).
- XR locomotion inside a room (acc-next 5) is still open.
- The route time with many goals was measured only under load.
- The parishes dist was rebuilt for the drive and restored; the coordinator's integration rebuild carries the change.
