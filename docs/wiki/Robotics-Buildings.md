# Robotics buildings, inside and out

The six robot sites as buildings: high-detail exteriors, walk-in rooms, the agents standing inside, and the budgets each tier holds.

## Robotics buildings, inside and out

The 6 robot sites of the Holodeck now have buildings. Exterior kits of 5 kinds stand at the sites, and a walk-in room waits behind each site’s door. They are generic by kind, drawn from code with textures painted on canvases, and none models a real building, a robot maker or a product. The robots are simulated, and nothing in a room moves.

- 6 of 6 robot sites with a walk-in robotics room, each reached by a door spot beside the pad (none had one before) `docs/consoles/ROBO-INTERIORS.md`
- 6 of 6 robot sites with a building of their own seen from outside, from 5 kits, with 12 of 12 establishing-shot presets (none before) `docs/consoles/ROBO-EXTERIORS.md`
- 70 of 70 station pads and agent spots reachable on foot from the door, with the game’s own walking step `docs/consoles/ROBO-INTERIORS.md`
- 68 of 68 sheds and towers within 150 m of a robot site take a robotics look, 0 beyond it, and the phone tier builds what it built before `docs/consoles/ENV-HD-2.md`
- 6 → 15 room styles with the high-detail texture set, with no mesh added; 807 of 863 site doors open into the 9 new ones `docs/consoles/ENV-HD-2.md`
- 834 → 0 scattered props standing inside a robotics building lot `docs/consoles/ENV-HD-2.md`

### Each robot site, outside and in

### Robot site: Fabrication Robot Cell

 **Outside** Fabrication hall: tilt-up panels, roll-up doors with hazard-striped thresholds, roof plant, skylights, a parapet and an entrance canopy.
 **Inside** Robot cell hall: a perimeter guard fence with an interlocked gate, light-curtain posts, e-stop posts, floor striping, a teach-pendant cart and the cell robot inside. 11 named props, 65 instances

### Robot site: Campus Robotics Lab

 **Outside** Research lab: curtain-wall mullions and fins, an entrance canopy and a roof plant screen.
 **Inside** Cobot lab: benches, a cobot with an area scanner and a bench e-stop, a second cell, and painted stop and warning rings round both arms. 11 named props, 31 instances

### Robot site: Automated Warehouse Aisle

 **Outside** Distribution warehouse: dock doors with bumpers and dock lights on a raised dock, truck-court markings and corrugated cladding.
 **Inside** AMR warehouse: racking rows with the centre aisle open, travel lanes, a marked pedestrian crossing with bollards and e-stop posts, chargers and mobile robots. 9 named props, 107 instances

### Robot site: Port Automation Yard

 **Outside** Port control tower: a shaft with a glazed cab and a base building, beside crane rails under the gantry’s legs and the edge of a container stack.
 **Inside** Port control room: console desks with screens, a window wall onto a procedural container yard, a plain status wall, a supervisor desk and a comms rack. 10 named props, 33 instances

### Robot site: Ceiling-Drilling Robot Deck

 **Outside** Construction site: an unfinished concrete frame, a scaffold, hoarding with a gate, a site cabin and water-filled barriers.
 **Inside** Ceiling-drilling deck: a barricade round the robot’s reach with an entry gap, shoring, a dust extractor and hose, the anchor layout on the soffit and the drilling robot. 12 named props, 77 instances

### Robot site: Distribution Robot Aisle

 **Outside** Distribution warehouse: the same kit on a lot of its own: dock doors, bumpers and lights, truck-court markings.
 **Inside** Robot maintenance bay: a lockout board with padlocks and tags, parts racks, a robot arm locked out on a stand, a mobile robot on a lift table and a workbench. 12 named props, 87 instances

The streetscape beside each building adds bollards, EV chargers with marked bays (the construction site has barriers instead), loading-bay and hazard markings, and 5 pictogram-only safety signs on posts: robot operating, pedestrian walkway, hard hats on, automated vehicles moving and EV charging. No word is drawn on any sign, and the checker proves the module has no text drawing; nothing names a company, union or trade body. At night the windows light from dusk to dawn by the world’s own clock: lit on 5 of 5 maps.

### Outside: the budget and what was measured, by tier

