# Console ENV-HD-8

- Console: ENV-HD-8 (loop 10, round 8, prefix `hd8`, port 9164)
- Brief: `$SP/loop10/brief-r8.md` (section "ENV-HD-8"), under the Rules of `$SP/loop10/brief.md` (lines 11–28),
  `brief-r6.md` and `brief-r7.md`; predecessor `docs/consoles/ENV-HD-7.md`, next brief `tools/briefs/next/hd7-next.md`
- Base: a10f1ff8 (fast-forward, confirmed `a10f1ff8646dc1eda3bf18f6e07c231bd2c0e49a`). Owns `hd*-*.js`, `fc-*.js`, `fx-*.js`.
- The session was stopped by the account's usage limit from about 20:36 to 21:20 UTC; work resumed after.

## What is here
- **Parked vehicles in the street solver** (hd7-next 1; `WebXR/shared/hd3-scenes.js`). `hd3Scene(parish, siteId, shot,
  { vehicles })` takes the vehicles the page parked (MOTORWORKS' placements, `{ x, z, heading, dims }`); the parishes app
  passes `mvPark.parked` (shown ones). A plan-view sight line was not enough: the school bus stood about 8 m off the line to
  the subject yet crossed the building's foot in the 62-degree frame. The test is occlusion (`hd3Occluders`): a vehicle
  nearer the camera than the subject whose bearing span (its corners plus 2 degrees) overlaps the span of the building's four
  corners and the job board hides part of it. The vehicles count in the first two passes (with NEWTON's cars, then alone);
  the camera also stands 0.5 m clear of every vehicle. With no vehicles passed the seven cameras are ENV-HD-7's (checked).
  Only the school campus camera moves: (-605.8, 73.8) → (-613.0, 97.5).
- **Smaller variants before a group is skipped** (hd7-next 2; `hd6-kinds.js`). `hd6CueParts(..., side, variant)`: "full"
  (default, byte-identical to before at every site: 1,000 of 1,000 part lists and 217 of 217 fully fitted sites compared
  against the previous module), "small" (shallower aprons, a porch canopy, a short pull-in lane, a 7 m yard, an 8 m compound,
  a 4 x 3.4 m pavilion, a 4 m path stub, a 3 m bed, a smaller shed) and "back" (the small pavilion behind the building, the
  bed along a side wall). `hd6FitCue` tries full (both sides), then small (both sides), then back (both sides), then skips;
  its result adds `small`. The fire station's bay doors go flush on the wall with no aprons (`baydoors`, a fallback on the
  building, like the H wall sign) where the bays cannot fit. `HD6_FALLBACK`, `HD6_SMALL`, `HD6_BACK` are exported.
- **The next kinds** (hd7-next 3). Wetland (24 sites): a timber viewing deck on posts with rails and a step, reed clumps, a
  water-level gauge post (white with blue bands, no numbers), a timber fascia and louvred screen on the door face; the deck,
  reeds and gauge may stand in the water (`HD6_WET`: 13 of the 24 wetland buildings stand in a marsh) and are exempt from the
  water test only. Workshop (23): a roll-up door flush on the wall, a lean-to over a workbench, a pallet and timber stack,
  two roof vents. No signs, no words, no logos, no emblems. **Port** (22 catalog sites) is a robot kind: ROBO-EXTERIORS'
  port control tower (`FX_SITE_KIND` portTower) dresses the port-automation robot site; `fxSitesFor` lists RB_SITES only, so
  no catalog port site is a robot site, but port is left to the robot exteriors this round (`HD6_KIND_COUNTS` records why).

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| street cameras with no parked vehicle hiding the building or board (placements fixture, balanced and high) | 6 of 7 (the school: school bus) | **7 of 7**; camera inside a vehicle 0 | `node tools/check_hd6.mjs` ("street cameras clear of parked vehicles"), independent ray test in the checker |
| street cameras unchanged with no vehicles passed | — | **7 of 7** | `check_hd6` |
| school street shot in the built page | bus across the building's foot (ENV-HD-7 still) | camera (-613, 2.5, 97.5) = headless; door, canopy and building clear; 115 draw calls, 210,872 triangles; the bus now stands beside the building in front of the play yard (see Left) | drive A `$SP/loop10/hd8/driveA.txt`, still `sf-mission-school-street-day.jpg` |
| sites skipping a group | 33 of 250 | **24 of 297** (smaller variants at 19 sites: pavilion back 8, bed back 6, path 4, bays 3, bed 1, canopy 1, lane 1, yard 1, compound 1, lean-to 1); the 24 have the street at the door (hospital canopy and lane 8, park path 8, pavilion 4, bays 3 with wall-flush doors in their place) or water round the building | `check_hd6` ("sites skipping a group"), `$SP/loop10/hd8/skips.mjs` |
| kinds with a cue | 6 | **8** (+ wetland 24 of 24, workshop 23 of 23, all in full) | `check_hd6` ("sites cued by kind") |
| badly placed parts (road / water / building / cue / board / buried) | 0 | **0 / 0 / 0 / 0 / 0 / 0**, ENV-HD-6's independent test 0 | `check_hd6` §2 |
| per-chunk budgets with FACADES, every cued chunk, all 46 maps, balanced and high | inside | **inside** | `check_hd6` §3 |
| cue mesh per map (low / balanced / high), headless | orleans 0 / 4,536 / 6,888; sf-mission 0 / 4,824 / 10,896; sf-marina 0 / 4,740 / 10,092 | orleans **0 / 5,424 / 8,616** (16 sites); sf-mission **0 / 5,292 / 11,940** (15); sf-marina **0 / 5,196 / 11,100** (14); still 1 mesh, 2 draw calls; worst site 480 / 1,968 (budget 1,200 / 3,600) | `$SP/loop10/hd8/measure.txt` |
| the same in the built page (sf-mission, high) | 10,896 tris, 12 sites | **11,940 tris, 15 sites, 2 calls**, 0 skipped = headless | drive A |
| phone tier and headset | nothing built | **nothing built** (all 46 maps) | `check_hd6` §1b, §6 |
| page errors / external requests | 0 / 0 | **0 / 0** | drive A (123 s, load 45.2) |
| `check_hd6` | 934 | **958** pass | `node tools/check_hd6.mjs` |
| `check_exteriors` · `check_hd4` · `check_facades` | 316 · 127 · 2,977 | **316 · 127 · 2,977** pass | each checker |
| `check_newton` · `check_imports` · `check_parse` | — | **all pass · 1,141 modules · 2,726 modules parse** | each checker |

## Stills (`$SP/loop10/hd8/`, 1920 × 1080 JPEG q90, built parishes page on port 9164, high tier)
| still | what | draw calls | triangles |
|---|---|---|---|
| `sf-mission-school-street-day.jpg` | `mission-school-campus:street` with the app's parked vehicles passed | 115 | 210,872 |

## Cycles
1. Reason: the school shot needs the parked vehicles; proof = a `check_hd6` line over the seven cameras with a placements
   fixture. Act: `hd3Scene` `{ vehicles }` with a plan sight-line test. Observe: no camera moved — the bus is 8 m off the
   line, so the line test passes while the bus still crosses the frame.
2. Reason: test what the frame shows. Act: occlusion by bearing span (`hd3Occluders`), the app passes `mvPark.parked`.
   Observe: 6 of 7 → 7 of 7, school camera moved, the other six unchanged, default cameras unchanged; check_exteriors' wiring
   regex updated in the same commit (an optional argument). Commit 8c180c4e.
3. Reason: 33 sites skip a group; proof = the skip count down with §2 still 0. Act: small variants. Observe: 33 → 26; the
   fault listing showed the street at the door for most of the rest.
4. Act: wall-flush bay doors (fallback), the pavilion behind the building, the bed along a side; a doorstep path was tried and
   removed (the carriageway reaches the wall). Observe: 24; full variants identical to the previous module (after two
   floating-point fixes found by the comparison). Commit 59cea704.
5. Reason: kinds 6 → 8. Act: wetland and workshop cues. Observe: workshop 23 of 23; wetland 11 of 24 in full (13 stand in a
   marsh) → the deck, reeds and gauge may stand in water (only that test waived) → 24 of 24; check_hd6 958. Commit b8961ce2.
6. Reason: in-page proof. Act: bundle, one drive on 9164. Observe: page errors 0, the page's camera = headless, cue counts
   = headless. Tried growing the occlusion subject by the cue lot (12 m) to keep the bus off the play yard: no clear camera
   at the school and two other cameras moved, so it was reverted (not committed).

## Seams
- `hd3-scenes.js`: `hd3Scene(parish, siteId, shot, { vehicles })`, `HD3_VEH_MARGIN`, `hd3VehicleCorners(v)`,
  `hd3VehicleHit(vehicles, x, z, m)`, `hd3Occluders(vehicles, px, pz, subject)`.
- `hd6-kinds.js`: `hd6CueParts(parish, site, tier, side, variant)`, `HD6_SMALL`, `HD6_BACK`, `HD6_FALLBACK` (now exported,
  + `baydoors`), `HD6_WET`, `HD6_KIND_COUNTS`; `HD6_MORE_KINDS` adds wetland and workshop; `hd6FitCue` returns `small`.
- `WebXR/parishes/js/app.js`: the scene handle passes `(mvPark?.parked ?? []).filter((v) => !v.hidden)`.

## Left
- **The bus and the school's play yard.** The bus no longer hides the building, door or canopy, but stands in front of the
  play yard. Counting the yard as subject finds no clear camera on the current candidates; more candidates (farther along
  the street) or passing the cue footprints as the subject is next.
- The park crew yard's camera stands 0.4 m from a parked ride-on mower's corner (out of the subject's span; not moved).
- The 24 sites still skipping a group have the street at the door or water round the building: a kerbside variant (a
  canopy over the footway) would need the sidewalk geometry.
- Port cue: decide with ROBOTS-HD whether catalog port sites take a generic cue (bollards, a container stack edge).
- Not run (shared machine): `check_mobile`, `check_walkable`'s browser leg, `eval_worlds`; `check_interface` not needed
  (no control added). `check_hd6`'s baseline row stays an estimate (now about 20–60 s on a loaded machine).
- The dist files were rebuilt for the drive and restored; the integration rebuild carries these changes.
