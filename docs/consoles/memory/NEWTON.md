# NEWTON — memory

- Base d85a41f (reset from 589f0d8). Prefix `nw`, port 8982, temp `$SP/packs/newton/`.
- `WebXR/shared/nw-physics.js` (pure): `nwWorld`, `nwAvatarStep`, `nwVehicleStep` (wraps MOTORPOOL's `dvStepDrive`),
  `nwCrashCard` / `NW_AFTER_COLLISION` (from `traffic-incident-management`), `nwParishWorld` with fallbacks
  `nwParishColliders` (massing footprints from np-world.js's geometries, site buildings at pad −14, −12) and
  `nwParishWaterDepth` (`NP_WATER_Y − npHeightAt` over `npWaterAt`).
- `WebXR/shared/nw-drive.js`: `nwMountPhysics` — props (cones, barrels, parked cars; phone tier fewer) instanced, splash
  ring, swim meter, schematic vehicle by class, dent by vertex offset, hazards, the card DOM (`#nw-card`).
- Parishes app: walk through `nwPhys.walk`, drive via the Motor Pool board's `onDrive`, Q exits; `__parishTest.newton`.
- Seams read from `globalThis.tfWaterDepthAt / tfFlowAt / cwColliders / tfLitterAt` until the coordinator imports them.
- Checker `tools/check_newton.mjs` (57 checks, ~2.6 s), in check_all and the baseline.
