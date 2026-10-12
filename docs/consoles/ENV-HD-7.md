# Console ENV-HD-7

- Console: ENV-HD-7 (loop 10, round 7, prefix `hd7`, port 9155)
- Brief: `$SP/loop10/brief-r7.md` (section "HIVE-7, AVATARS-HD-4, ENV-HD-7, ROBOTS-HD-2"), under the Rules of
  `$SP/loop10/brief.md` (lines 11–28) and `$SP/loop10/brief-r6.md`; predecessor `docs/consoles/ENV-HD-6.md`, next brief
  `tools/briefs/next/hd6-next.md`
- Base: 40d97421 (fast-forward, confirmed `40d9742128f6471e0cf1bde104ca82897b30c4b1`)

## What is here
- **Every site of the four kinds** (hd6-next 1; `WebXR/shared/hd6-kinds.js`). `hd6KindSites` now returns every park, fire
  station, hospital and school site on the loaded map (the four presets first, then by station count), not only the
  busiest. Each site's cue is **fitted group by group** (`hd6FitCue`): a group (bays, trim, tower; canopy, lane; yard;
  pavilion, path, bed, shed, roof) goes on its preferred side (away from the board), else the other side, else it is
  skipped — never on a carriageway, in the water, into another building or another site's cue, or within 1.5 m of the
  board. Where a hospital's canopy cannot fit (a street close to the door) the H sign goes on the wall over the door; where
  a school's canopy cannot fit, a teal entrance surround frames the door. The parts on the building itself (roof, trim, wall
  sign, entrance surround: within 0.5 m of its walls) may stand where the engine's own building stands (over water at a fort
  on a levee, at a carriageway's edge for a clinic on a narrow street) — the building is the engine's, not a cue placement.
  The presets keep ENV-HD-6's parts exactly (checked), so its stills stand. Still one merged mesh per map.
- **The next kinds** (hd6-next 2). Counted from the catalog (46 maps): construction 91 (the robot and crane sites' kind,
  with its own exteriors), park 54, fire station 46, school 43, hospital 40, **utility 36, substation 31**. Utility and
  substation sites take a fenced equipment compound beside the building (gravel pad, chain-link fence with a gate gap,
  three transformers with bushings and fins, or two cabinets and a pipe rack) and a rooftop unit. No signs, no words.
- **The H sign at night** (hd6-next 3). The sign's square and letter are drawn by a second material on the same mesh
  (`MeshBasicMaterial`, vertex colours, geometry group 1): it reads at night with no light. Cost: +1 draw call on a map
  with a hospital sign, 0 triangles added, 0 lights, 0 texture bytes.
