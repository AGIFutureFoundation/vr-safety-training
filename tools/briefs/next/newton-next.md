# NEWTON — next brief

What landed (Packs run): `WebXR/shared/nw-physics.js` (pure physics, the avatar and vehicle steps, the after-a-collision
card), `WebXR/shared/nw-drive.js` (the parish mount), the parishes app's walk and Motor Pool drive mode on it,
`tools/check_newton.mjs` (60 checks). See `docs/consoles/NEWTON.md`.

Next, in order:
1. **Close the seams at the merge.** Import TERRAFORM's `tfWaterDepthAt`, `tfFlowAt`, `tfLitterAt` and CITYWORKS'
   `cwColliders` in `WebXR/parishes/js/app.js` and pass them in `nwMountPhysics({ seams })` instead of the `globalThis`
   reads; re-run `check_newton.mjs` (the seam lines still pass on stubs) and walk a river in Orleans to see the flow.
2. **Rebuild the parishes bundle** (`python3 tools/bundle_webxr.py parishes`) at the gate — NEWTON left the tracked dist
   alone to avoid conflicts; the source page and a locally built dist were both smoke-tested (walk, crash card, swim).
3. **The real vehicle mesh.** The drive mode draws a schematic body by class; when the parish bundle can afford
   `fleet.js` / `equipment.js` / `drivables.js`, build with `dvBuild` and dent the body part instead.
4. **Kerbs and sidewalks.** Once CITYWORKS' kerbs are boxes, give the vehicle a kerb bump (low boxes under a step are
   ignored today) and keep the avatar's step-up at half a metre.
5. **Watercraft helm on this physics** (buoyancy is there): the Motor Pool's watercraft could float on `nwWorld` bodies
   in the parish rivers, with the Regatta's helm handling.
6. **A touch drive layout**: the stick drives and the Use button steps out today; add a Brake button to the touch layer while driving.
7. **Bay World / Redwood mount**: the same `nwParishWorld`-style adapter over their ground functions.
