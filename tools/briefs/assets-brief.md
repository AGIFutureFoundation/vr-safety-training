# Assets brief — fleet, equipment, tools, signage and driving

Binds every task that upgrades what the learner sees and drives; `station-brief.md`, `interface-brief.md`, `ladder-brief.md` and `loop-brief.md` apply.

## Fleet, equipment and tools
- One shared kit each: `WebXR/shared/fleet.js` (vehicles), `WebXR/shared/equipment.js` (construction and terminal plant), `WebXR/shared/toolkit.js` (hand and power tools, meters, radios). Every builder takes `(parent, x, y, z, opts)` like the kit helpers, paints with `surfaceTexture`/`texturedMat` and canvas decals, uses the real proportions of the class it represents (a Class 8 tractor is about 2.6 m wide and 3.9 m tall to the cab roof; a forklift's mast, counterweight and overhead guard are where they are for a reason), and returns a group with named parts in `userData.parts` (doors, wheels, mast, boom, bucket, outriggers, mirrors, lights) so a station can animate or register them as controls.
- Budget: a builder declares its mesh count; a tractor-trailer ≤ 40 meshes after `mergeStatic`, a car ≤ 18, a forklift ≤ 24, an excavator ≤ 30, a hand tool ≤ 4. `tools/check_fleet.mjs` gates the counts and that every builder renders headlessly and inside its declared footprint.
- Retrofits replace a station's inline vehicle or plant with the kit builder without changing the station's steps, ids, hazards or interactables; a retrofit keeps the station inside its mesh budget and re-runs its drive and screenshot.

## Union signage
- Union logos are trademarks. The repository ships **no reproduction of any union's logo**. It ships `WebXR/shared/signage.js`, which typesets a wordmark sign for each union from `tools/unions.json` (id, full name, local where certain, the union's own colour scheme only where it is public and certain, otherwise the platform palette), plus ANSI Z535-format safety signage (DANGER, WARNING, CAUTION, NOTICE, SAFETY FIRST header formats and colours, generic text) and jobsite boards (permit board, emergency numbers board, OSHA poster placeholder, muster point).
- `WebXR/assets/brand/manifest.json` maps a union id to a logo file a licensed deployment supplies (`assets/brand/<id>.svg|png`); if the file exists the sign shows it, otherwise the wordmark. The repository ships the manifest with every `file` null and a `licence` note that the deployment must hold permission. `docs/signage.md` states this policy.
- The stage places one union sign at every station pad from the station's programme (`curricula.js` → `union` → `tools/unions.json`), so every station carries its union without per-station edits.

## Deep driving training
- A new step kind `drive` in `shared/game.js`: the learner controls a vehicle along a declared path (`step.drive = { path: [[x,z],…], speedBand: [lo, hi], laneWidth, checks: ["mirror-left", "mirror-right", "signal", "horn"] }`), scored continuously like `track` on lane deviation and speed band, with discrete check events (mirror, signal, horn, gear) the learner must trigger at marked points; the vehicle moves visibly along the path; keyboard (WASD/arrows), gamepad (sticks and triggers) and touch controls map to throttle, brake and steer; in headless runs the policy runner drives the path. `check_verify`, `check_interrupts`, `check_input`, the eval and the robot layer learn the kind.
- Driving stations follow the station brief and cite FMCSA 49 CFR 380 Subpart F, 383, 392, 393, 395, 396, the CVSA out-of-service criteria and the state commercial driver handbook as a body. Speed limits and following distances are stated only as the cited handbook states them.

## Hand-back
≤ 250 words as the station brief requires; kit teams add the mesh count per builder and a gallery screenshot.