- **The school's street shot** (ENV-HD-6's Left; `WebXR/shared/hd3-scenes.js`). The things between the camera and the
  canopy were NEWTON's two parked site cars (`mv-world.js` `mvPropPoints`) and a parked MOTORWORKS bus. `hd3PropRects`
  adds the cars to the street solver: a first pass keeps the sight line clear of them (half-size 3.5 m); the old passes
  are the fallback. Two street cameras move: the school campus (-604.3, 95.7 → -605.8, 73.8) and the park crew yard
  (-543, -50 → -525.8, -67.3); the other five are unchanged. Moving the play yard to the camera's side was tried first and
  does not fit (11 parts within 1.5 m of the board), so the yard stays where it was.

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| sites with a kind cue | **4** (one preset of each of four kinds) | **250 of 250** sites of six kinds on 46 maps: fire station 46 of 46, hospital 40 of 40, school 43 of 43, park 54 of 54, utility 36 of 36, substation 31 of 31 | `node tools/check_hd6.mjs` (the "sites cued by kind" line) |
| sites with every part group | 4 | 217 of 250 (fire 40, hospital 31, school 41, park 40, substation 31, utility 34); the rest skip a group that cannot fit | `$SP/loop10/hd7/measure.mjs` |
| kinds with a cue | 4 | **6** (+ utility, substation) | `check_hd6` |
| cue parts on a road / in water / in a building / in another cue / by the board / buried, every site | — (4 sites) | **0 / 0 / 0 / 0 / 0 / 0** of 12,121 parts; ENV-HD-6's own test re-run independently: 0 of 12,121 | `check_hd6` §2; mutation (fitting disabled): "519 of 12121 parts on a road, in water, in a building or by a board" |
| cue triangles per site, worst (budget balanced 1,200 / high 3,600) | 480 / 1,968 | **480 / 1,968** (the school preset; no site over) | `measure.mjs`, `check_hd6` |
| cue mesh per map, headless (low / balanced / high) | orleans 0 / 2,028 / 2,244; sf-mission 0 / 1,824 / 3,312; sf-marina 0 / 1,572 / 1,716 | orleans **0 / 4,536 / 6,888** (14 sites); sf-mission **0 / 4,824 / 10,896** (12); sf-marina **0 / 4,740 / 10,092** (12); still 1 mesh, 2 draw calls where a hospital sign stands | `measure.mjs`; `check_hd6` "triangles measured = model" |
| the same in the built page (sf-mission, high) | 1 mesh, 3,312 tris | 1 mesh, 2 calls, **10,896** tris (12 sites, sign 252 tris), school street shot 121 draw calls, 219,095 tris (ENV-HD-6: 115, 227,794) | drive A (`$SP/loop10/hd7/driveA.txt`) |
| chunk meshes and triangles with FACADES, every cued chunk (summed over the sites in a chunk) | inside FC_BUDGET (4 sites) | **inside FC_BUDGET** on balanced and high, every cued chunk on all 46 maps | `check_hd6` §3 |
| H sign readable at night | by the street lamps only | **lit** (unlit material; 0 lights, 0 texture bytes, +1 draw call) | `check_hd6` §3b; still `orleans-hospital-street-night.jpg` |
| street cameras with a sight line clear of the site cars | 5 of 7 | **7 of 7** | `check_hd6` |
| street cameras clear of every tree crown (5 m) | 7 of 7 | **7 of 7** | `node tools/check_exteriors.mjs` (316 pass) |
| phone tier and headset | nothing built | **nothing built** (`hd6Build` null on low and in a headset browser, on all 46 maps); np-world.js untouched | `check_hd6` §1b and §6 |
| page errors / external requests | 0 / 0 | **0 / 0** in drives A and B | the drives' last lines |
| `check_hd6` | 118 | **934** pass | `node tools/check_hd6.mjs` |
| `check_exteriors` · `check_hd4` · `check_facades` | 316 · 127 · 2,977 | **316 · 127 · 2,977** pass | each checker |
| `check_newton` · `check_imports` · `check_parse` | — | **60 checks, 0 failed · all 1,137 modules · pass** | each checker |

## Stills (`$SP/loop10/hd7/`, 1920 × 1080 JPEG q90, built parishes page on port 9155, high tier, buttons hidden)
| still | what | draw calls | triangles | notes |
|---|---|---|---|---|
| `sf-mission-school-street-day.jpg` | `mission-school-campus:street` | 121 | 219,095 | the canopy's yellow posts and teal slab by the door and the fenced play yard now show; a parked MOTORWORKS bus still crosses the building's foot |
| `sf-mission-school-street-night.jpg` | same, night | 122 | 217,071 | |
| `orleans-hospital-street-night.jpg` | `hospital-district:street`, night | 211 | 160,723 | the H reads lit at night; canopy, lane, the board lamp on its post |
| `sf-mission-hospital-potrero-site-day.jpg` | a non-preset hospital, three-quarter view | 161 | 260,371 | canopy, lane with kerb lines, the H sign |
| `sf-mission-fire-station-noe-valley-site-day.jpg` | a non-preset fire station | 67 | 162,512 | two red bay frames, aprons, trim band, the hose tower; the board lamp on its post |
| `sf-marina-school-inner-richmond-site-day.jpg` | a non-preset school | 51 | 124,424 | entrance canopy, the fenced play yard with its frame |
| `sf-marina-park-street-day.jpg` | `presidio-crew-yard:street` (camera moved) | 118 | 110,551 | the crew house's green gable roof, timber gable end and corner boards, the board and its lamp; no crown overhead, no car in the sight line |
| `orleans-substation-lakeview-site-day.jpg` | a substation (a next kind) | 270 | 230,307 | the fenced compound with three transformers and their bushings beside the building, the rooftop unit, the board lamp |
| `orleans-fire-station-street-night.jpg` | `no-sw-mid-city-fire-station:street`, night | 177 | 209,446 | unchanged from ENV-HD-6 (176 → 177 calls with the sign group) |

