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

## What landed
- `check_newton.mjs` — 60 checks: a 10 m drop lands at 1.433 s (free fall 1.428 s, inside a fixed step); bodies up to
  400 m/s never pass a 0.1 m wall; a vehicle at 40 m/s stops at a wall; a swimmer's feet settle at the float line
  (1.3 m under the surface, the head above it), a barrel rides the waterline; the breath meter drains swimming, shows the
  head-for-the-shore cue, never fails, refills ashore; wading runs at 0.55 of walking pace with the splash cue; a still
  swimmer drifts downstream on the flow; the avatar walks off a ledge, falls and lands, stops at a wall and slides along
  it, steps over a kerb; a crash at 9 m/s opens the card, a bump at 4 m/s does not, a sideswipe is a bump; cones tumble,
  a parked car is a crash; elastic hits keep momentum; sleeping bodies wake; two runs match bit for bit; 10 maps, every
  site building (109/109) boxed, pads dry; the seams are read first when passed.
- Browser smoke (source page and a locally built dist, port 8982): Orleans and the Marina load with no page error, the
  walk moves through the physics, a drive into a building opens the card with the station link and the hazards on,
  "Scene secured" clears it, Q/Use steps out, a teleport into the river starts afloat with the meter showing.
- Props per site: 4 cones, 2 barrels, 2 parked cars (phone tier 2, 1, 1), three instanced meshes in all.

## Seams
- Provides `nwWorld({ groundAt, colliders, waterDepthAt, flowAt }) -> { addBody, step(dt), bodies }` and
  `nwAvatarStep(state, input, dt, world) -> state` (`WebXR/shared/nw-physics.js`).
- Provides `nwMountPhysics(opts)` (`WebXR/shared/nw-drive.js`), mounted in `WebXR/parishes/js/app.js`.
- Consumes (guarded, optional): TERRAFORM `tfWaterDepthAt(parish, x, z)`, `tfFlowAt(parish, x, z)`; CITYWORKS
  `cwColliders(parish, chunkKey)`. Pass them to `nwParishWorld(parish, E, { tfWaterDepthAt, tfFlowAt, cwColliders })`.
  The app reads them from `globalThis` today (`globalThis.tfWaterDepthAt?.`), so the coordinator closes the seam by
  importing the modules in `app.js` and passing them in the `seams` object; the fallbacks run until then.