| Tier | Kit per site (meshes, triangles) | Budget | Texture bytes per map | Texture budget |
|---|---|---|---|---|
| Phone | 1 mesh and 36 to 180 triangles | 1 mesh and 1,500 triangles | 0 | 0 |
| Balanced | 2 meshes and 450 to 804 triangles | 2 meshes and 7,000 triangles | 1,485,483 (allocated by the code, not driven) | 1,572,864 |
| High (desktop) | 2 meshes and 880 to 1,296 triangles | 2 meshes and 7,000 triangles | 5,941,931 (measured in the page) | 6,291,456 |

High detail is a canvas atlas of 16 cells, 1024 px a side on the desktop high tier and 512 px on balanced, with none on the phone; the lit-window mask is its emissive map. The worst robot-site chunk, the facades alone against the facades plus the kit: low 2 / 1,056 → 3 / 1,092 (budget 4 / 6,000), high 3 / 4,918 → 5 / 5,798 (budget 6 / 24,000). Source: `docs/consoles/ROBO-EXTERIORS.md`.

### Outside: the whole streamed scene at the robot sites, meshes / triangles, before → after

| Map | Phone | Balanced | High |
|---|---|---|---|
| San Francisco downtown map | 91 / 26,789 → 92 / 26,837 | 141 / 47,443 → 143 / 48,019 | 141 / 47,443 → 143 / 48,535 |
| San José map | 74 / 28,286 → 75 / 28,322 | 147 / 84,048 → 149 / 84,532 | 147 / 84,048 → 149 / 84,928 |
| West Oakland map (2 robot sites) | 87 / 30,716 → 89 / 30,896 | 160 / 67,490 → 164 / 68,642 | 160 / 67,490 → 164 / 69,398 |
| New Orleans map | 115 / 38,559 → 116 / 38,631 | 185 / 66,469 → 187 / 67,171 | 185 / 66,469 → 187 / 67,435 |
| Richland map | 68 / 20,684 → 69 / 20,864 | 122 / 32,598 → 124 / 33,402 | 122 / 32,598 → 124 / 33,894 |

The kit adds 1 to 2 meshes a site, and every full build stays under 260 / 400,000 meshes and triangles. Phone and headset budgets do not change.

### Outside, in the built page (high tier): draw calls and triangles, kit hidden → shown

| Site | Kit on this map (meshes, triangles) | Wide shot: draw calls | Wide shot: triangles | Door shot: draw calls | Door shot: triangles |
|---|---|---|---|---|---|
| Fabrication Robot Cell | 2 meshes, 1,092 triangles | 110 → 112 | 79,105 → 80,197 | 129 → 131 | 137,521 → 138,613 |
| Campus Robotics Lab | 2 meshes, 880 triangles | 142 → 144 | 118,819 → 119,699 | 144 → 146 | 169,692 → 170,572 |
| Automated Warehouse Aisle | 4 meshes, 1,908 triangles | 182 → 186 | 132,552 → 134,460 | 190 → 194 | 161,385 → 163,293 |
| Port Automation Yard | 4 meshes, 1,908 triangles | 178 → 182 | 84,981 → 86,889 | 174 → 178 | 146,149 → 148,057 |
| Distribution Robot Aisle | 2 meshes, 966 triangles | 218 → 220 | 116,569 → 117,535 | 168 → 170 | 124,260 → 125,226 |
| Ceiling-Drilling Robot Deck | 2 meshes, 1,296 triangles | 128 → 130 | 94,177 → 95,473 | 115 → 117 | 141,564 → 142,860 |

Draw calls rise by exactly the kit’s meshes in view, 2 a site (4 where both West Oakland sites are in frame), and triangles by exactly the kit’s triangles, 880 to 1,908. The drive took 12 shots with 0 failed, page errors 0 and no requests to other hosts, on a machine shared with other work.

### Inside: the 6 rooms against the room budget

