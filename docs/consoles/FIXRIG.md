# FIXRIG (`fr`, port 9037)

Two bugs found while filming the SmartCiti.X Holodeck robotics material, fixed at source, each with a checker line that fails on the old code.

## 1. Robot rigs (`WebXR/shared/rb-world.js`)

**Cause.** `rbMountRobotics` built its site list as `{ ...s, …, rig: null }`, which overwrote each site's declared `RB_SITES[].rig`. The drawn group was then named `rb-rig-null` and fell through to the arm branch, so every site drew the same small arm. There was no AMR box, gantry or cell fence. `animate` keyed on the group name, so the AMR and gantry swung like arms and never travelled.

**Fix.**
- `s.rig` keeps the declared type, and the drawn group lives in `s.node`.
- `rbDrawRig(T, g, kind, lean, add, mat)` draws each type:
  - cobot: a white arm on a pedestal with a tool flange;
  - AMR: an orange carrier box with a scanner puck and deck;
  - gantry: a beam on two legs with a trolley;
  - cell: a heavier orange industrial arm on a block base, inside the see-through fence.
- An unknown type throws, so a typo can never fall back to a look-alike.
- `rbPoseRig` moves each type: the AMR drives an ellipse, the gantry traverses, and the arms sweep.
- `RB_RIG_TYPES` lists the types.
- The mount's `sites[]` now reports `rig` (the declared type) and `node` (the drawn group's name).

**Budget.** Balanced tier, meshes per site: cobot 7, AMR 7, gantry 8, cell 8. The cap is `RB_MESHES_PER_SITE = 8`. Phone tier: 2–3, within the cap of 3. The robot sites sit outside the parish chunk meshes that the strict engine counts, and `check_parishes` is unchanged.

**Check.** A new `check_robotics` line, "rigs: …", uses a recording three.js stub, so each mesh carries its geometry arguments and colour. It fails if:
- a site's mount reports, or draws, a rig other than the one it declares;
- the type's signature mesh is missing, or a balanced-tier cell has no fence;
- two sites of the same type draw differently, or two different types draw identically (on either tier);
- the AMR or gantry never changes position, or an arm drifts off its base.

Against the old `rb-world.js`, the line fails with `rb-site-west-oakland-port-automation: mount reports rig "rb-rig-null", RB_SITES declares "gantry"`.

## 2. The 3D station page stays on "Loading station…"

**Cause 1, the page error.** In `WebXR/smartcity/js/districts.js`, the ORBIT halls (`robotics-factory`, `robotics-training-centre`, `aerospace-depot`) passed 0x numbers as `tone` into `orbHallFloor` and `orbHallWalls`. Those hand the value to citykit's `pavingFace` and `paintedSteelFace` as `base`, which go to `CanvasGradient.addColorStop`. A browser throws on `'9278618'` (0x8d949a), `'10133668'` and `'9871011'`. So every station in those districts (the `ad-*` robot, cobot and AMR stations, the `lp-*` awareness stations and others) died in `buildStage` after the pre-brief, and the rail stayed on "Loading station…". No checker saw this, because every headless canvas stub accepted any colour stop. The halls now pass CSS colour strings.

**Cause 2, the 404.** `app.js` fetched both `./catalog.json` and `../catalog.json`. On the bundled page (`smartcity/dist/`), the first of these is `smartcity/dist/catalog.json`, which does not exist. `scFlowCatalogUrl(location.pathname)` now picks the one URL that exists:
- the dist page fetches `../catalog.json`;
- the source page fetches `./catalog.json`;
- the flat `WebXR/dist/` build ships no catalog and fetches nothing, so the local roster stands.

**Check.** A new `check_smartcity` line, "station load path", builds every one of the 29 districts through the real `buildStage`, the page's own path. The canvas it uses rejects any gradient stop that is not a CSS colour string. The line also runs `scFlowCatalogUrl` for the source, dist and flat page paths and requires each URL to resolve to a file that exists. Against the old code it fails four times: the three ORBIT districts (with the exact `'9278618'` / `'10133668'` / `'9871011'` values) and the catalog function.

**Headless proof.** Playwright with swiftshader, port 9037. The probe clicks Free explore, then Read & start on the pre-brief.

