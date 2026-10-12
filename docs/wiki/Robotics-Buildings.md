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
- 15 → 25 room styles with the high-detail texture set after `ENV-HD-3` (the kitchen, the union hall and the Louisiana rooms joined); meshes, triangles and lights unchanged `docs/consoles/ENV-HD-3.md`
- 6 → 5 meshes in the worst robot-site chunk on the high tier, with an entrance canopy on every robotics tower `docs/consoles/ENV-HD-3.md`
- 2 → 0 parked vehicles standing inside a robotics building lot `docs/consoles/ENV-HD-3.md`
- 12 → 18 establishing-shot presets, with 3 busy non-robot places added `docs/consoles/ENV-HD-3.md`

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

| The worst room: the robot cell hall, 2 agents | Meshes, before → after | Triangles, before → after | Textures in MiB, before → after |
|---|---|---|---|
| High | 20 → 38 (of 120) | 1,688 → 3,704 (of 6,000) | 22.67 → 23.50 (of 24) |
| Balanced | 20 → 38 | 1,688 → 3,704 | 2.67 → 2.87 (of 3) |
| Low (phone) | 20 → 20, no figures | 1,332 → 1,332 | unchanged |

A room with one agent adds 9 meshes, about 1,000 triangles and 2 sprites, so the cell hall is the worst case. On the balanced tier the label and caption canvases are drawn smaller there: at full size that room would read 3.50 MiB against its budget of 3 (arithmetic, not measured). In the built page the room measure also counts the shell’s own sign canvases: 38 meshes and 16 draw calls, and 22.83 MiB of textures before a caption is drawn and 23.17 with one. Each agent whose home site a room belongs to stands at that room’s agent spot and its captions show over it: agents at their room spots 7 of 7 (rooms by agents), and rooms inside the room budget with the agents and captions in 18 of 18 room-tiers. The low tier builds no figure, so a phone room is unchanged. One door: every robot site’s room opens at its exterior building’s door (0 of 6 → 6 of 6), each door spot clear of every exterior collider (6 of 6). A station launched from a room returns into the same room: 6 of 6, and the room’s own job board 4 of 4. Source: `tools/check_hive_world.mjs` on `0c834a8a`, `docs/consoles/HIVE-IN-WORLD.md`, 35 checks. Committed, merged into the integration head.

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

### Round three: high detail everywhere a learner walks (ENV-HD-3)

| Measure | Before → after | Source |
|---|---|---|
| Room styles with the high-detail texture set (the kitchen, the union hall, a Louisiana crafts hall, the Louisiana rooms and the rented room and shop joined) | 15 → 25 | `docs/consoles/ENV-HD-3.md` |
| Meshes, triangles and lights on every tier with the skin on | unchanged | `docs/consoles/ENV-HD-3.md` |
| Room-skin checker passes; Louisiana rooms that were over the balanced texture budget before the skin (their name signs), now held inside it | 164 → 382; 6 | `docs/consoles/ENV-HD-3.md` |
| Texture bytes per room, the worst room in budget (shell signs and Louisiana name signs counted): high; balanced; low (the Louisiana data hall at 256 px over 11 name signs); budgets unchanged at 24, 3 and 3 MiB | 17.33 MiB; 2.33 MiB; 2.86 MiB | `docs/consoles/ENV-HD-3.md` |
| Louisiana rooms on the balanced tier before any skin: texture MiB, over the 3 MiB room budget from their name-sign canvases (6 to 15 a room); the skin adds no bytes there | 3.21 to 6.02 MiB | `docs/consoles/ENV-HD-3.md` |
| Worst robot-site chunk on the high tier, meshes (the San José chunk: generic + robotics meshes) | 6 → 5 (4 + 2 → 2 + 2) | `docs/consoles/ENV-HD-3.md` |
| Robotics towers with an entrance canopy (lobby glazing), and roof plant sized by footprint, so every tower’s plant stands 2.40 m tall and the canopy top 4.57 m | 0 → 28 of 28 | `docs/consoles/ENV-HD-3.md` |
| Chunks drawn one mesh per kind where the generic and robotics kits meet; the worst robotics-variant chunk on the high tier before → after (the phone tier unchanged) | 0 → 14; 4 meshes / 5,204 triangles → 3 meshes / 5,066 triangles | `docs/consoles/ENV-HD-3.md` |
| The phone tier builds what it built before; facades checker passes; exteriors checker passes; shared-export check | unchanged; 2,957 → 2,977; 259 → 278; 139 of 139 | `docs/consoles/ENV-HD-3.md` |
| Establishing-shot presets, before and after: a wide shot and a street shot at each of the busiest non-robot sites (a bridge yard of 7 stations, a port terminal of 6 and a construction site of 6, the busiest kind); exteriors checker passes | 12 → 18; 259 → 278 | `docs/consoles/ENV-HD-3.md` |
| Stills at 1920 by 1080 from the capture drive, day and night; page errors; external requests | 12; 0; 0 | `docs/consoles/ENV-HD-3.md` |
| Vehicles parked inside a robotics building lot (the Richland data hall, balanced and high); motorworks checker passes | 2 → 0; 37 → 69 | `docs/consoles/ENV-HD-3.md` |
| Animals and people inside a lot, with and without the page’s seams; chased agents that stepped in; menagerie checker passes | 0 → 0; 0 of 6; 93,998 → 94,048 | `docs/consoles/ENV-HD-3.md` |

