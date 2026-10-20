# Progress, October 2026

What the builds of 19 and 20 October 2026 added, each with the file that holds it and the checker that proves it. The robots are simulated; no hardware result, partnership, customer, price or fundraising claim is made here.

## Packs and programmes

| Added | Where it lives | Checked by |
|---|---|---|
| Four entry-point packs with their own focus and shared stations: non-profit operations, ethics and responsible automation, youth club leadership, robot control basics | `WebXR/smartcity/js/curricula.js`, `WebXR/packs/` | `tools/check_packs.mjs`, `tools/check_standards.mjs`, `tools/check_competency.mjs` |
| The instructor console's programme picker offers only a deployment's listed programmes when it lists any | `WebXR/instructor/js/app.js` | `tools/check_enterprise.mjs` |

## Regions, paths and robotics in the worlds

| Added | Where it lives | Checked by |
|---|---|---|
| A training table for every mapped region: its programmes, unions, K-12 entries (tracks and the K-12 station each field lesson links) and robot programmes | `WebXR/shared/region-training-data.js`, `docs/region-training.md` | `tools/check_region_training.mjs` |
| A short ordered route per region: a K-12 entry, a trade programme, then a robot programme where the region offers one | `WebXR/shared/region-paths-data.js` | `tools/check_region_paths.mjs` |
| Robot-control training and a robot station pad at one industrial site in each region that had none (a warehouse, shipyard, port, plant or substation) | `WebXR/shared/np-data-*.js` | `tools/check_parishes.mjs`, `tools/check_parish_data.mjs` |
| Unions on the maps: every union whose training fund covers a category a site's stations fall in now sits in that site's trades, weighted towards sites that match its own work; numbered locals stay in their own area. Three are left out, with the reasons in commit 82fb5b70: FOP (no scope), NTEU (no site fits its work), UMWA (no mine site) | `WebXR/shared/np-data-*.js` | `tools/check_parish_data.mjs`, `tools/check_signage.mjs`, `tools/check_region_training.mjs` |

## Cleanup sites, the Bay waterfront and federal sites

| Added | Where it lives | Checked by |
|---|---|---|
| A cleanup atlas: the six phases of a hazardous-site cleanup in the order the Hunters Point programme teaches them (the record, survey, removal and haul, groundwater, the shoreline, community oversight), every map site that trains or offers a phase, and the unions training each phase on a map | `tools/gen_cleanup_atlas.mjs`, `WebXR/shared/cleanup-atlas-data.js`, `docs/cleanup-atlas.md` | `tools/check_cleanup_atlas.mjs` |
| The Bay's working waterfront (ports, shipyards, the boatyard, the refinery yard, marinas, the ferry landing and a small-boat landing, 20 sites) now offers the hazmat and environmental programme where it taught no cleanup phase, with LIUNA added at the industrial yards | `WebXR/shared/np-data-*.js` | `tools/check_cleanup_atlas.mjs`, `tools/check_parish_data.mjs` |
| An importer for EPA's Superfund National Priorities List export: it keeps only what the CSV says and adds a site type read from the name, marked as such, with the phases that type calls for | `tools/import_npl_csv.mjs` | `tools/check_cleanup_atlas.mjs` (fictional test rows) |

The national list itself is not in the repository yet: this session's network policy blocks www.epa.gov. A CSV exported from EPA's site search, or allowing that host, lets `node tools/import_npl_csv.mjs <file.csv>` write `docs/cleanup/npl-sites.json`.

## Interiors and the interface

| Added | Where it lives | Checked by |
|---|---|---|
| A recreation-centre gym and a performance and event hall, in place of the civic lobby at recreation centres, theatres, event venues and stadium concourses | `WebXR/shared/ix-interiors.js`, `WebXR/shared/hd2-room-skins.js` | `tools/check_interiors.mjs`, `tools/check_room_skins.mjs` |
| HUD panels that start closed, open from their header and move, so the scene is not covered; the choice is kept per viewer | `WebXR/shared/ctl-dock.js` | `tools/check_dock.mjs` |

## Robot training data

| Added | Where it lives | Checked by |
|---|---|---|
| Synthetic worker-assist episodes in a ROS 2 message layout, for every union with a scope, over four generic robot styles (collaborative arm, mobile robot, gantry hoist, inspection quadruped); a speed-and-separation governor caps speed by the worker's distance and holds zero under e-stop on every step | `exports/ros-assist/`, `tools/gen_ros_assist.mjs` | `tools/check_ros_assist.mjs` |

Not included yet: translated robot instructions (they need a reviewed source), any brand or model of robot, and any hardware run.
