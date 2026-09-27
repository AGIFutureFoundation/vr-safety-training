# Stage districts

`WebXR/smartcity/js/districts.js` gives every SmartCiti.X station the horizon a worker in its trade would actually see — transmission pylons behind a substation, a container terminal behind a lashing deck, a truss arch behind a company switch — plus the sky, fog and light-mast tint that go with it. Most districts are a ring of scenery between the plaza edge and the skyline: twenty to sixty meshes, built once by `smartcity/js/stage.js`'s `buildStage()` and shared by every station whose `category` selects them. A handful are *scenic* districts instead (`plaza: false`): the district IS the ground the learner stands on, in place of the plaza, masts, marquee and site apron, with its own sky, fog, spawn and roam — `tools/check_districts.mjs` holds each of those to a documented mesh ceiling (`SCENIC_BUDGET`, 120 meshes) and confirms it is reachable and lit at every hour. A station names a district with `category` (the trade districts) or `district: "<id>"` (the scenic ones); `?district=<id>` previews any of them with no station loaded. Every district's sky and fog lift for `?time=dusk|day` the same way (see `stage.js`'s `TIME` table); a district only overrides that with its own `skyByTime` when it has its own reason to (a bridge deck's marine layer, the bottom of the bay).

## Trade districts

**Energy & Power** — three transmission pylons strung with sag-lined spans and two more standing off at an angle, under a cold pre-dawn sky, for the switching, substation and generation stations.

**Mobility & Transit** — an elevated guideway with a train that runs the platform and cycles its stop lights, for transit and fleet stations.

**Water & Environmental** — two water storage tanks on a quiet shoreline, still water to the horizon, for treatment, distribution and stormwater stations.

**Connectivity & Telecom** — a telecom lattice tower with pulsing beacons and two cell monopoles, for splice, backhaul and battery-yard stations.

**Emergency Services** — two ranks of apparatus with alternating light bars, under a dim amber sky, for fire, EMS and dispatch stations.

**Manufacturing & Automation** — three production sheds and two stacks with drifting plumes, for cell, press and CNC stations.

**Building Systems & Facilities** — a rooftop cooling tower with turning fan blades, for HVAC, boiler and facilities stations.

**Construction & Structural Trades** — two tower cranes slewing over a rebar-and-panel laydown, under a bright site sky, for erection, concrete and formwork stations.

**Entertainment & Live Events** — a lighting truss with moving-head fixtures sweeping over a stage deck, under a violet house-light sky, for rigging and production stations.

**Maritime & Ports** — two ship-to-shore gantries over stacked containers with a vessel alongside, for terminal, lashing and vessel stations.

**Environmental Monitoring** — a bay shoreline under a cleanup order: a tidal flat with cordgrass, a clamshell dredge working a turbidity curtain, monitor masts and a wind sock, with the city's hills standing across the water on the far shore.

**Surface Prep & Coatings** — a blast-and-coat containment tent with a flickering interior light, an abrasive silo and a coating store, under a dusty amber sky, for surface-prep and coatings stations.

**Culinary & Hospitality** — a row of storefronts with a turning ventilation fan, under a warm evening sky, for kitchen, dining and hospitality stations.

**Dental & Oral Health** — a clinic block with a pulsing cross sign and a monopole beyond it, under a cool clinical sky, for dental and oral-health stations.

**Community Environmental Justice** — a fenced residential parcel on a quiet street with a cycling street lamp, for community and environmental-justice stations.

**Sewing & Garment Trades** — a garment loft with cycling window panes, under a violet dusk sky, for sewing and garment-trade stations.

## Scenic districts

**golden-gate-deck** — a suspension-bridge deck and tower in International Orange, with a main cable, suspender ropes, a maintenance traveller and a lane closure; the deck itself is the ground, the marine layer stands off the strait by default, and the city shows across the bay, far off and far below. Bridge and paint-crew stations stand here (`district: "golden-gate-deck"`).

**bay-underwater** — a submerged scene on the floor of the bay: blue-green fog closing in within a few metres, a caustic light pattern overhead, drifting silt and bubbles, a pier's creosote piles under marine growth, a ship's hull side and a dive stage with an umbilical to the surface. Forces its own clear conditions regardless of a station's or the URL's own weather, and adds the HUD's depth/bottom-time chip for any station that sets `room.underwater`.

**gym-court** — an indoor maple-floor basketball court under its own climate-controlled light at every hour, with no plaza, skyline or weather of the kind an outdoor district carries. Adds the HUD's scoreboard chip (drills, fouls, clock) for a station with its own `scoreboard` labels.