The skin is budget-aware: a texture map is set on a room only while the room stays inside its texture budget with the shell’s signs counted, so the table’s first row is a count of styles, not a promise that every room carries every map.

### Round four: scenes inside and out, and an opt-in Ultra setting (ENV-HD-4)

| Measure | Before → after |
|---|---|
| An opt-in **Ultra** setting for desktops: off by default, offered only on the desktop high tier and never on the phone tier, balanced, a headset browser or inside an XR session; its toggle in the Me tab is 44 px tall and is hidden where Ultra is not offered; the offer is tested against 9 device cases | none → off by default |
| Ultra’s facade atlas and lit-window mask, px; and the facade texture MiB a map takes, high → Ultra, against a stated limit of 24 MiB (balanced 1.42 MiB, unchanged) | 1,024 and 256 → 2,048 and 512; 5.67 → 22.67 MiB |
| Each of the 6 robot sites with Ultra: the high tier’s 2 meshes and 880 to 1,296 triangles, plus roof-edge railings, roof plant and a ladder (a stair tower on the construction site): meshes added; triangles added, against a stated limit of 6,000; the 2,048 px atlas leaves every site’s meshes and triangles as they were | adds 1; adds 1,344 to 2,892 |
| Each robot room with Ultra: floor and wall textures, px; meshes and triangles added by ceiling trusses and cable trays, against stated limits of 2 and 2,500; texture MiB a room, against a stated limit of 64; lights stay at 3; balanced and low stay at 2.33 –2.67 MiB | 1,024 → 2,048; adds 2; adds 912 to 1,944; 17.33 –22.67 → 49.33 –54.67 |
| Frame time on the console’s capture machine (a software renderer, shared, so not a graphics-card budget), median ms, high → Ultra: the West Oakland warehouse at night; the cell hall | 1,490 → 1,424; 864 → 894 |
| Looks for the robot sites (dawn, day, dusk, night, fog at dawn and rain at dusk) over the app’s own clock and weather: looks; exterior presets (6 robot sites by 6 looks) | none → 6; 0 → 36 |
| Site lights on the high tier at the West Oakland map (2 sites): meshes; triangles in all, against a stated limit of 1,200 a site; floodlight masts, dock lamps, lamp glares and pools of light; real lights; texture bytes | 3; 880 (440 a site); 4, 4, 12, 8; 0; 0 |
| Robot rooms with lighting (light panels, a pendant task light over every station pad with a pool of light on the floor, 3 warning beacons and 1 task spotlight): rooms lit; meshes added a room; triangles added, against a stated limit of 900; the phone tier, balanced and headset browsers build the rooms identical to before | 0 → 6 of 6; adds 4; adds 312 to 440 |
| The hive operations room, new, on the high tier: meshes; triangles; lights; texture MiB (7 consoles, one for each agent role, facing a video wall; the screens are a seam for the hive tab’s content) | none → 25; 2,022; 3; 18.67 |
| The same room on balanced; on the phone tier (meshes; triangles; lights; texture MiB) | 21; 1,334; 2; 2.42 and 20; 954; 1; 2.42 |
| Stills at 1920 × 1080 from the built page, every frame looked at (36 of 36 exterior presets, 7 lit rooms, 8 with Ultra); page errors and external requests in the console’s capture drives (19, 8 and 31 captures) | none → 51; 0; 0 |
| Checker checks (`check_hd4`); neighbouring checkers that still pass: interiors; room skins; robot interiors; exteriors; Louisiana rooms; modules importing only what they declare; the interface check (touch targets at phone size at least 44 px: 186 of 186) | 118; 925 → 957; 382 → 401; 302; 278; 3,787; 1,122; 21 |

