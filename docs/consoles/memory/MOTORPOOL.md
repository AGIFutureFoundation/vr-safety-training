# MOTORPOOL memory — read this first at this console

Short, durable lessons for the next team on the Motor Pool (`WebXR/shared/drivables*.js`, `tools/check_drivables.mjs`).

- **Three modules, one dependency direction.** `drivables-data.js` is pure (no imports) so `check_gates` / `gen_gate_names` discover `DV_GATED` and any bundle can carry it; `drivables.js` holds the kit and imports fleet.js, equipment.js and the data; `drivables-board.js` is DOM-only and must never spell `THREE.` (the bundler would then import three.js for it). Keep the split.
- **Measure, then declare.** New builders' footprints and mesh counts are pasted from `node tools/check_fleet.mjs --measure | grep drivables.js` (the script in `$SP/crescent/motorpool/` rewrote DV_BUDGET from that output). Do not guess a footprint; the tolerance is 3 % or 6 cm.
- **A rig offset centres a builder whose gear overhangs.** Forks and a telehandler boom push the bounding box forward: `flRig(parent, x, y, z, opts, kind, [0, 0, -shift])` shifts everything inside so the footprint stays centred (reach truck −0.34, telehandler −1.54).
- **Foils below the keel are legal.** A dinghy's rudder and daggerboard and a pontoon's outboard leg sit below y 0; mark the budget row `belowGround: true` (as equipment.js's craneSpreader does) rather than lifting the hull.
- **The extra option argument on cyl/box is ignored.** `cyl(p, r, r, h, x, y, z, ...FL.amber, { seg: 12 })` passes ten arguments; kit.js's `cyl` takes nine, so the segments default. fleet.js does the same; it is harmless, only cosmetic.
- **Helm runs must stop on neutral, not astern.** A fixed −0.4 astern phase leaves a hull moving backwards; the scripted run uses astern while `speed > 0.4`, then neutral, the way a real stop is made.
- **Gate items from other consoles are picked up by name.** Any `export const …GATED… = […]` in a `*-data.js` under WebXR/ with no CDN import is discovered; every item needs `title`, `world`, a `gate.note` with no digit, and `qmMechanicFor` will build mechanic steps from its title — so no digits in titles either. Run `node tools/gen_gate_names.mjs` after adding gates (116 names now).
- **Bay World hook is a registry, not a depot.** `bwRegisterVehicles` adds params to sim.js's id map; `BW_VEHICLES` stays four so world.js parks four. `bwTakeOutDrivable` builds one kit beside the learner and removes the previous one — never fifty meshes in the scene.
- **Watercraft in Bay World** only link to the Regatta from the board; the helm engine (`dvStepHelm`) is proven headless. Mounting a helm in a world is the next phase.