**open-range** — rolling grass and dirt to a long horizon, a ridge line of wind turbines, a transmission line striding off toward them and a dirt road; sustained wind is the range's own default weather. For jobsite and utility-right-of-way stations built on open, unpaved ground.

**fairway-park** — a large open outdoor world: a nine-hole golf course and an outdoor sports facility (running track, basketball and tennis courts, a soccer/football pitch, bleachers and a maintenance yard), laid out in `shared/fairway.js` and shared, in parallel, by a golf/sports mini-game and a grounds-and-landscaping training programme. The stage only ever builds fairway.js's compact clubhouse-and-first-tee preview here (`buildFairwayPark(g, { detail: "low" })`), the same way `open-range` does not model a real ranch's acreage — the full 600 m × 400 m course and facility (`detail: "high"`, LOD 0) is what a standalone golf or landscaping app gets from `buildFairwayPark()` directly, with its own camera and its own mesh budget (`FAIRWAY_MESH_BUDGET`). Defaults to clear weather with the sky and fog following the hour like any other outdoor district, plus an optional heat-haze-style shimmer over the course at midday only — cosmetic, not a substitute for a station or the URL actually asking for `heat-haze` weather. `shared/fairway.js` also exports the course as data (`FAIRWAY_HOLES`, `FAIRWAY_FACILITY`) and two pure functions with no renderer dependency, `fairwayHeight(x, z)` (the terrain's deterministic, bounded, continuous elevation) and `fairwayLieAt(x, z)` (`"tee" | "fairway" | "rough" | "green" | "bunker" | "water" | "path" | "out"`), so a game's ball physics and a training rubric's scoring both read the same ground truth the scene is built from.

**bay-world** — a large stylised open world: sixteen zones (a dense downtown and uptown, a lake, an estuary waterfront, a working port with container cranes, an industrial flank, a market district, a stadium/arena district, hills that climb away from the water, a suspension-bridge approach, and — since the expansion — an island harbour across the estuary, a north shoreline marina town, a small distribution-and-lab town, a south shoreline marina and treatment plant, the upper hills above the hills, and the outer bay's open water), twenty-eight public landmarks and fifty training sites, laid out in `shared/bayworld-data.js` and built by `shared/bayworld.js`, shared, in parallel, by a free-roam driving-and-exploration game and a quest/objective layer built against the same zones, landmarks and sites. The stage only ever builds bayworld.js's compact street-corner preview here (`buildBayWorld(g, { detail: "low" })`), the same way `fairway-park` does not model its full course on the shared stage — the full 1600 m × 1100 m world (`detail: "high"`, LOD 0, optionally restricted to one zone with `opts.zone`) is what a standalone free-roam or quest app gets from `buildBayWorld()` directly, with its own camera and its own mesh budget (`BAY_MESH_BUDGET`). `shared/bayworld-data.js` also exports the world as data (`BAY_ZONES`, `BAY_LANDMARKS`, `BAY_ROADS`, `BAY_SITES` — every training programme in `smartcity/js/curricula.js` anchored at a plausible site) and three pure functions with no renderer dependency: `bayHeight(x, z)` (deterministic, bounded, continuous elevation that rises to the hills and stays flat over downtown and the port), `bayZoneAt(x, z)` (the nearest of the ten zones) and `bayRoadAt(x, z)` (`{ onRoad, lane, heading }` or `null`), so a driving game's physics and a quest script's placement both read the same ground truth the scene is built from. Every place named is generic and original — no real organisation, brand or event is asserted.

**the-deep** — the bottom of the bay as an open world: fourteen zones (a shallow shelf off the shore, an eelgrass meadow, a kelp forest on rock, a shipping channel and its approach, a wreck hollow, pier pilings, an outfall apron, a tidal-marsh channel mouth, tide-gauge flats, a reef ball field, a mud plain, a deep trench and a seamount), twenty-five landmarks and thirty-two dive and survey sites, laid out in `shared/underwater-data.js` and built by `shared/underwater.js`, shared with a swim-or-ROV dive game and its quest layer (`docs/underwater.md`). Like `bay-underwater`, the learner stands *on* the silt and the district brings its own floor; the water colour is its own at every hour and conditions are forced to `underwater` with a note that defers every depth, gas, decompression and current limit to the dive plan. The stage only ever builds underwater.js's compact seabed vignette here (`buildUnderwater(g, { detail: "low" })`) — the whole 2000 m × 1400 m seabed (`detail: "high"`, optionally one zone with `opts.zone`) is what a standalone dive app gets from `buildUnderwater()` directly, with its own camera and its own mesh budget (`DEEP_MESH_BUDGET`). `shared/underwater-data.js` also exports the world as data (`DEEP_ZONES`, `DEEP_LANDMARKS`, `DEEP_LINES`, `DEEP_SITES`) and pure functions with no renderer dependency: `deepDepthAt(x, z)` (deterministic, bounded, continuous seabed depth — scenery and gameplay only, never a limit shown to a learner), `deepZoneAt(x, z)`, `deepLineAt(x, z)` (`{ onLine, id, kind, heading }` or `null`) and `deepBandAt(x, z)`; `shared/underwater.js` adds `deepLighting(band)`, the fog, light, caustic and particulate recipe for the shallow, mid and deep bands. Every place named is generic and original.

**wind-farm** — a ridge wind farm on the range floor: one kit `windTurbine` near enough to climb (tower door, ladder with its fall-arrest rail, nacelle hatch and service crane), turbine silhouettes along the ridge and a fenced collector substation. Wind is its default weather; the rotors turn faster in `wind` and `storm`. For the wind-and-data-infrastructure turbine and substation stations.

**data-center-build** — a data hall under construction: the slab, a steel frame with its back wall up, one finished kit `dataHall` module (raised floor with a lifting tile, hot and cold aisles, racks, busway, CRAH with its alarm lamp and a clean-agent suppression panel), a cable tray overhead and a kit `scissorLift` in the next bay. Overcast by default; the hour and a station's own weather still read through the open bays.

**ocean-data-center** — a sealed data pod from a workboat's working deck and from below: the learner stands on a deck-plate deck beside the kit `deckCrane`, the service `workboat` alongside, and the kit `oceanDataPod` rests on its seabed skid off the stern on the Deep's own silt face (`deepSiltFace` from `shared/underwater.js`). Wind is its default — a crane lift over the side reads the sea state — and every diving limit is per the dive plan.

## Simulation options: `?fault=`

Every station in these districts takes the platform's options — `?weather=` (wind matters to a climb, a blade platform and a lift over the side), `?time=`, the interruption drill (`?interrupt=`) — and one more a station declares for itself: `?fault=<id>`. A station lists its faults in `faults: [{ id, label, note, step, change }]`; `shared/faults.js` (`faultFromQuery`, `faultedRoom`) rewrites that one step with `change` so its correct answer is different, the app shows the fault's note on the rail, and the station's `onFault(id)` changes the scene to match (a lamp lit, a part shown or moved). A fault a station does not declare is ignored. `tools/check_districts.mjs` asserts every declared fault changes both its step's answer and the scene, names a registered control and is listed here.

| Station | `?fault=` | What changes |
|---|---|---|
| ws-turbine-climb-and-rescue-kit-check | `fall-arrest-rail-damage` | A bent rail section shows a red tag; the runner step becomes tagging the ladder out of service |
| ws-nacelle-lockout-and-yaw-brake-fault | `yaw-brake-fault` | The yaw-brake fault lamp lights and the yaw ring has crept; the yaw step becomes engaging the mechanical yaw lock |
| ws-blade-inspection-from-a-platform | `anemometer-fault` | The met-mast readout shows FAULT; the go/no-go becomes a reading on the handheld anemometer |
| ws-substation-switching-under-a-permit | `breaker-fails-to-open` | The breaker flag lamp goes amber and its cubicle darkens; the prove-open step becomes holding the order and reporting |
| ws-data-hall-busway-install-and-torque-signoff | `torque-mark-missing` | A red ring shows on a joint with no torque mark; the mark check becomes re-torquing that joint |
| ws-raised-floor-tile-lift-and-cable-tray-safety | `damaged-pedestal` | A bent pedestal shows under the open tile; the reseat step becomes keeping the opening barricaded and reporting it |

## Budget and the gate

`node tools/check_districts.mjs` (part of `check_all.mjs`) builds every scenic district headlessly at night, dusk and day against a stub three.js rich enough to measure a mesh's own footprint, and fails on: a build or an animate frame that throws; more meshes than `SCENIC_BUDGET` (120 — the same ceiling every scenic district's own stage preview lives inside, `fairway-park`'s and `bay-world`'s included); more than four lights of its own; a spawn outside its own roam circle, too close to the middle, or with the walk to the middle blocked; ground missing under any point the learner may walk to; and, for `golden-gate-deck`, `bay-underwater`, `open-range` and `fairway-park`, that they exist as scenic districts at all. `docs/screenshots/districts/` carries a spawn screenshot for each. `tools/check_bayworld.mjs` separately holds `shared/bayworld-data.js`/`shared/bayworld.js` to their own ground-truth rules (zone coverage, every landmark and site in its own zone, every curriculum programme anchored, the road network connected, `bayHeight`/`bayRoadAt` correct, both detail levels and every zone under `BAY_MESH_BUDGET`) the same way `tools/check_fairway.mjs` holds `shared/fairway.js`.