Source: `docs/consoles/ENV-HD-4.md`, its committed note, with the per-room, look and operations-room tables from its checker re-run; the stated limits are read from `WebXR/shared/hd4-ultra.js`, `WebXR/shared/hd4-rooms.js` and `WebXR/shared/hd4-looks.js` (merged into the integration head; the console’s last commit is `70b4aed5`).

### The 6 robot rooms: before this round → with the lighting → with Ultra (high tier)

| Room | Meshes | Triangles | Lights | Texture MiB |
|---|---|---|---|---|
| `ixr-cell-hall` | 20 → 24 → 26 | 1,688 → 2,080 → 3,484 | 2 → 3 → 3 | 22.67 → 22.67 → 54.67 |
| `ixr-cobot-lab` | 19 → 23 → 25 | 1,420 → 1,788 → 2,724 | 2 → 3 → 3 | 17.33 → 17.33 → 49.33 |
| `ixr-amr-warehouse` | 19 → 23 → 25 | 2,340 → 2,780 → 4,724 | 2 → 3 → 3 | 17.33 → 17.33 → 49.33 |
| `ixr-port-control` | 20 → 24 → 26 | 1,016 → 1,360 → 2,272 | 2 → 3 → 3 | 18.67 → 18.67 → 50.67 |
| `ixr-drilling-deck` | 19 → 23 → 25 | 1,592 → 1,904 → 3,284 | 2 → 3 → 3 | 17.33 → 17.33 → 49.33 |
| `ixr-maint-bay` | 18 → 22 → 24 | 1,740 → 2,108 → 3,044 | 2 → 3 → 3 | 17.33 → 17.33 → 49.33 |

The lighting adds no texture, so the high tier’s texture bytes do not move; Ultra is where the memory goes, and that is why it is a choice and not a default. The per-room figures are from the console’s checker, re-run by the script that built this page; the note states their ranges.

### The 6 looks

| Look | Sky and weather | Fog draws in to, m | Fog density | Wet ground | Site lights (off to full) |
|---|---|---|---|---|---|
| Dawn | dawn, clear | 1,900 | 0 | 0 | 0.6 |
| Day | day, clear | 2,200 | 0 | 0 | 0 |
| Dusk | dusk, clear | 1,900 | 0 | 0 | 0.85 |
| Night | night, clear | 1,600 | 0 | 0 | 1 |
| Fog | dawn, fog | 575 | 0.75 | 0.2 | 0.6 |
| Rain | dusk, rain | 1,016 | 0.5 | 0.8 | 0.85 |

Floodlights are lit by day in fog and storms at 0.45; the fog look draws in to a ground fog at the site, and a fog density of at least 0.7 is required of it.

### Read honestly

