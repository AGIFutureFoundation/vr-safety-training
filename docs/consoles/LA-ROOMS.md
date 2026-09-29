# LA-ROOMS — walk-in rooms for the Louisiana site kinds (`lar`, port 9023)

Loop 3 console. Module `WebXR/shared/lar-rooms.js`; styles and site map in `WebXR/shared/ix-interiors.js`; checker
`tools/check_la_rooms.mjs`; mounted in `WebXR/parishes/js/app.js`. SmartCiti.X Powered by AGI Corp.

Before this console, the Louisiana maps' new site kinds opened generic rooms: a hangar was a warehouse, a compressor station
or a control room a treatment-plant room. Now six rooms follow the INTERIORS shell and the CLASSROOMS pattern. Every
object in them launches one real thing: a catalog station or a Louisiana programme simulation (`LP_SIMS`, which
`lpRegisterSims` registers with PROJECTSIM).

Every room is **generic by kind**. The shell's back-wall sign says "a generic room for this kind of site — not a model of
the real building". No project figure is quoted. The craft hall carries the programme's `LP_NO_PARTNERSHIP` line, and its
union names are only `tools/unions.json` abbreviations, used as trade references.

## Rooms

| Style | Opens at | Objects → launches |
|---|---|---|
| `lar-hangar` (aircraft hangar, 26×24 m) | kind `hangar`; `lav-paint-hangar` | a generic airframe; jacks → `av-hangar-jacking-and-stands`; work stand → sim `lp-sim-freighter-conversion-jacking`; ground power cart → `av-ground-power-and-static-bonding-before-fuel`; tool crib → `av-borescope-and-tool-control-inventory`; FOD bin → `ad-depot-tool-control-and-fod-walk`; booth filter wall → sim `lp-sim-paint-hangar-ventilation-ppe`; sprayer → `paint-sprayer`; respirator bench → `ib-spray-foam-and-respirator-fit`; tug → `av-pushback-tug-and-towbar-connection`; wands → `av-marshalling-and-wingwalker-signals`; lesson board → `k12-lk-how-a-wing-lifts-an-aircraft` |
| `lar-hangar`, vehicle variant | `lsb-vehicle-processing-hangar` | a vehicle stage on cradles; crane pendant → `ad-payload-crane-lift-with-a-lift-plan`; lift plan → `rl-critical-lift-plan-and-signalperson`; FOD bin; servicing cart → `ad-hazardous-fluid-servicing-with-a-buddy`; exclusion rope → `ad-test-stand-exclusion-zone-and-holds`; board → `lp-cryogenic-propellant-awareness` (awareness only) |
| `lar-fab-shop` (shipyard fabrication shop, 24×20 m) | Saronic sites `lsf-hull-fabrication`, `lsf-large-vessel-line`, `lsf-plate-cutting-shop`, `lsf-blast-and-paint` (kind `shipyard` stays `workshop`: it is on ten other maps) | plasma table → `sm-plasma-table-and-fume`; hull block → `shipyard-hotwork`; manway → `ib-pressure-vessel-confined-entry-and-hot-work`; fire watch post → sim `lp-sim-hull-block-weld-fire-watch`; weld booth → `welding`; hoist → `chain-hoist`; lift plan → `rl-critical-lift-plan-and-signalperson`; marine bench → `lp-marine-vessel-electrical-safety`; shore power → `shore-power-hookup`; blast booth → `bridge-blast`; coating → `tank-lining`; vent panel → sim `lp-sim-paint-hangar-ventilation-ppe`; gangway → `vessel-gangway-and-hatch-cover-safety` |
| `lar-data-hall` (data hall + electrical room, 20×16 m) | `lmr-data-hall-fitout`, `ldf-electrical-room`, `ldf-network-cabling` | rack rows with a hot aisle; busway tap-off → `ws-data-hall-busway-install-and-torque-signoff`; permit board → `data-hall`; permit kiosk → sim `lp-sim-data-hall-energised-work`; tile lifter → `ws-raised-floor-tile-lift-and-cable-tray-safety`; CRAH → `ws-crah-alarm-response-in-a-live-hall`; behind a partition: switchgear → `motor-control-center`, arc labels → `arc-flash-label-study`, UPS → `pm-electrical-room`, chilled water → `chiller-plant`, riser → `fire-pump`; lesson board → `k12-lk-where-a-data-center-gets-its-power` |
| `lar-control-room` (process control room, 14×12 m) | `lsp-control-room`, `lbb-control-building`, `lcc-control-building` | consoles → `se-building-automation-alarm-triage`; fire and gas panel → `pm-fire-alarm-panel-room`; gas cabinet → `gas-leak-survey`; lockout board → sim `lp-sim-wellpad-lockout`; MCC panel → `motor-control-center`; arc labels; permit rack → `ib-pressure-vessel-confined-entry-and-hot-work`; muster → `hazwoper-site-orientation`; process board per map (Shintech → `chlorine-room`, Black Bayou → `lp-gas-storage-wellpad-awareness`, else `ib-hydrostatic-test-and-inspector-witness`) |
| `lar-compressor` (gas storage compressor building, 20×14 m) | kinds `compressor`, `wellpad`; `lbb-metering-station`, `lbb-blending-skid` | compressor skid → sim `lp-sim-wellpad-lockout`; MCC → `motor-control-center`; arc labels; detector stand → `gas-leak-survey`; manifold → `pl-natural-gas-pressure-test-and-leak-check`; header fitting → `hot-tap`; meter run → `ut-gas-meter-set-and-regulator-vent`; board → `lp-gas-storage-wellpad-awareness`; test cart → `ib-hydrostatic-test-and-inspector-witness`; vault hatch → `valve-vault` |
| `lar-craft-hall` (Louisiana crafts training hall, 24×18 m) | nine Louisiana workforce centres and trailers that are not CLASSROOMS rooms | lobby board (the programme's crafts as trade references) → `union-hall-and-dispatch`; apprenticeship board → `apprenticeship-standards-reading`; awareness corner → `k12-lk-the-crews-behind-a-big-build`; one bay per `LP_PATHWAYS` role pathway (construction, data-center operations, process, marine, aviation MRO, launch-site support): bench → the pathway's first station, kiosk → its simulation |

In total: 27 rooms on 12 Louisiana maps, 326 objects, 78 of them programme simulations. 272 of the 326 launches are in the
Louisiana programme itself; all 326 resolve.

## Seams

- `ix-interiors.js`: six style keys in `IX_STYLES`, each with `IX_FEATURES`. `IX_KIND_STYLE` now maps hangar →
  `lar-hangar` and compressor and wellpad → `lar-compressor`. The new `IX_SITE_STYLE` (plain data, site id → style) is read
  first by `ixStyleFor(kind, siteId)` and by `enter`. The one-argument calls (CLASSROOMS) are unchanged.
- `lar-rooms.js`:
  - `larRoomsFor(parish)` returns rooms as plain data: `{ id, style, parish, site, name, note, fixtures: [{ id, shape, label, at, face, launch }], deco }`.
  - `larSpot(fixture)` gives the spot where the learner stands to use an object.
  - `larDress(...)` draws ONE InstancedMesh per room (per-instance colour). Parts that stand in the walk become colliders. Each object is one `room.addAction`: a station as kind `station` (the mount's `onLaunch`), a simulation as kind `lar-sim` (its `run` calls `launch`). The phone tier drops decoration only.
  - `larRegisterDressers({ ixRegisterDresser }, { parish, launch })` is guarded, like CLASSROOMS'.
- `app.js`: registers the dressers with CLASSROOMS' `crLaunch`, which turns a station into a station link and a simulation into `psWorld.open(id, site)`.

## Cycles

1. Reason: the six rooms need shells that build within budget before any content goes in. Act: six `IX_STYLES` with signature
   fittings, the kind remaps, `IX_SITE_STYLE` and `ixStyleFor(kind, siteId)`. Observe: check_interiors 733 passed, 0 failed
   (46 maps, 94 kinds, 13 styles).
2. Reason: each object must launch one real thing, and the room must stay usable. Act: `lar-rooms.js` layouts, the dresser, and
   `check_la_rooms.mjs` (coverage, launches, budget, reachability by a 0.2 m walk-grid BFS, nearest action = itself, run
   launches its own). Observe: 3270 passed, 328 failed. Every failure was the checker comparing launch objects by identity
   across two `larRoomsFor` calls; the fix compares by type and id.
3. Reason: the checker's own bug. Act: compare `{type, id}`. Observe: 3596 passed, 2 failed (only the wiring lines).
4. Reason: mount it in the page and the bundle. Act: `larRegisterDressers` in app.js with `crLaunch`, the bundler entry after
   cr-classrooms.js, the check_all list and the baseline. Observe: check_la_rooms 3598 passed, 0 failed; check_interiors 733/0;
   check_classrooms 1684/0; check_parishes 62985/0.
5. Reason: prove it in the real page, not just the module. Act: `node tools/check_la_rooms.mjs --browser` (LAR_PORT 9023)
   drives parishes.html?parish=la-meta-richland: teleport to the data hall's door, E, check the room, stand at the tile lifter,
   E at the door. Observe: 3604 passed, 0 failed. The page entered `lar-data-hall` with 11 object actions and 15 meshes, offered
   `lar-tile` at its spot, came back to the same door spot, with no page errors.
6. Reason: the objects must read at a glance, not only through the prompt. Act: one name sign (a canvas plane) over every object,
   on both tiers. Observe: check_la_rooms 3706 passed, 0 failed. The worst room is 30 meshes, 1114 / 986 triangles
   (caps 120; 6000 / 3000). A real-page screenshot of the AVEX paint hangar shows the signed respirator bench, the sprayer,
   the tug and the airframe.
7. Reason: a craft hall should lead with the work planned on its own map. Act: `larPathwaysHere(map)` (the pathways of the
   LP_TRACKS placed on the map) fills the front row nearest the door, and the lobby board names them. Observe:
   check_la_rooms 3733 passed, 0 failed (9 craft halls, each with its map's pathways in the front row). The browser pass
   gives 3739 passed, 0 failed (the data hall is 26 meshes with signs, no page errors). check_interiors 733/0;
   check_classrooms 1684/0.

## Checkers (last lines)

- `node tools/check_la_rooms.mjs` → `check_la_rooms: ok — 3733 passed, 0 failed` (about 1.5 s); with `--browser` (port 9023) → `ok — 3739 passed, 0 failed` (about 30 s)
- `node tools/check_interiors.mjs` → `PASS check_interiors: 733 passed, 0 failed`
- `node tools/check_classrooms.mjs` → `check_classrooms: ok — 1684 passed, 0 failed`
- `node tools/check_parishes.mjs` → `check_parishes: 62985 passed, 0 failed`

## Left

- The existing union-hall sites on Louisiana maps (`lcd-union-hall`, `brd-workforce-centre`, `ham-workforce-centre`) keep
  CLASSROOMS' generic five-bay training centre. Adding the Louisiana pathway bays there is a CLASSROOMS change.
- PROJECTSIM's open panel says "funded under the Bay Program awards and Clean Ports" for every simulation, including the
  Louisiana ones (`ps-projectsim.js` `open`). That wording belongs to PROJECTSIM or LA-PROGRAMME.
- The browser pass covers one room (the data hall). The other five are proved headless (build, reachability, launch).
- A station launched from a room goes to the station page and comes back to the site outside, not into the room (INTERIORS' open item).
