# Console ACCESS

- Console: ACCESS (loop 10, round 8b, prefix `acc`, port 9168)
- Brief: `$SP/loop10/brief-r8b.md` (section ACCESS), under the Rules of `brief-r8.md`, `brief.md`, `brief-r6.md` and `brief-r7.md`
- Base: a10f1ff8 (fast-forward, confirmed)

## What is here
- **External access** (`WebXR/shared/acc-access.js`, new). Every enterable site building (the parishes app's door spots:
  CITYWORKS' door, 1.4 m out on the road face) gets a marked entrance: contrasting jambs and head 4 cm proud of the facade,
  a contrasting sill strip, a lamp housing on the head with an unlit-material lit face (it reads at night without a light),
  and a pictogram wayfinding sign on a post beside the facade (a door, an arrow toward it and, on high, a walking figure; a
  ramp glyph where there is a ramp). No words, no logo, no protected emblem. The clear door width is 1.2 m (the walk collider
  is 0.7 m). A ramp (1:12 at most, 1.2 m wide, landing, two rails) is built wherever the sill differs from the door spot's
  ground by more than 2 cm. Two merged vertex-coloured meshes per map, no texture, no light; high and balanced only — the
  phone tier and a headset browser build nothing.
- **Step-free route** (`accStepFree`): from the door spot to a street point not under any site footprint, straight, round one
  corner, or out from the door first; each leg sampled every metre clear of every site footprint (plus the avatar radius) and
  out of water. Where no street reaches (wetland and shoreline sites, and SF sites outside the authored street fabric) the
  6 m apron straight out from the door must be clear (an open approach).
- **Internal access** (`WebXR/shared/ix-interiors.js`, the INTERIORS shell): four new styles for the kinds that carry an
  exterior cue — `acc-fire-bay` (Fire station apparatus bay), `acc-drop-off-lobby` (Hospital drop-off lobby),
  `acc-classroom-wing` (School classroom wing), `acc-park-pavilion` (Park pavilion). Each has signature fittings, the shell's
  station pads by the door, and two agent spots (`IX_AGENT_SPOTS` → `room.agentSpots`). The sites of those four kinds open
  them through `IX_SITE_STYLE` (`accRegisterSiteStyles`), except a site CLASSROOMS furnishes, which keeps its teaching room.
- **One route grammar.** In and out are the app's one `npUse()`: E, the touch Use button and the pad's A already called it;
  the headset's XR `select` now does too (`accWireXR` in `npXRBegin`). A door spot enters, the room's door leaves, back to
  the exact outdoor pose. **Wayfinding:** inside, the HUD names the room (its label) and the site; outside, the HUD zone now
  leads with the street (`accStreetAt`: nearest named road within 120 m, else "local street").

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| enterable buildings with a marked, lit door and a step-free route | 0 of 863 (no marking existed) | **863 of 863** on 46 maps (740 by a route to a street, 123 by an open apron only); per map N of N on every map | `node tools/check_acc.mjs` ("marked door + step-free route" and "per map" lines) |
| ramps where the sill is raised | — | **0 of 0** needed: no site building's sill differs from its door spot's ground by > 2 cm on any map (measured) | `check_acc` §1 |
| new interior kinds | 0 | **4**: fire bay 17 meshes / 780 tris, drop-off lobby 17 / 720, classroom wing 18 / 984, pavilion 17 / 708 (high; with 4 pads); texture 1.33 MiB (two 512×256 canvas signs) ≤ 24 MiB high and ≤ 3 MiB balanced | `check_acc` §3, `check_interiors` |
| pads reachable from the door | — | **16 of 16** (high), every agent spot and board too, on both tiers (grid search round colliders taller than the step, then NEWTON's walk) | `check_acc` §3 |
| cued sites that open their room and return to the exact pose | — | every site of the four kinds on all 46 maps (CLASSROOMS' sites excepted) | `check_acc` §4 |
| entrance budget | — | 2 meshes a map high and balanced, 0 low; ≤ 360 / 168 triangles an entrance; worst chunk ≤ 4,800 / 2,400; 0 texture, 0 light; headset 0 | `check_acc` §2 |
| in and out by all four inputs | 3 of 4 wired (E, touch Use and pad A called `npUse`; the XR session's select did nothing) | **4 of 4** in the built page: keyboard at the hospital (drop-off lobby), touch at a park (pavilion), gamepad A through a stubbed `getGamepads` at the fire station (fire bay), headset select through a stubbed XR session at the hospital. Each went in and came back out to the exact door-spot pose | `node tools/drive_acc.mjs 9168 … orleans` → "PASS drive_acc: 7 ok, 0 failed, external requests 0, 189 s" |
| entrances in the built page (Orleans, high) | — | 2 meshes, 7,980 triangles, 35 entrances; 12 sites open an ACCESS room | the same drive |
| HUD wayfinding | inside: the room's label; outside: the district only | inside: "Hospital drop-off lobby / generic room · Medical District Hospital Campus"; outside: "Tulane Avenue · the medical district", or "local street · Mid-City" | the same drive |
| page errors | — | **0** | the same drive |
| `check_interiors` · `check_robo_interiors` | 1,061 (approx.) · 302 | **1,085 · 302** pass | each checker |
| `check_walkable` (headless leg) · `check_newton` · `check_interface` | — | **2,720 passed · all pass · 21 passed, 0 failed** (UX_PORT=9168) | each checker |
| `check_imports` · `check_parse` | — | **all 1,142 modules · all 2,727 modules** | each checker |

## Cycles
1. Reason: the four rooms are data on the shell, so land them first and post their ids for LESSONS-X; proof = check_interiors.
   Act: four `IX_STYLES` keys, `IX_FEATURES`, `IX_AGENT_SPOTS`, `room.agentSpots`. Observe: check_interiors 1,085 passed, 0
   failed; 17–18 meshes, 636–912 tris. Committed b98b57fe; ids in the 20:25 heartbeat.
2. Reason: a step-free route needs a measure, not a claim; proof = a probe of every door spot on 46 maps. Act: `accStepFree`
   (spot → nearest street, sampled). Observe: 705 of 863; many "blocked" by their own building.
3. Reason: on several maps a street runs under the site footprint, so the nearest street point is inside the building. Act:
   targets from probes out and along the face, skipping points under any footprint; L-shaped and out-first paths. Observe:
   740 of 863 to a street; the rest water (wetland sites) or "no street within 400 m" (SF sites off the authored fabric).
4. Reason: those sites still have an approach on open ground; say so separately rather than calling it a street route. Act:
   the 6 m apron test, counted apart. Observe: 863 of 863 with a route (740 + 123), reported separately in the checker.
5. Reason: one grammar for in and out; proof = static wiring checks and a stub session. Act: `accWireXR` in `npXRBegin`,
   `ACC_INPUTS`, HUD street, `check_acc` §5. Observe: check_acc 1,467 passed, 0 failed (10 s). Committed 3c88a0ec.
6. Reason: the static wiring proves only that the calls exist; proof = the built page. Act: `drive_acc.mjs`. Observe: the first
   run scored 1 of 4 with 0 page errors. The drive had pressed while `np.near` still held the previous door (the near test
   runs on a tick), and the stubbed XR session's `requestAnimationFrame` never called back, so the frame loop stopped. It had
   also picked a school that CLASSROOMS furnishes, which correctly keeps its classroom. Fixed all three in the drive by
   waiting for the right door, giving the stub a real frame callback and adding `__parishTest.access.styleOf`. The app's own
   code was not changed. Observe: 4 of 4, page errors 0, external requests 0.

## Stills
Stills are in `$SP/loop10/acc/`, from the built page on port 9168 (Orleans, high, by day). I looked at each one.
- `orleans-hospital-entrance-day.jpg`: the marked door, with its sill strip and lit lamp. The pictogram sign stands beside
  it on a post, showing a door, a walking figure and an arrow. The HUD reads "Tulane Avenue · the medical district".
  The white jambs barely show against the engine's dark door box (Left).
- `orleans-acc-drop-off-lobby-inside.jpg`, `orleans-acc-fire-bay-inside.jpg` and `orleans-acc-park-pavilion-inside.jpg`:
  each room seen from just inside the door. Orleans has no school that opens the classroom wing, because CLASSROOMS
  furnishes its schools. So the classroom wing has no still, and it is proven only headlessly.

## Seams
`acc-access.js`: `ACC_DOOR`, `ACC_RAMP`, `ACC_BUDGET`, `ACC_KIND_STYLE`, `accEntrances(parish)`, `accStepFree(parish, e)`,
`accSiteStyles(parish, { skip })`, `accRegisterSiteStyles(ix, parish, { skip })`, `accStreetAt(parish, x, z)`,
`accParts(parish, e, tier)`, `accBuild({ THREE, parish, tier, ua })`, `ACC_INPUTS`, `accWireXR(session, use)`.
`ix-interiors.js`: `IX_AGENT_SPOTS`, `room.agentSpots` `[{ id, x, z, yaw }]`. App: `window.__parishTest.access`
(`entrances()`, `mesh()`, `styled`, `inputs`, `use()`, `xrBegin(session)`, `xrEnd()`).
**For LESSONS-X:** build packs on the four style ids; the room's pads are `room.actions` of kind `station`, the agent figure
stands at `room.agentSpots[0]` / `[1]`.

## Left
- The entrance's door frame is drawn on the facade of the engine's box building; the building has no modelled opening (E at
  the spot enters, as before).
- No ramp is built anywhere because no raised sill exists in the data; the ramp path is exercised only by `accParts` when a
  rise is present (not on a real map).
- The SF sites outside the authored street fabric have an open approach, not a street route (CITYWORKS' fabric would fix it).
- The headset leg drives a stubbed XR session; no real headset was used. Walking inside a room in XR uses the existing room
  camera (no XR locomotion inside rooms was added).
- The white jambs read weakly in front of the engine's dark door box. A darker recessed panel and a wider contrasting frame
  are acc-next item 3.
- There is no night still yet (acc-next item 4).
- The committed `WebXR/dist/parishes.html` and `WebXR/parishes/dist/parishes.html` were rebuilt for the drive and then
  restored. The coordinator's integration rebuild carries the change.
- Entrance triangles sit in their own map mesh; the combined chunk count with FACADES and ENV-HD-6/7 cues was not summed.