- Ultra spends memory: with the 2,048 px floor and walls a robot room goes from 17.33 –22.67 MiB of textures to 49.33 –54.67 MiB, inside a stated limit of 64 MiB, and the facade atlas adds 17 MiB a map and the rooms 32 MiB each; it is offered only on the desktop high tier, and never by default.

- Ultra’s frame time was measured only on the console’s capture machine, a shared computer with a software renderer: the median frame of the West Oakland warehouse’s night shot was 1,490 ms on high and 1,424 ms with Ultra, and the cell hall’s 864 and 894 ms. The console reads the difference as inside the machine’s noise and says it is not a graphics-card frame budget, so what Ultra costs on a learner’s desktop is not shown.

- The other counts are meshes, triangles, lights and texture bytes from the console’s own checker, and the looks were drawn in a headless page for stills; they are not a measurement on a learner’s machine, and the stills are not used on this page.

- Looking at the frames found faults that no count could: dawn drew the midday sky, the floodlight heads read as dark poles from the wide shot, the floor pools round the station pads read as white ellipses, and a sign title was clipped. Each was fixed after the look.

### Round five: budgets kept, more scenes (ENV-HD-5)

| Measure | Before → after |
|---|---|
| The 6 Louisiana rooms on the balanced tier: texture MiB a room, against the 3 MiB room budget (the signs were drawn at 512 × 120 as on high; the high tier keeps 512 × 120) | 3.21 –6.02 → 2.47 –2.86 |
| Louisiana rooms inside the balanced budget, measured; name-sign canvas on balanced, px; meshes, triangles and lights (unchanged) | none → 6 of 6; 512 × 120 → 256 × 60 |
| Room-skin checker checks, before → after; a measured pass builds the Louisiana rooms on every tier under a recording canvas stub and compares every texture with the model (builds that agree); with the balanced sign set back to its old size that pass fails (6.35 MiB measured against 2.84) | 401 → 480; 18 of 18 |
| Balanced tier: a light-weight form of the robot rooms’ lighting (emissive ceiling panels, a flush warm panel over every station pad and console, the beacons’ amber lenses; one instanced mesh, no real light, no texture): meshes added a room; triangles added a room, against a limit of 400; lights and texture bytes | adds 1; adds 132 –228; unchanged |
| Builds of the robot rooms unchanged on the phone tier and in a headset browser, a headset browser on balanced added to the check; `check_hd4` checks, before → after | 18 of 18; 118 → 127 |
| Stills re-shot after the dawn-sky and sign-fit fixes, every frame looked at: the dawn and fog-at-dawn frames of the San José and West Oakland sites and the 7 lit rooms; captures; failed; page errors; external requests | 13; 0; 0; 0 |
| New stills taken and looked at (the new scenes by day and night, the hospital’s street pair again, and the balanced rooms); stills rejected by eye and re-shot; captures in all the drives, none failed, with page errors and external requests at zero | none → 25; 2; 38 |
| Establishing-shot presets, before → after: a wide shot and a street shot at the busiest park, fire station, hospital and school, the 4 busiest kinds by catalog stations that had no preset (214, 178, 169 and 168 stations); generic by kind, and a label names the kind only | 18 → 26 |
| Street cameras at least 12 m from the site’s own building, before → after (the hospital campus’s stood 8.3 m away, with its wall filling the left of the frame; it is now 19.7 m) | 6 of 7 → 7 of 7; 8.3 → 19.7 |
| Exteriors checker checks, before → after (it encoded a rule for the busiest sites overall; it now checks three by site and four by kind, each rule computed from the catalog) | 278 → 309 |

Source: `docs/consoles/ENV-HD-5.md`. A coordinator’s earlier attempt changed the sign size alone and 24 of the room-skin checks failed, because the checker’s own model of a sign canvas still assumed the old size; the console changed the model with the module and made a room over its budget before the skin a failure, where it had only been reported.

### Round five: the hive in its operations room (HIVE-5)