| Room | High tier: meshes / draw calls / triangles drawn / texture | Low tier: meshes / draw calls / triangles drawn / texture | Walk from the door |
|---|---|---|---|
| Robot cell hall | 20 / 21 / 1,792 / 22.67 MiB | 20 / 21 / 1,436 / 2.67 MiB | 6 of 6 |
| Cobot lab | 19 / 19 / 1,380 / 17.33 MiB | 19 / 19 / 952 / 2.33 MiB | 6 of 6 |
| AMR warehouse | 19 / 18 / 2,276 / 17.33 MiB | 19 / 18 / 1,632 / 2.33 MiB | 6 of 6 |
| Port control room | 20 / 20 / 976 / 18.67 MiB | 20 / 20 / 740 / 2.67 MiB | 6 of 6 |
| Ceiling-drilling deck | 19 / 19 / 1,552 / 17.33 MiB | 19 / 19 / 1,072 / 2.33 MiB | 5 of 5 |
| Robot maintenance bay | 18 / 18 / 1,700 / 17.33 MiB | 18 / 18 / 1,188 / 2.33 MiB | 6 of 6 |

Room budget: 120 meshes, 6,000 triangles on the high tier and 3,000 on the low, 3 and 1 lights on desktop and phone, and a texture budget of 24 MiB on the high tier and 3 MiB on the others, every texture and its mip chain counted. The checker’s own table, for the rooms as built: meshes 18 to 20, triangles 1,016 to 2,340 on high and 780 to 1,696 on low, lights 2 and 1, texture bytes 17.33 to 22.67 MiB on high and 2.33 to 2.67 MiB on low. The textures are an epoxy floor with its striping painted in, painted concrete, brushed metal and guard mesh, drawn at 1024 px on the desktop high tier and 256 px elsewhere. Page errors 0. Source: `docs/consoles/ROBO-INTERIORS.md`.

### Inside, with the agents standing in (HIVE-IN-WORLD)

| Room | Agents | High tier, before → after: meshes / triangles / texture MiB / sprites | Low tier, before → after: meshes / triangles |
|---|---|---|---|
| Robot cell hall | 2 | 20 → 38 / 1,688 → 3,704 / 22.67 → 23.50 MiB / +4 | 20 → 20 / 1,332 → 1,332 |
| Cobot lab | 1 | 19 → 28 / 1,420 → 2,428 / 17.33 → 17.75 MiB / +2 | 19 → 19 / 992 → 992 |
| AMR warehouse | 1 | 19 → 28 / 2,340 → 3,348 / 17.33 → 17.75 MiB / +2 | 19 → 19 / 1,696 → 1,696 |
| Port control room | 1 | 20 → 29 / 1,016 → 2,024 / 18.67 → 19.08 MiB / +2 | 20 → 20 / 780 → 780 |
| Ceiling-drilling deck | 1 | 19 → 28 / 1,592 → 2,600 / 17.33 → 17.75 MiB / +2 | 19 → 19 / 1,112 → 1,112 |
| Robot maintenance bay | 1 | 18 → 27 / 1,740 → 2,748 / 17.33 → 17.75 MiB / +2 | 18 → 18 / 1,228 → 1,228 |

Each agent whose home site a room belongs to stands at that room’s agent spot and its captions show over it: agents at their room spots 7 of 7 (rooms by agents), and rooms inside the room budget with the agents and captions in 18 of 18 room-tiers. The low tier builds no figure, so a phone room is unchanged. One door: every robot site’s room opens at its exterior building’s door, 6 of 6 across the 5 robot-site maps, each door spot clear of every exterior collider (6 of 6). A station launched from a room returns into the same room: 6 of 6. Source: `tools/check_hive_world.mjs` on `0c834a8a`, 35 checks. Committed, merged into the integration head.

### Beyond the robot sites (ENV-HD-2)

### Outside: The neighbourhood takes the robotics look

A kit resolver in the facades module gives every shed and tower within 150 m of a robot site a robotics variant. Sheds get a louvred roof-plant screen, air-handling units, skylights along the ridge and dock bumpers and lights at each door; towers get a cornice, mullions, roof plant and a plant louvre band. 68 of 68 sheds and towers within that radius take it across 5 maps, and 0 beyond it. Each kit stays cheapest-first (triangles for a shed’s details: 4 / 6 / 36 / 48 / 108) and keeps the generic kits’ cheapest details, so the phone tier builds what it built before.

The worst robot-site chunk, facades plus kit, on the high tier: 3 + 2 meshes, 4,918 + 880 triangles → 4 + 2 meshes, 4,158 + 880 triangles (budget 6 meshes, 24,000 triangles). Source: `docs/consoles/ENV-HD-2.md`.

