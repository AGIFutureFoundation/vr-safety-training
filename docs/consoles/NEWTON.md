# NEWTON — gravity, crashes and water reactions

Console NEWTON, the Packs run (`tools/briefs/packs-brief.md`, section NEWTON; prefix `nw`, port 8982).

## Plan (written before code)

1. `WebXR/shared/nw-physics.js` — pure (no three.js, no DOM), so `tools/check_newton.mjs` imports it in Node:
   - `nwWorld({ groundAt, colliders, waterDepthAt, flowAt })` → `{ addBody, removeBody, step(dt), bodies, contacts }`.
     Fixed step (1/60 s, accumulator, at most 8 steps a frame), gravity, ground contact from `groundAt`, AABB bodies
     against `cwColliders`-shaped boxes (`{ min: [x, y, z], max: [x, y, z], kind }`), swept in sub-steps no longer
     than a quarter of the smallest half-extent so a fast body never tunnels, body–body impulses with restitution,
     buoyancy from `waterDepthAt`, drift from `flowAt`, sleeping bodies woken by contact.
   - `nwAvatarStep(state, input, dt, world)` → state: gravity, falls off an edge (a drop larger than a step), walls
     block (per-axis slide against the boxes), wades (depth 0.3–1.2 m: slower, a splash cue), swims (deeper: bobs at
     the surface on a damped spring, slower, a breath meter as a readiness cue that refills — never a fail), carried a
     little by the flow.
   - `nwVehicleStep(veh, input, dt, world, profile)` → `{ state, crash }`: MOTORPOOL's `dvStepDrive` handling
     (same profile shape: `top`, `accel`, `turn`) with a footprint tested against the boxes and the dynamic bodies
     (swept in sub-steps); an impact at or above `NW_CRASH_SPEED` stops the vehicle and reports a crash, below it bumps.
   - `nwCrashCard(crash)` → the "after a collision" card (secure the scene, check people, call it in), drawn from the
     catalog station `traffic-incident-management` (its sourcing travels with the card), or null below threshold.
   - Fallbacks when TERRAFORM / CITYWORKS are absent: water depth from `npWaterAt` and `npHeightAt` (no flow), and a
     box per massing building (by kind) and per site building, from the parish's own footprints.
     `nwParishWorld(parish, E, { tfWaterDepthAt, tfFlowAt, cwColliders })` picks the seams first.
2. `WebXR/shared/nw-drive.js` — the parish mount (three.js passed in, DOM for the card):
   `nwMountPhysics({ three, root, parish, E, seams, tier, reduced, el })` → `{ world, walk(), drive(entry), exitDrive(),
   animate(dt, input), counts() }`: a splash ring for wading, a few props (cones, barrels) and parked cars as instanced
   dynamic bodies that tumble when hit, and the drive mode — a schematic vehicle sized by class (MOTORPOOL's full
   builders stay out of the parish bundle for weight), dented by a vertex offset at the impact, hazard lights on (steady
   under reduced motion), the card opened.
3. The parishes app: the walk goes through `nwAvatarStep` (falls, walls, wading, swimming, flow); the Motor Pool board's
   Drive button (only after the pre-trip, the gate contract as today) starts the drive mode on the parish roads; Q leaves
   the vehicle. Phone tier: fewer props. Reduced motion: no splash animation, steady hazards, props sleep until hit.
4. `tools/check_newton.mjs`: drop from height lands at the right time; no tunnelling through a wall at speed; buoyancy
   holds a swimmer at the surface; a crash above threshold opens the card and below does not; determinism across runs;
   the avatar falls off an edge and is blocked by a wall; the card's station resolves in the catalog; the app mounts it.

## Seams
- Provides `nwWorld({ groundAt, colliders, waterDepthAt, flowAt }) -> { addBody, step(dt), bodies }` and
  `nwAvatarStep(state, input, dt, world) -> state` (`WebXR/shared/nw-physics.js`).
- Provides `nwMountPhysics(opts)` (`WebXR/shared/nw-drive.js`), mounted in `WebXR/parishes/js/app.js`.
- Consumes (guarded, optional): TERRAFORM `tfWaterDepthAt(parish, x, z)`, `tfFlowAt(parish, x, z)`; CITYWORKS
  `cwColliders(parish, chunkKey)`. Pass them to `nwParishWorld(parish, E, { tfWaterDepthAt, tfFlowAt, cwColliders })`.
  The app reads them from `globalThis` today (`globalThis.tfWaterDepthAt?.`), so the coordinator closes the seam by
  importing the modules in `app.js` and passing them in the `seams` object; the fallbacks run until then.
