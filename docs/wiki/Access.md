# Getting into and out of every building

Marked, lit, step-free entrances, four walk-in room kinds, and one way in and out by keyboard, touch, gamepad and headset.

## Step-free entrances and walk-in rooms

### Round 8: `ACCESS`, marked, step-free entrances and new walk-in interiors

Round 8: `ACCESS`, tip 112a4d68 (read at the merged head 112a4d68), 3 commits of its own since a10f1ff8, merged into the head of round 8, 112a4d68; its console note is committed, and the table below is that note’s own. Each figure is a token of the commit message or note row it is quoted from, checked when this page is built.

- four walk-in interiors for the cued kinds (fire bay, drop-off lobby, classroom wing, park pavilion) with agent spots ()

- marked, lit, step-free entrances with pictogram signs on every site building; cued kinds open the new rooms; one input grammar (XR select joins E, touch Use, pad A); street on the HUD; check_acc ()

- drive_acc proves in and out by all four inputs in the built page (4 of 4, page errors 0); styleOf test hook; console note, memory and next brief ()

| eval | before | after | source |
|---|---|---|---|
| enterable buildings with a marked, lit door and a step-free route | 0 of 863 (no marking existed) | 863 of 863 on 46 maps (740 by a route to a street, 123 by an open apron only); per map N of N on every map | node tools/check_acc.mjs ("marked door + step-free route" and "per map" lines) |
| ramps where the sill is raised | — | 0 of 0 needed: no site building's sill differs from its door spot's ground by > 2 cm on any map (measured) | check_acc §1 |
| new interior kinds | 0 | 4: fire bay 17 meshes / 780 tris, drop-off lobby 17 / 720, classroom wing 18 / 984, pavilion 17 / 708 (high; with 4 pads); texture 1.33 MiB (two 512×256 canvas signs) ≤ 24 MiB high and ≤ 3 MiB balanced | check_acc §3, check_interiors |
| pads reachable from the door | — | 16 of 16 (high), every agent spot and board too, on both tiers (grid search round colliders taller than the step, then NEWTON's walk) | check_acc §3 |
| cued sites that open their room and return to the exact pose | — | every site of the four kinds on all 46 maps (CLASSROOMS' sites excepted) | check_acc §4 |
| entrance budget | — | 2 meshes a map high and balanced, 0 low; ≤ 360 / 168 triangles an entrance; worst chunk ≤ 4,800 / 2,400; 0 texture, 0 light; headset 0 | check_acc §2 |
| in and out by all four inputs | 3 of 4 wired (E, touch Use and pad A called npUse; the XR session's select did nothing) | 4 of 4 in the built page: keyboard at the hospital (drop-off lobby), touch at a park (pavilion), gamepad A through a stubbed getGamepads at the fire station (fire bay), headset select through a stubbed XR session at the hospital. Each went in and came back out to the exact door-spot pose | node tools/drive_acc.mjs 9168 … orleans → "PASS drive_acc: 7 ok, 0 failed, external requests 0, 189 s" |
| entrances in the built page (Orleans, high) | — | 2 meshes, 7,980 triangles, 35 entrances; 12 sites open an ACCESS room | the same drive |
| HUD wayfinding | inside: the room's label; outside: the district only | inside: "Hospital drop-off lobby / generic room · Medical District Hospital Campus"; outside: "Tulane Avenue · the medical district", or "local street · Mid-City" | the same drive |
| page errors | — | 0 | the same drive |
| check_interiors · check_robo_interiors | 1,061 (approx.) · 302 | 1,085 · 302 pass | each checker |
| check_walkable (headless leg) · check_newton · check_interface | — | 2,720 passed · all pass · 21 passed, 0 failed (UX_PORT=9168) | each checker |
| check_imports · check_parse | — | all 1,142 modules · all 2,727 modules | each checker |

Source: `docs/consoles/ACCESS.md` at the merged head 112a4d68, the evaluation table as the console wrote it (before → after, with its sources).


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
