# MOTORWORKS — more drivable vehicles in the walkable maps

Console MOTORWORKS, the environment & robotics wave (prefix `mv`, port 8993). NEWTON's drive mode drove one
schematic vehicle from the Motor Pool board; now the Motor Pool's land classes park at fitting sites in the 22
parish-engine maps and drive with per-class handling, each gated on its existing pre-trip station.

## What landed
- `WebXR/shared/mv-motorworks.js` — plain, dependency-free data for TQ-BRIDGE: `MV_HANDLING` (per class: mass, top
  speed, accel, brake, turning radius — game values), `MV_OVERRIDES`, `MV_SITE_RULES` (site kind → drivables),
  `MV_BUDGET`, `MV_CLASS_COLOUR`; `mvHandling`, `mvProfile`, the braking arithmetic (`mvStopDistance`, `mvStopTime`,
  `mvTimeToTop`) and `mvLivery` (PALETTE's colour categories when passed, any plausible `PA_CATEGORIES` shape, guarded).
- `WebXR/shared/mv-world.js` — `mvPlacements` (pure: dry, level-enough spots on a ring round each fitting site, parked
  kerbside parallel to the nearest road, clear of carriageways, building boxes and NEWTON's props; one per site, no
  drivable more than twice a map, capped by tier), `mvDriveEntry`, `mvGate`, `mvPaletteCategories` (the guard) and
  `mvMountMotorworks` (two InstancedMeshes per map — body and cab — with per-instance size and livery colour).
- NEWTON's drive model (`dvStepDrive` in drivables-data.js) reads two optional profile fields: `brake` (m/s²) and
  `minRadius` (m, yaw rate ≤ |speed| / radius). Absent, the handling is exactly as before (Bay World and the board
  unchanged — the checker proves it bit for bit). `nwVehicleStep` lets a heavier vehicle lose less to a cone
  (`profile.mass`). `nwMountPhysics().drive(entry, x, z, heading, { snap })` — `snap: false` pulls away from the bay.
- The parishes app: walk up to a parked vehicle → "E — pre-trip and drive the box truck" (or "locked until its
  pre-trip station is on your passport", with the station named); E opens the Motor Pool board at that row's pre-trip;
  Drive (after every item is ticked — the gate contract, unchanged) drives it from its bay with its class's handling;
  Q / Use steps out and the vehicle is back in its bay. The crash card is NEWTON's, unchanged.
- Placed: 166 parked vehicles on 21 of 22 maps (phone tier 84); Strip Marsh East has none — every fitting site's
  ring is marsh or water. 2 meshes per map whatever the count.
- `tools/check_motorworks.mjs` (in check_all's list and the baseline).

## Cycles
1. Reason: per-class handling as plain data, read by NEWTON's drive model through two optional profile fields; proof
   = the handling line in check_motorworks (top held, time to top, stop distance, radius) and the legacy-profile line.
   Act: `mv-motorworks.js`, `dvStepDrive` brake/minRadius. Observe: 45 land drivables pass all four; legacy profile
   drives bit-for-bit as before; check_drivables 2188 checks pass.
2. Reason: parked vehicles at fitting sites, dry and off the road; proof = the place line over 22 maps. Act:
   `mvPlacements`. Observe: FAIL — 5 footprints on marsh water polygons (NEWTON's depth read 0 there).
3. Reason: dry means no water polygon too. Act: `npWaterAt` in the footprint test. Observe: all spots dry; Strip Marsh
   East now places none (all-marsh sites); wider rings (48, 60 m) did not help, reverted; the check reports the empty map.
4. Reason: the crash card must be unchanged on the new handling; proof = the crash lines. Act: none needed beyond
   passing the profile. Observe: a box truck into a wall at 15 m/s opens `traffic-incident-management`; a forklift
   (top 4 m/s) only bumps.
5. Reason: enter/exit prompt and gate in the app, two instanced meshes; proof = the budget, gate and mount lines.
   Act: `mvMountMotorworks`, app wiring (prompt, E, board pre-trip, snap-off drive, re-park on exit), bundle list.
   Observe: 2 meshes for 8 vehicles in West Oakland; empty passport locks on the pre-trip station; check_newton 60/60.
6. Reason: PALETTE's liveries guarded; proof = the livery lines. Act: `mvLivery` over object- or array-shaped
   categories; `mvPaletteCategories` guard. Observe: class colour without PALETTE; a matching swatch with a fake
   `PA_CATEGORIES`; unreadable shapes fall back.

## Seams
- Provides (plain data for TQ-BRIDGE, `WebXR/shared/mv-motorworks.js`): `MV_HANDLING`, `MV_OVERRIDES`, `MV_SITE_RULES`,
  `MV_BUDGET`, `MV_CLASS_COLOUR`, `mvHandling(entry)`, `mvProfile(entry)`, `mvStopDistance(h, v)`.
- Provides (`WebXR/shared/mv-world.js`): `mvPlacements(parish, world, { tier })`, `mvMountMotorworks(opts)`,
  `mvDriveEntry(entry, ctx, categories)`, mounted in `WebXR/parishes/js/app.js`.
- Consumes (guarded): PALETTE's `PA_CATEGORIES` (`shared/pa-palette.js`) — read as a bundled const or
  `globalThis.PA_CATEGORIES`; the coordinator closes the seam by importing it in `app.js` and passing
  `categories: PA_CATEGORIES` to `mvMountMotorworks`. NEWTON's `nwParishWorld` world (water depth, boxes) and
  `NW_CLASS_DIMS`; the Motor Pool registry and skill-gates' `qmMissing`.

## Left
- No vacuum truck in the Motor Pool registry: stormwater sites park a water truck or utility van (a registry entry
  plus a builder would be MOTORPOOL's). Watercraft at marinas wait on a NEWTON water drive mode.
- Parked vehicles are schematic instanced silhouettes (NEWTON's class dims), not the full Motor Pool builders — the
  parish bundle keeps the builders out for weight; a near-ring full build would pull fleet.js/equipment.js in.
- Parked vehicles are not yet NEWTON dynamic bodies (driving into one goes through it); CITYWORKS' generated street
  fabric is not in the road-clearance test (the parishes' own named roads are).