| Page | Station | Before | After |
|---|---|---|---|
| dist | ad-cobot-risk-assessment-and-speed-separation | page error `addColorStop '10133668'`, stuck on "Loading station…", catalog 404 | step 1/14 `ppe`, 0 page errors, no catalog 404 |
| dist | ad-robot-cell-lockout-and-safe-reentry | page error `addColorStop '9278618'`, stuck, catalog 404 | step 1/14 `ppe`, 0 page errors |
| dist | ad-amr-fleet-traffic-and-estop-drill | (same district as above) | step 1/14 `ppe`, 0 page errors |
| src | the same three | — | step 1/14 `ppe` each, 0 page errors |

A live read of the parishes dist page:
- oak-west-oakland draws `rb-rig-gantry` (8 meshes), which moves z 1.07 → 3.47, and `rb-rig-amr` (7 meshes), which moves (4.82, 0.93) → (2.49, 3.04);
- sf-downtown draws `rb-rig-cell` (8 meshes), whose arm turns 0.31 → 1.17 rad.

Remaining 404s are the shared cinema `backgrounds.json` probe across media folders (`shared/cinema.js`, by design), which is not part of this fix.

## Cycles
1. Reason: `rig: null` in the map overwrites the declared type; check: read `rbMountRobotics` and run `check_robotics`. Observed: 18/0 green, because the budget check reads only one site per map and accepts any movement, so the bug passed.
2. Reason: keep the type in `s.rig`, draw into `s.node` through `rbDrawRig` / `rbPoseRig`, and add a signature-based "rigs" line; check: `check_robotics` on the new code, then with the old `rb-world.js` swapped back in. Observed: new code 19/0, with 4 types drawn distinct and the AMR and gantry travelling. Old code 18/1, failing "declared rig is ignored".
3. Reason: confirm the budgets hold; check: `check_parishes` before and after. Observed: 62985 passed, 0 failed, both times. Per site, balanced is at most 8 meshes and phone at most 3.
4. Reason: reproduce the station hang headless; check: probe dist `?sim=` for 3 stations. Observed: at first no error was seen, because the probe never clicked Free explore or the pre-brief start. After adding those clicks: `addColorStop '9278618'` / `'10133668'` from `pavingFace` ← `orbHallFloor`, the page stuck on "Loading station…", and a 404 for `smartcity/dist/catalog.json`. A non-ORBIT station (ra-hand-brake) reached its first step.
5. Reason: CSS colour strings in the ORBIT halls, plus one catalog URL per page path; check: a new `check_smartcity` "station load path" line with a strict canvas over all districts through `buildStage`. Observed: the first try with the old stub hit stub gaps (`emissive.setHex`, `texture.offset`). After switching to `tools/lib/headless.mjs`'s stub, plus the setHex and offset additions: 29 districts build, and the line is green. With the old `districts.js` and `app.js` swapped in, it fails 4 times with the exact values.
6. Reason: ship it in the bundles and prove it in a browser; check: rebuild the smartcity and parishes dists, then probe dist and src with 3 stations each, plus a live rig read on 2 maps. Observed: 6/6 loads reach step 1/14 with 0 page errors and no catalog 404. Live rigs are gantry, AMR and cell, and all three move. `check_smartcity` reports all 721 pass, `check_districts` reports all 13 scenic, and `check_robot` passes.

## Seams
- `rbDrawRig(T, g, kind, lean, add, mat) → Group`, `rbPoseRig(rig, kind, phase)` and `RB_RIG_TYPES`, in `WebXR/shared/rb-world.js`.
- `rbMountRobotics().sites[]` changed: `rig` is now the declared type (`"amr"` and so on), and the drawn group's name moved to `node`. No caller in the tree read the old `rig` name.
- `scFlowCatalogUrl(pathname) → string | null` in `WebXR/smartcity/js/app.js`.

## Left
- The full bundle also re-emits other apps whose source moved upstream without a rebuild (bayworld, instructor console, redwood). Those were reverted, so this branch carries only the smartcity and parishes dists, which are fresh from source.
- The `backgrounds.json` 404 probe in `shared/cinema.js` remains. It is harmless but shows in headless logs.
- The other headless canvas stubs (`tools/lib/headless.mjs` `installDomStubs`, and `check_smartcity`'s own) still accept any colour stop for station builds. Making them strict across all checkers would catch the same class of bug inside stations, but it needs a full checker run, which is the coordinator's gate.