| Measure | Before → after |
|---|---|
| Operations-room screens painted from the hive (a console for each agent and the wall); agents standing at their consoles on entering (high and balanced; the phone tier builds none) | 0 → 8 of 8; 0 → 7 of 7 |
| The room with 7 speaking figures: meshes; triangles; texture MiB on high, against 120 meshes, 6,000 triangles and 24 MiB; the triangles 7 standard figures would have made | 88; 4,878; 21.58; 9,078 |
| The same on balanced, against a texture budget of 3 MiB (the screens take colour, bars and a talk light); texture bytes the screens add | 84; 4,190; 2.77; 0 |
| Built in the page at hive minute 159: agents standing; screens painted; meshes and triangles built; page errors; off-host requests | 7 of 7; 8 of 8; 88; 4,878; 0; 0 |

Source: `docs/consoles/HIVE-5.md`. The figures in this room are lightened from 1,008 to 408 triangles each so that all 7 fit; the screens are painted from the hive’s own events and metrics, and every card says “software agent”. On the merged head the room is over its triangle limit: the video review’s capture, with the high-detail line’s room-level figures standing in it, measures 46 meshes and 8,508 triangles built against 6,000, and no checker covers that combination.

### Round six: buildings that read as their kind (ENV-HD-6)

| Measure | Before → after |
|---|---|
| Kinds of place whose busiest site carries a cue of its kind (a fire station’s apparatus bays and hose tower; a hospital’s drop-off canopy, lane and a white H on blue; a school’s entrance canopy and fenced play yard; a park’s gable-roofed crew house, pavilion, paths and shed) | 0 → 4 of 4 |
| Cue triangles at each site, balanced / high, against a stated budget of 1,200 / 3,600: park; fire station; hospital; school | 276 / 420; 192 / 384; 156 / 180; 480 / 1,968 |
| The cue and lamp mesh a map: merged meshes on balanced and high (none on the phone tier or a headset browser); triangles on the Orleans map, balanced / high; on the Marina and Mission maps, high | 1; 2,028 / 2,244; 1,716; 3,312 |
| Cue parts on a carriageway, in water, into another building or within 1.5 m of the job board, at every site checked | 0 |
| Job boards whose lamp floated with nothing holding it at night, before → after (a post, an arm and a housing, 48 triangles a board) | 90 → 0 (90 of 90 boards with a post) |
| Street cameras clear of every tree (no crown within 5 m): the solver now reads the live-oak placements, adding 8 m to a crown; the park’s camera, nearest crown edge, in metres | 6 of 7 → 7 of 7; 0.2 → 11.0 |
| Hero buildings with the opt-in Ultra setting’s 2048 px facade atlas: before → after; the atlas’s texture MiB a map, against a stated 24; triangles a building | 0 of 4 → 4 of 4; 21.33; 8 |
| In the built page (the Orleans hospital street shot): cue meshes on the phone tier; draw calls on the phone tier / balanced / high | 0; 151 / 199 / 209 |
| Exteriors checker checks, before → after; the new buildings checker; facades and room-lighting checkers, unchanged; page errors and external requests in the drives | 309 → 316; 118; 2,977, 127; 0, 0 |

Source: `docs/consoles/ENV-HD-6.md`. Every cue is procedural and generic by kind: one merged, vertex-coloured mesh a map with no texture and no light, a hospital sign built from boxes with no red cross or other protected emblem and no words, and no flagpole at the school. The phone tier and a headset browser build nothing.

### Checkers run on the neighbours

