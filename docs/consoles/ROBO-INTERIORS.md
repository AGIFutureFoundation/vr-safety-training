# ROBO-INTERIORS — walk into every robot site (`ixr`, port 9093)

Loop 10 (`$SP/loop10/brief.md`, section ROBO-INTERIORS). Base 43d3e3f6. Module `WebXR/shared/ixr-robo-interiors.js`; six
style keys added to INTERIORS' plain data in `WebXR/shared/ix-interiors.js` (`IX_STYLES`, `IX_FEATURES`); checker
`tools/check_robo_interiors.mjs`; mounted in the parishes app (`WebXR/parishes/js/app.js`).

## What is here

Every ROBOTICS site (`rb-robotics-data.js` `RB_SITES`, six sites on five maps) now has a door spot beside its pad; "E — go
inside" opens a walk-in robotics room on INTERIORS' shell. The rooms are **generic by kind**: the shell's back-wall sign says
"a generic room for this kind of site — not a model of the real building", nothing models a real building, robot maker or
product, and the robots are simulated (nothing in a room moves).

| Robot site (map) | Room style | What is in it |
|---|---|---|
| `rb-site-soma-robot-cell` (sf-downtown) | `ixr-cell-hall` robot cell hall | perimeter guard fence (12 mesh panels, posts), a gate with an interlock, two pairs of light-curtain posts (gate and load opening), three e-stop posts, a hatched band and walkway striping on the floor, a teach-pendant cart, the cell robot inside with its fixture table, a transfer table, a controller cabinet with a beacon |
| `rb-site-san-jose-robotics-lab` (bay-san-jose) | `ixr-cobot-lab` cobot lab | the cobot bench with an arm, an area scanner and a bench e-stop, a second cobot cell, painted stop and warning rings round both arms, wall benches with monitors, a back bench, a storage cabinet |
| `rb-site-west-oakland-warehouse` (oak-west-oakland) | `ixr-amr-warehouse` AMR warehouse | four instanced racking rows (frames, beams, loads) with the centre aisle open, two AMR travel lanes, a marked pedestrian walkway crossing with bollards and e-stop posts, two chargers, an AMR in the aisle and one docked |
| `rb-site-west-oakland-port-automation` (oak-west-oakland) | `ixr-port-control` port control room | three console desks with screens, a window wall onto a procedural container yard (canvas), a plain status wall (canvas), a supervisor desk, a comms rack |
| `rb-site-richland-drilling-robot` (la-meta-richland) | `ixr-drilling-deck` ceiling-drilling deck | a barricade round the robot's reach with an entry gap, shoring posts and beams, a dust extractor and hose, the anchor layout as a grid on the soffit, the drilling robot with its battery, a control tablet stand |
| `rb-site-orleans-warehouse` (orleans) | `ixr-maint-bay` robot maintenance bay | a lockout board with padlocks and tags, three parts racks with bins, a robot arm locked out on a maintenance stand, an AMR on a lift table, a workbench, a parts cart |

Each room shows the site's robot stations as lit pads (the shell's pattern; 3–4 catalog stations per room, the site's own
station always among them) and two named **agent spots** (`room.spots.agent`) where the Omega Hive's avatars will stand, marked
by a ring on the floor. The texture set is drawn on canvases from code: the room's epoxy floor (with its striping, rings or
walkway crossing painted in), painted concrete walls, brushed metal props and the guard mesh — 1024 px on the desktop high tier,
256 px on the phone, balanced and headset-browser tiers.

## Evals (before → after, with sources)

