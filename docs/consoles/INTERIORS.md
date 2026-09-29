# INTERIORS — walk into the buildings (`ix`, port 9001)

Console INTERIORS, the environment wave (`$SP/robotics/interiors-brief.md`, section INTERIORS). Module
`WebXR/shared/ix-interiors.js`; checker `tools/check_interiors.mjs`; mounted in the parishes app (`WebXR/parishes/js/app.js`).

Every room is **generic by kind**. A map's site is a real, named place; the room behind its door is a procedural stand-in for
"a firehouse apparatus bay" or "a clinic", and the room's back-wall sign says so ("a generic room for this kind of site — not a
model of the real building"). No real building's interior is modelled. The SmartCiti.X app's own interiors
(`WebXR/smartcity/js/interiors.js`) are untouched: this is a separate, lighter shell (no citykit, three.js injected) so the
parish bundle does not pull the SmartCiti.X kit.

## Seams (the contract CLASSROOMS and others code against)

```js
import { IX_STYLES, IX_KIND_STYLE, IX_BUDGET, ixStyleFor, ixBuild, ixRegisterDresser, ixWalk, ixNear, ixMountInteriors } from "../../shared/ix-interiors.js";
```

- **How a room is built.** `ixBuild(styleId, { three, tier = "high" | "low", site })` → `room`:
  `{ id, style, group, w, d, h, door: { x, z }, colliders: [{ min, max, kind }], actions: [...], addAction(a), meshes() }`.
  Room-local metres: floor at y = 0, centred on the origin, x across (−w/2…w/2), z from the back wall (−d/2) to the door
  wall (+d/2); the door is in the middle of the +z wall; the learner enters facing −z. The shell is floor, ceiling, four
  walls (each a collider box), a trim band, the door and its exit sign, one instanced run of lamp panels, a hemisphere light
  and (desktop only) one point light; dressing is one InstancedMesh per prop type, each prop footprint a collider (tall ones
  stop the walk). The site's job board hangs beside the door; the site's stations are lit pads (one InstancedMesh) near the door.
- **How an object registers a launch action.** `room.addAction({ id, kind, x, z, r = 1.4, label, run(action, room) })`.
  The mount's `use()` picks the nearest action within its `r`: `exit` leaves, `board` calls the app's `onBoard(site)`,
  `station` calls `onLaunch(stationId, site)`, anything else calls the action's own `run`. `label` is the prompt text
  ("E — <label>").
- **How another console furnishes a style.** `ixRegisterDresser(styleId, ({ three, group, room, site, tier }) => { … })`
  runs after the shell: add meshes to `group` (instanced or merged), register actions with `room.addAction`. A new style
  is a new key in `IX_STYLES` (same shape) plus the site kinds that should open it in `IX_KIND_STYLE`.
- **Budget.** `IX_BUDGET`: ≤ 120 meshes per room *including dressers*, ≤ 3 lights desktop / 1 phone. The phone tier
  (`tier: "low"`) drops the point light and halves the dressing. The shell alone is 16–17 meshes.
- **Mount.** `ixMountInteriors({ three, scene, hide: [objects], tier, onBoard, onLaunch, onToast })` →
  `{ enter(site, outdoorPose), exit() → outdoorPose, inside(), room, pose, walk({ vx, vz }, dt), near(), use(), camera(eye) }`.
  `enter` builds the room for `ixStyleFor(site.kind)` at `IX_ORIGIN` (4 km above the map), hides every object in `hide`
  (remembering its visibility), clears the scene fog; `exit` disposes the room, restores each object's visibility exactly
  (an object that was hidden stays hidden) and the fog, and returns the pose passed to `enter`.
- **Room collider.** `ixWalk(room, pose, input, dt)` is NEWTON's `nwAvatarStep` on a `nwWorld` whose ground is flat and whose
  colliders are the room's walls and props, then clamped inside the shell.
- **The parishes app.** Door spots come from CITYWORKS (`cwSiteBuilding` + `cwDoorOf`), 1.4 m outside the building
  footprint on the road face (so WALKABLE's solid buildings do not swallow them). Near a door spot (≤ 3 m) the prompt is
  "E — go inside: <site>". Inside, the world root (sky, chunks, streets, water, atmosphere, rain) is hidden and none of its
  `update`/`animate` calls run; `np.x/np.z` stay at the door spot, so the outdoor world resumes exactly as it was.
  `window.ixWorld` exposes the mount for a headless test.

## Styles (generic)

union-hall · classroom · apparatus-bay · clinic · workshop · warehouse · plant-room · kitchen · transit-barn · port-shed ·
civic-lobby. All 62 site kinds on the 22 maps map to one of them (`IX_KIND_STYLE`; outdoor kinds such as parks, levees and
wetlands open the field office or shed they would have). CLASSROOMS owns the teaching content (K-12 classrooms, union craft
bays, programme rooms) through `ixRegisterDresser`; these styles stay generic.

## Cycles

1. Reason: smallest end-to-end slice — shell + one style + mount + checker proving enter → walk → launch → exit. Act:
   `ix-interiors.js` (11 styles landed with the shell since they are data on one builder), `check_interiors.mjs`, app mount,
   bundler. Observe: check_interiors 344 passed, 0 failed (every style 16–17 meshes, ≤ 2 lights; 62 kinds → 11 styles; exact
   pose round trip; hidden stays hidden); check_parishes 30924 passed, 0 failed.
2. Reason: TYCOON's rented rooms and shops open into a matching interior, and door spots must stay off WALKABLE's solid
   footprints. Act: `rented-room` and `shop` styles, `ixTycoonStyle(listing, business)` (a business's trade picks kitchen /
   workshop / shop / port-shed), `enter(site, pose, { style, title })`, a rental door 4 m (room) or 7 m (shop) along the site
   door's face in the app; `ixDoorSpot` shared by the app and the checker. Observe: check_interiors 403 passed, 0 failed
   (428 door spots all outside every site footprint; rental doors clear; every business and listing type maps; rented-room
   round trip exact).