Drive C (`driveC.txt`, on the final bundle: "page errors 0, external requests 0, 137 s, load 26.48"): Orleans in the page
14 sites, 6,888 cue triangles, sign 336, 2 draw calls, 35 lamps — the same as the headless model.
Drive A (`driveA.txt`: "page errors 0, external requests 0, 635 s, load 36.88") and drive B (`driveB.txt`: "page errors 0,
external requests 0, 389 s, load 29.99"). The non-preset views stand 34 m out of the door face and 12 m up; the page streams
the world round the preset it was last sent to, so the far massing is sparse in those frames (the cue mesh is map-wide).
Four drive A stills of non-preset sites were set aside in `rejected/` (the app re-applied the preset camera; the probe now
wraps the renderer). Drives A and B ran on the bundle built before the utility/substation commit (sf-mission and sf-marina
carry no difference except sf-marina's one substation).

## Cycles
1. Reason: hd6-next 1 wants every site; proof = `check_hd6` over every site. Act: `hd6KindSites` returns all sites; the
   checker re-tests §2 at every site of 46 maps and sums the chunk budget per chunk. Observe: 10 failures (materials,
   Ultra counts) and then 9 sites with no cue and placements flagged — the module's own test caught paths, lanes and roofs
   meeting their own site's groups.
2. Reason: a fitted site must still read; proof = every site cued. Act: only free-standing groups (yard, pavilion, shed,
   bed, compound) keep clear of each other; fallbacks (wall H sign, entrance surround) where the canopy cannot fit;
   on-building groups may stand where the building does. Observe: 183 of 183, then 250 of 250 with the next kinds; the
   presets keep ENV-HD-6's parts; mutation (fitting off) fails the independent test (519 parts).
3. Reason: the school's street shot; proof = the sight-line check and a still. Act: first the yard to the camera's side —
   it cannot fit (board). Then NEWTON's site cars in the street solver. Observe: 7 of 7 sight lines clear, check_exteriors
   316; the still shows the canopy and yard; a MOTORWORKS bus (placed with NEWTON's world, not reachable from the solver)
   still crosses the building's foot.
4. Reason: the H at night; proof = still and the material check. Act: a second material group, unlit. Observe: the H
   reads at night in `orleans-hospital-street-night.jpg`; 0 lights, 0 textures.
5. Reason: budgets in the page; proof = drive A's `hd6()` counts against the headless model. Observe: sf-mission 10,896
   tris both ways, 2 draw calls; page errors 0, external requests 0.

## Seams
- `hd6-kinds.js`: `HD6_MORE_KINDS`, `HD6_CUED_KINDS`, `HD6_ON_BUILDING`, `hd6KindSites` (all sites; `hero` flag),
  `hd6HeroSites`, `hd6CueParts(parish, site, tier, side?)` (parts carry `group`, `glow`), `hd6FitCue(parish, site, tier,
  taken)`, `hd6Obstacles`, `hd6PartFault`, `hd6Footprint`; mesh `userData.hd6` adds `signTriangles`, `drawCalls`, and per
  site `hero`, `skipped`.
- `hd3-scenes.js`: `HD3_PROP_HALF`, `hd3PropRects(parish)` (imports `mvPropPoints` from `mv-world.js`, already earlier in
  the parishes bundle list).

## Left
- **The MOTORWORKS bus** in the school's street shot: `mvPlacements` needs NEWTON's world, so the solver cannot see parked
  vehicles. Passing the app's placements into `hd3Scene` (an optional argument) is the next step.
- **Frame time on real hardware** for Ultra (hd6-next 4) — no hardware here.
- **Quiet re-measure** of `check_hd6`'s row (now an estimate of 20 s).
- 33 sites skip a group (mostly park pavilions and hospital lanes on tight lots); a smaller variant would let them keep it.
- Not run (shared machine): `check_mobile`, `check_walkable`'s browser leg, `eval_worlds`; `check_interface` not needed (no
  control added or changed).
- The dist files were rebuilt for the drives and restored; the integration rebuild carries these changes.