| Eval | Before | After | Source |
|---|---|---|---|
| Robot sites with a walk-in robotics interior | 0 of 6 | 6 of 6 | `check_robo_interiors` "robot sites with a walk-in robotics interior: 6 of 6" |
| Robotics room styles on the shell | 0 | 6 | `check_robo_interiors` section 1 |
| Props per room (named, high tier) | — | cell hall 11, cobot lab 11, AMR warehouse 9, port control 10, drilling deck 12, maintenance bay 12 named props (65, 31, 107, 33, 77, 87 instances), plus the painted floor marks | `check_robo_interiors` table (props and instances columns; the port room's two canvas walls counted) |
| Meshes per room, high / balanced / low (budget 120) | — | 18–20 / 18–20 / 18–20 | `check_robo_interiors` table |
| Triangles per room, high (budget 6000) | — | 1016–2340 | `check_robo_interiors` table |
| Triangles per room, low (budget 3000) | — | 780–1696 | `check_robo_interiors` table |
| Lights per room, high / low (budget 3 / 1) | — | 2 / 1 | `check_robo_interiors` table |
| Texture bytes per room, high (budget 24 MiB) | — | 17.33–22.67 MiB | `check_robo_interiors` table (the set at 1024 px with mips + the shell's two 512×256 signs) |
| Texture bytes per room, balanced and low (budget 3 MiB) | — | 2.33–2.67 MiB | `check_robo_interiors` table |
| Station pads and agent spots walkable from the door (ixWalk) | — | 70 of 70 (high and low) | `check_robo_interiors` "walk-through (headless): 70 of 70" |
| `check_interiors` | 733 passed, 0 failed | 925 passed, 0 failed | `node tools/check_interiors.mjs` (the six styles build bare on both tiers within budget) |
| `check_la_rooms` / `check_classrooms` | ok | ok (3787 / 2057 passed, 0 failed) | the two other dresser checkers, unchanged |
| `eval_worlds --no-browser` | 51 subjects, mean 100, 5 findings | 51 subjects, mean 100, 5 findings (every subject line identical) | `node tools/eval_worlds.mjs --no-browser` |
| Outdoor robot-site meshes | RB_MESHES_PER_SITE | unchanged (no outdoor mesh added: the door is a prompt spot) | `rb-world.js` untouched |

Measured in the real page (`node tools/check_robo_interiors.mjs --browser`, the rebuilt bundle `parishes/dist/parishes.html`
served on port 9093, `?parish=sf-downtown&tier=<tier>`, every room opened with `__parishTest.ixScene`; draw calls and
triangles from `renderer.info.render` after a frame inside the room, texture bytes from the room's real canvases):

| Room | high: meshes / draw calls / triangles drawn / texture bytes | low: meshes / draw calls / triangles drawn / texture bytes | walk (high, low) |
|---|---|---|---|
| ixr-cell-hall | 20 / 21 / 1792 / 22.67 MiB | 20 / 21 / 1436 / 2.67 MiB | 6/6, 6/6 |
| ixr-cobot-lab | 19 / 19 / 1380 / 17.33 MiB | 19 / 19 / 952 / 2.33 MiB | 6/6, 6/6 |
| ixr-amr-warehouse | 19 / 18 / 2276 / 17.33 MiB | 19 / 18 / 1632 / 2.33 MiB | 6/6, 6/6 |
| ixr-port-control | 20 / 20 / 976 / 18.67 MiB | 20 / 20 / 740 / 2.67 MiB | 6/6, 6/6 |
| ixr-drilling-deck | 19 / 19 / 1552 / 17.33 MiB | 19 / 19 / 1072 / 2.33 MiB | 5/5, 5/5 |
| ixr-maint-bay | 18 / 18 / 1700 / 17.33 MiB | 18 / 18 / 1188 / 2.33 MiB | 6/6, 6/6 |

Budgets: 120 meshes, 6000 / 3000 triangles, 3 / 1 lights (`IX_BUDGET`, unchanged); 24 MiB / 3 MiB texture bytes per room
(`IXR_TEX_BUDGET`, new, stated here). Before: no robot site had a room, so there was nothing to draw indoors (0 rooms); the
outdoor robot sites draw exactly what they drew before (no outdoor mesh, light or texture added). Page errors 0 and external
requests 0 on both tiers; the walk-through is the page's own NEWTON step from the door to every pad and agent spot.

## Cycles (reason → act → observe)

1. Reason: the smallest slice that proves a robotics room fits the shell — six styles as data plus one dresser, checked
   headlessly on three tiers. Act: `IX_STYLES`/`IX_FEATURES` keys, `ixr-robo-interiors.js` (parts per room as instanced
   meshes by material, colliders for parts in the walk), `check_robo_interiors.mjs` sections 1–2. Observe: every room 18–20
   meshes, ≤ 2520 triangles high, ≤ 1828 low; `check_interiors` 733 → 925 passed, 0 failed. Two fails: the cobot lab's only
   metal parts were phone-dropped decoration (no brushed metal on low), and the port room's window and status walls were not
   counted as props.
2. Reason: fix both, and prove walkability with the same step the page uses. Act: the storage cabinet is essential; the two
   canvas walls join the prop tags; an A* planner on a 0.2 m grid (`ixrPlan`) and `ixrWalkAll` (NEWTON's `ixWalk` along the
   path, `ixNear` must name each station). Observe: 70 of 70 station pads and agent spots reached from the door on the high
   and low tiers; agent spots and camera presets clear of props. Committed 52250c47 (the trailer amended to the repo's
   form, no model identifier).
3. Reason: the learner must be able to walk in from the map. Act: `ixrDoorsFor` (a door spot 8.6 m south of the rig, off the
   pad and outside the 6 m warning ring, falling back n / w / e when a site building or water blocks it), the robot-site loop in
   `npNearest`, the board and station returns through the anchor site (`site.board`, `site.linkSite`), dresser registration,
   `__parishTest.ixScene` and `roboInteriors`, bundler and `check_all` entries. Observe: `check_robo_interiors` 289 passed,
   0 failed (a regex on the wiring line failed first and was fixed); six door spots on five maps, all dry and clear;
   `check_la_rooms` and `check_classrooms` unchanged.
4. Reason: the budgets must hold in the real page, measured, not computed. Act: rebuilt `WebXR/parishes/dist/parishes.html`
   (185 modules) and drove the bundled page on port 9093: the robot cell's real door prompt, then `ixScene` for all six rooms
   on the high and low tiers, screenshots, `renderer.info` draw calls and triangles, texture bytes from the real canvases,
   the page's own walk. Observe: all six rooms on both tiers inside budget (18–20 meshes, 18–21 draw calls, ≤ 2456 / 1764
   triangles drawn), 35 of 35 walks per tier, no page errors, no external requests — and one fail: the door-prompt line read
   "" although `np.near` was the robot door (the HUD fills the prompt on its own 0.25 s tick). The captures showed the metal
   props near black (metalness with no environment map) and the warehouse's centre rack row hiding the honesty sign.
5. Reason: fix the three, and prove the real door end to end. Act: the drive waits for the prompt text, then presses E and
   asserts the cell hall with the world hidden and two agent spots; metalness 0.15; four rack rows with the centre aisle open;
   a texture-tier check (1024 px only on the desktop high tier; a Quest or PICO browser, balanced and the phone get 256 px).
   Observe: `check_robo_interiors --browser` 331 passed, 0 failed — "E — go inside: Fabrication Robot Cell (procedural)" at
   the door, E goes inside the ixr-cell-hall; the warehouse sign reads down the open aisle (2276 triangles drawn, was 2456).
6. Reason: the reel needs each preset to frame what makes the room its kind. Act: looked at all six captures; the
   maintenance bay's preset missed the lockout board, so it turned to the back-left corner. Observe: the recapture showed
   the board, racks, the locked-out arm and both agent rings — and the job-board prompt, because the preset stood inside
   the board's reach.
7. Reason: a capture should carry no prompt. Act: a checker rule (every preset outside every action's reach), the
   maintenance bay's preset moved to (4.4, 4.6). Observe: headless `check_robo_interiors` 302 passed, 0 failed; the
   high-tier drive on the rebuilt bundle (`IXR_TIERS=high`) 324 passed, 0 failed, the six captures prompt-free (scratch:
   `$SP/loop10/ixr/shots4/`).

## Seams

- **Agent spots (AGENT-AVATARS, OMEGA-HIVE).** `room.spots.agent` — `[{ id, name, role, x, z, yaw }]` in room-local metres
  (INTERIORS' frame: x across, z from the back wall −d/2 to the door wall +d/2; yaw as the learner's, 0 faces the back wall,
  +π/2 faces −x). Two per room; `role` names the hive role the spot suits (`dispatcher`, `safety-steward`,
  `maintenance-planner`, `consent-keeper`, `trainer`, `auditor`, `logistics`), and `ixrAgentSpot(room, agent)` returns the
  spot for an agent `{ id: "oh-<role>" }` (its role's spot, else the first). The same data is plain in
  `IXR_ROOMS[style].spots.agent` before a room is built. A figure added to `room.group` stands at `(x, 0, z)` with
  `rotation.y = yaw`; the room's mesh budget leaves ≥ 100 meshes for it (`room.budgetLeft()`).
- **Scene presets (REEL, captures).** `window.__parishTest.ixScene(styleId)` exits any room, enters the room of that style
  (this map's robot site of that style when it has one, else its `RB_SITES` entry, so all six open from one page), stands
  the camera at `IXR_ROOMS[style].camera` and returns `{ style, site, here, meshes, spots, camera }`. Styles:
  `ixr-cell-hall`, `ixr-cobot-lab`, `ixr-amr-warehouse`, `ixr-port-control`, `ixr-drilling-deck`, `ixr-maint-bay`.
  `window.__parishTest.roboInteriors` has `doors`, `styles`, `measure()` (meshes, draw calls, triangles drawn, texture bytes
  of the room in view) and `walkAll()` (the door to every pad and spot with the page's NEWTON step).
- **Doors (ROBO-EXTERIORS).** `ixrDoorsFor(parish, { sites, blocked, doorAt })`. When a robotics building kit stands at a
  robot site, expose `globalThis.fxRobotDoorAt(parish, siteId) → { x, z, face }` and the app puts the room's door there
  (guarded; absent, the door spot sits 8.6 m south of the rig). The door is a prompt spot only: no outdoor mesh is added.
- **Dressers (INTERIORS' contract).** `ixrRegisterDressers({ ixRegisterDresser })` registers one dresser per style; a robot
  site object `{ id, name, kind: "robotics", style, stations, anchor, linkSite, board }` is what `enter` takes
  (`ixrSiteFor(rbSite, parish)`), and the app passes the style explicitly (robot site ids are not in `IX_SITE_STYLE`, whose
  ids `check_la_rooms` proves are Louisiana sites).
- **Textures.** `ixrTexRes(tier, ua)`: 1024 only on `high` and not in a standalone headset browser; `IXR_TEX_BUDGET`
  (24 MiB high, 3 MiB balanced and low, every texture in the room counted, mips included); `ixrMeasure(room)` sums the
  unique images on the room's materials (clones share one image and one upload).

## Checkers (last lines)

- `node tools/check_robo_interiors.mjs` → PASS check_robo_interiors: 302 passed, 0 failed (about 1.5 s)
- `node tools/check_robo_interiors.mjs --browser` (IXR_PORT 9093, IXR_PAGE, IXR_TIERS, IXR_SHOTS) → PASS check_robo_interiors: 331 passed, 0 failed (high and low, about 4 minutes on the shared machine); the last run after cycle 7, high only: 324 passed, 0 failed
- `node tools/check_interiors.mjs` → PASS check_interiors: 925 passed, 0 failed
- `node tools/check_la_rooms.mjs` → check_la_rooms: ok — 3787 passed, 0 failed
- `node tools/check_classrooms.mjs` → check_classrooms: ok — 2057 passed, 0 failed

## Left

- **The hive is not standing in the rooms yet.** The agent spots are data (`room.spots.agent`, `IXR_ROOMS[style].spots`) with
  a ring on the floor; AGENT-AVATARS' figures and OMEGA-HIVE's agents are wired at integration through `ixrAgentSpot`
  (`tools/briefs/next/ixr-next.md` item 1).
- **The door is a prompt spot, not a building door.** It stands 8.6 m south of each rig (no outdoor mesh added, so the
  robot-site budgets are untouched). When ROBO-EXTERIORS' robotics building kits merge, their door should become the room's
  door through `globalThis.fxRobotDoorAt` (guarded, unused until then).
- A station launched from a robot room returns outdoors to the anchor site (INTERIORS' Left), not back into the room.
- `WebXR/parishes/dist/parishes.html` was rebuilt locally for the drive (185 modules, the module in it) and restored; the
  coordinator's regeneration picks the module up from `tools/bundle_webxr.py`.
- The captures are 1280×720 in scratch (`$SP/loop10/ixr/shots2/`); 1920×1080 stills for the reel are REEL's.
- `eval_worlds` was run headless only (`--no-browser`; the machine is shared by six consoles), before and after.
- The `check_robo_interiors.mjs` row in `docs/perf/checkers-baseline.json` is an estimate to re-measure on a quiet gate.
- XR controllers inside a room are not wired (the parishes app has no XR session yet).