### Props: Scattered props keep out of the lots

The detail scatter reads the building lots and drops a candidate that falls inside one, after its random draws, so lower tiers and farther rings stay subsets of the higher ones. Scattered props inside a robotics lot: 834 → 0 on every tier. The detail-generation median, in paired runs back to back, went 10.6 ms at a load of 6.6 → 7.1 → 9.9 ms at 6.4 → 5.5, against a budget of 12 ms; it is judged only on a quiet machine.

Source: `docs/consoles/ENV-HD-2.md`, `tools/check_detail.mjs`.

| Room style that took the high-detail textures | Texture set | Site doors that open into it |
|---|---|---|
| Workshop | industrial | 167 |
| Plant room | industrial | 139 |
| Port shed | industrial | 124 |
| Civic lobby | tile | 108 |
| Classroom | tile | 62 |
| Apparatus bay | industrial | 55 |
| Transit barn | industrial | 53 |
| Clinic | tile | 52 |
| Warehouse | industrial | 47 |

Room styles with the high-detail texture set: 6 → 15, so 807 of 863 site doors now open into a room with it. The set is a skin: it puts texture maps on meshes that already exist and adds none, and meshes, triangles and lights are identical with and without it in 27 of 27 builds (every added style on every tier). Texture bytes per room: 1.33 MiB before (the shell’s signs) → 17.33 MiB on the high tier (the civic lobby, with no metal props, 12.00 MiB) and 2.33 MiB on balanced and low, where a room’s maps come to 1.0 MiB, inside the budgets of 24 MiB and 3 MiB. The industrial set reuses the robotics rooms’ epoxy floor with marks for each kind, painted concrete and brushed metal; the tile set is a vinyl-tile floor (0.6 m tiles) and a painted block wall. 13 stills at 1920 by 1080 pixels, of the 9 rooms and of robot-site neighbourhoods by day and night, were captured from the built page with page errors 0. Checks: facades 2,860 → 2,957, detail 479 → 485, the room-skin checker 164, exteriors 259 unchanged, 1,114 modules importing only what they declare. Source: `docs/consoles/ENV-HD-2.md`.

### Checkers run on the neighbours

| Checker | Result |
|---|---|
| `check_exteriors` | 259 checks pass, unchanged by the neighbourhood work |
| `check_facades` | 2,860 → 2,957 pass (the robotics variant joined it) |
| `check_palette` | 684 pass, unchanged |
| `check_walkable` | 2,720 pass, unchanged |
| `check_detail` | 479 → 485 pass (the lots test joined it); generation median 10.6 ms → 9.9 ms in paired runs, against a budget of 12 ms |
| `check_robo_interiors` | 302 pass headless; 331 in the built page, on both tiers |
| `check_la_rooms` | 3,787 pass, unchanged |
| `check_classrooms` | 2,057 pass, unchanged |

### What is left

- *Planned* The robotics tower kit has no entrance canopy, because it is built in unit-height space; the San José chunk is at its mesh budget on the high tier.

- *Planned* Parked vehicles and animals are not tested against the building lots, and the kitchen style, the Louisiana rooms and the union hall are not yet skinned.

- *Planned* The phone tier has no lit windows at night; the balanced and phone exteriors were counted from the scene graph and allocation, not driven in a browser.

- *Planned* The detail-generation timing is judged only on a quiet machine; it was measured at a shared load and says so.

**Round two of this loop** is read from its console branches while the coordinator merges them: `HIVE-IN-WORLD` (committed, head `0c834a8a`, merged; its console note is committed, and its figures here come from its checkers re-run on a snapshot of that commit); `ENV-HD-2` (its committed console note, merged). The pages are rebuilt by one command, and each figure is re-checked then.

Sources: `docs/consoles/ROBO-INTERIORS.md`, `docs/consoles/ROBO-EXTERIORS.md`, `WebXR/shared/ixr-robo-interiors.js`, `WebXR/shared/fx-exteriors.js`, `tools/check_robo_interiors.mjs`, `tools/check_exteriors.mjs`. Each figure is read from those notes by the script that built this page. Rooms are generic by kind, as the interiors note says: no real building’s interior is modelled.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `41e41366`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
