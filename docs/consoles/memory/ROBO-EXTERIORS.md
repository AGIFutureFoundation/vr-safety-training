# ROBO-EXTERIORS memory (loop 10, prefix `fx`, port 9094)

- Base 43d3e3f6 (fast-forward). Branch `worktree-agent-a802421ddfb15e23d`.
- Module `WebXR/shared/fx-exteriors.js`: one fixed group per robot site (never through `NP_MASSING_HOOKS`; FACADES keeps
  `details`, PALETTE keeps `material`). Kinds: fabHall (SoMa cell), researchLab (San José cobot), distWarehouse (West Oakland
  and Orleans AMR), portTower (West Oakland gantry yard, east or west of the pad because the crane rails run north–south
  through it), constructionSite (Richland drilling deck).
- Lots: `fxSiteLayout` searches round the pad (north, east, west, south; gaps 4–50 m; slides 0/±12/±24/±36) for a lot (body +
  front yard + side chargers) clear of the pad and warning zone, kept massing (+2 m), trees (4 m), catalog site buildings (+3 m)
  and boards, roads (half-width + kerb + sidewalk + 2 m), water and the map edge, with an open walk from the pad to the door
  (straight or one corner; trees may be walked round). Orleans is the tight one (dense suburb): its warehouse lands 40 m south,
  slid 24 m east.
- Meshes per site: body (vertex colours, flat) + skin (atlas quads); phone = body only (no skin, no texture). Triangles are
  small (36–180 phone, 450–804 balanced, 880–1,296 high); high-only detail through `H()`.
- Atlas: 4×4 cells (tilt-up, roll-up, curtain wall, corrugated, dock door, tower glass, hoarding, cabin, five pictograms,
  truck court, hazard stripes, personnel door), drawn per tier (1024 high, 512 balanced) plus a quarter-size glow mask used
  as `emissiveMap`; `setHour(h)` lights it on ATMOS's `atLightsOn`. No `fillText` anywhere (the checker enforces it).
- App: import beside rb-world; `fxColliders(parish)` joins WALKABLE's collider seam (the buildings are solid); `fxWorld` and
  `fxShot` are `var` (npApplySky runs before the mount); the frame loop's camera honours `fxShot` until the learner walks or
  goes inside; `__parishTest.scene(siteId, shot)` and `?scene=<siteId>:<shot>`.
- Bundler: `fx-exteriors.js` right after `rb-world.js` in the parishes list. The dist was rebuilt for the drive and restored
  (the coordinator rebuilds at integration).
- Checker `tools/check_exteriors.mjs` (in check_all, estimated baseline row). Drive `tools/drive_exteriors_page.mjs` (not in
  the gate).
- `__parishTest.scene` was the THREE.Scene before this console (check_harvest's live leg calls `scene.getObjectByName`); it is
  now the shot function with `traverse`/`getObjectByName`/`getObjectById`/`children` delegated, and the scene is
  `__parishTest.threeScene`. A shot hides `#menu` for a clean frame; walking or going inside ends it.
- Pitfalls met: an `x`-only `break` inside nested loops (use a label); a phone-tier slab in front of a textured door hid it
  on desktop (keep the slab behind the quad); floor quads at local y 0.04 sank under the ground (the building frame starts
  0.15 m under the lot's lowest ground).
- Drive (high, load 18–31): 12 shots, 0 failed, page errors 0, external requests 0; draw calls rise by exactly the kit's
  meshes and triangles by its triangles; night lit on all five maps; kit texture bytes 5,941,931 at high.