| Checker | Result |
|---|---|
| `check_exteriors` | 259 → 278 pass (the chunk test and the scene presets joined it) |
| `check_facades` | 2,860 → 2,957 → 2,977 pass (the robotics variant, then the merged meshes and canopies, joined it) |
| `check_palette` | 684 pass, unchanged |
| `check_walkable` | 2,720 pass, unchanged |
| `check_detail` | 479 → 485 pass (the lots test joined it); generation median 10.6 ms → 9.9 ms in paired runs, against a budget of 12 ms |
| `check_robo_interiors` | 302 pass headless; 331 in the built page, on both tiers |
| `check_la_rooms` | 3,787 pass, unchanged |
| `check_classrooms` | 2,057 pass, unchanged |
| `check_room_skins` | 164 → 382 pass (every style, the budget-aware maps) |
| `check_motorworks` | 37 → 69 pass (the lots test joined it) |
| `check_menagerie` | 93,998 → 94,048 pass (the lots test joined it) |
| `check_imports` | 1,117 modules import only what they declare |

### What is left

- *Planned* The merged kind mesh holds its parts in world space in the 14 chunks where the generic and robotics kits meet; its geometry bytes are not yet measured against a stated byte budget.

- *Planned* The phone tier has no lit windows at night; the balanced and phone exteriors were counted from the scene graph and allocation, not driven in a browser.

- *Planned* The detail-generation timing is judged only on a quiet machine; it was measured at a shared load and says so.

- *Planned* Balanced gets the rooms’ lighting only in a light-weight form and no site lights, and the dawn look borrows the sky’s low-sun band, so the light on the buildings is the dusk’s; Ultra’s frame time is a software-renderer figure and a desktop-graphics-card measurement is the next step.

- *Planned* In the re-shot room stills a guard-fence post covers part of the cell hall’s honesty line and the port control room’s window mullions draw over its sign: framing faults of the shots, not of the sign fit.

- *Planned* Establishing shots now cover the 4 busiest kinds that had none; a door shot at a site building is still not made.

- *Planned* Only the busiest site of each kind carries a cue; every other park, fire station, hospital and school keeps the plain box. The school reads from its wide shot but not from its street shot, where yard props stand in front of the entrance canopy; the H sign reads at night only by the street lamps; and the park’s gable ends are stepped boxes, visible as steps up close.

**Round two of this loop** is merged into the integration head (`40d97421`): `HIVE-IN-WORLD` (note last committed in `0c834a8a`); `ENV-HD-2` (note last committed in `a0d21aea`). Each figure from it is checked by phrase against that console’s committed note, not re-run from a branch; a note that is edited later stops the build.

**Round three of this loop** is merged into the integration head (`40d97421`), and each figure from it is checked by phrase against that console’s committed note, a committed data file or a commit message, not re-run from a branch: `ENV-HD-3` (its last commit `f3589590`, 7 commits since the head that round started from; its console note is committed; merged into the integration head). A note that is edited later stops the build.

**Round four ** of this loop is **merged** into the integration head (`e252b25f`) and is read from it with a read-only git show: `ENV-HD-4` (its own commits end at `70b4aed5`, 11 commits of its own; its console note is committed; merged). Each figure is checked by phrase against that console’s note or its commit messages, and a rebuild re-reads the final state.

**Round five ** of this loop is merged into the integration head; its figures were read from the console branches (the same commits) with a read-only git show: `ENV-HD-5` (branch head `c0afcff2`, 5 commits of its own; its console note is committed; merged). Each figure is checked by phrase against that console’s note, a committed file or its commit messages, and a rebuild re-reads the final state.

**Round six ** of this loop is merged into the integration head; its figures were read from the console branches (the same commits) with a read-only git show: `ENV-HD-6` (branch head `b7065f74`, 6 commits of its own; its console note is committed; merged). Each figure is checked by phrase against that console’s note, a committed file or its commit messages, and a rebuild re-reads the final state.

Sources: `docs/consoles/ROBO-INTERIORS.md`, `docs/consoles/ROBO-EXTERIORS.md`, `WebXR/shared/ixr-robo-interiors.js`, `WebXR/shared/fx-exteriors.js`, `tools/check_robo_interiors.mjs`, `tools/check_exteriors.mjs`. Each figure is read from those notes by the script that built this page. Rooms are generic by kind, as the interiors note says: no real building’s interior is modelled.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `e196829d`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
