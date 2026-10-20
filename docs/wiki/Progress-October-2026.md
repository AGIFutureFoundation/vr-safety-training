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
| Unions on the maps: every union whose training fund covers a category a site's stations fall in now sits in that site's trades, weighted towards sites that match its own work; numbered locals stay in their own area. Three are left out with the reason in the generator (no scope, no site that fits its work, no mine site) | `WebXR/shared/np-data-*.js` | `tools/check_parish_data.mjs`, `tools/check_signage.mjs`, `tools/check_region_training.mjs` |

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
