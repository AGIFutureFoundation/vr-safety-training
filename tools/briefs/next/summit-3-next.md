# SUMMIT-4 brief — Sierra Summit, from driven to shipped

Read `docs/consoles/memory/SUMMIT.md`, `SUMMIT-2.md`, then `SUMMIT-3.md`, then `docs/consoles/SUMMIT-3.md`.
Prefix every top-level name `sm`; keep files under `WebXR/summit/` and `WebXR/shared/summit*.js`. Import shared names
as exported (the bundler erases aliases).

## Where it stands (measured, SUMMIT-3)
- **Pass road:** 15 vertices, 6,932 m (`SM_ROAD_LENGTH`), six switchback vertices between the crew yard and the pass
  saddle (`SM_SWITCHBACKS = [4, 10]`); that climb is 9.0 % over 2,330 m (was 22 % over 974 m). The profile is linear per
  section; steepest bed grade outside the tunnel 11.8 % (far-gate leg), held under `SM_ROAD_MAX_GRADE = 0.125` by
  check_summit every 20 m. Tunnel span `[0.7589, 0.8387]`. `smRoadPointAt(d)` and `smRoadGradeAt(t)` are exported.
- **River:** `SM_RIVER_CHANNEL = { width: 22, depth: 4 }`, water `SM_RIVER_SURFACE = 1.6` m over the bed, banks lifted to
  the profile within 2 × width; check_summit holds the surface above the bed and under both banks at 186 samples.
  Ribbon winding fixed (normals up): the road, service road, trails and river now actually render — see memory.
- **Ride:** `SM_RIDES[0]` (`sm-ride-pass-descent`, crew yard → saddle pull-out → tunnel portal, 11 m/s; the pull-out
  quotes `drm-pullout`'s `why` verbatim). `smRideStart/Step/Finish` in state.js; scoring brake-at-pull-out 30, late 10,
  none −25, arrive 10; the `ride` step in `sm-main-04-road` is satisfied only by the pull-out brake. The pickup follows
  the ride, the camera sits at 2.15 m in the cab, drag looks around (`sm.rideLook`), the HUD shows phase, grade, brake
  and score, E sets the brake. Proven in the browser: board, arrive at the pull-out, advice toast, E → `brakeAt:
  "pullout"`, score 30. The arrival was proven headless only (SwiftShader frames are ~1 s and dt is clamped).
- **Atlas:** `bayworld/atlas.html` has a Sierra Summit section (`atlasSummitPlaces/Svg/ListHtml/DeepLinks/Filter`,
  `atlasMountSummit`), hypsometric map from `smHeightAt`, one marker per site (9) and landmark (10), deep links
  `../summit/index.html?site=<id>`; summit-data.js is in the atlas bundle (516 KB, no three.js). check_mapbox green.
- **Headless (SwiftShader 1280×720, relative, not device numbers):** high tier 72k–117k triangles, 226–241 meshes,
  876–2,086 trees, 960–1,070 ms per frame; low tier 58k–81k triangles, 197–201 meshes, 670–940 ms per frame
  (`$SP/holodeck/summit-3/shots/stats.json`). No real phone was attached; the fps question stays open.
- **Checkers:** check_summit 6,145 checks; check_gates, check_mapbox, check_k12 green (see the SUMMIT-3 log).
- Stills: `docs/img/summit/10-pass-road-switchbacks.png`, `11-river-from-the-bank.png`, `12-ride-cab-at-the-pull-out.png`.

## Next phase
1. **Real hardware, still.** Record fps on a mid phone at low/balanced; the levers are unchanged (`SM_IMPOSTOR_RING = 1`,
   24-segment LOD 0). The mesh count rose to ~200–240 with SUMMIT-2's wildlife (99 meshes): if draw calls bind on a
   phone, merge each wildlife group into one geometry.
2. **The pickup's cab.** The ride camera sees the pickup's own hood and cab box as a black wedge (still 12). Either hide
   the cab shell while riding (`smTruck` children by name) or move the eye to the window line; then re-shoot 12.
3. **Ride on the far side.** A second ride from the tunnel portal down to the far gate (the −11.8 % leg) with the
   descent step from `drm-descent`; and the pickup should wait at the yard when the learner is nearby rather than roam.
4. **Bundle weight.** fleet.js is still 330 KB for one pickup; a lighter `smPickup` from kit.js boxes keeps the livery.
5. **Deer on slopes.** `buildWildlife` still sets one `zone.y`; add `groundAt(x, z)` and move a second group below the
   west lookout.
6. **Lessons.** Ten more at the dam, the water plant and the pass yard if SCHOLAR-3 wants thirty; no digits in the text.
7. **Atlas polish.** A "which world" jump link at the top of the atlas, and the Summit page could link back to the
   atlas from its map modal (`../bayworld/atlas.html`; the bundler rewrites `../bayworld/`).
8. **Combined dist.** `WebXR/dist/summit.html` and `WebXR/dist/atlas.html` refresh only on a full bundle run; the
   coordinator's merge run does that.
