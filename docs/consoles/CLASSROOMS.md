# CLASSROOMS — interiors that teach (`cr`, port 9004)

Rooms where the learning happens, on the parish maps, generic by kind and never a real building's interior. Module
`WebXR/shared/cr-classrooms.js`, mounted in `WebXR/parishes/js/app.js`, proved by `tools/check_classrooms.mjs`.

- **K-12 classrooms** (31, one per school site on 20 maps): a board (a SCHOLAR session: the parish's field, BAYOU or
  ESTUARY lesson, the site's own first), a science bench (that lesson's K-12 lab station), a reading corner (a K-12 station at
  the site) and a learning desk (a COGNITION lesson's K-12 station). Age band "upper primary": every lesson is within its
  reading ceiling (`BY_BAND_CEILING`, 8), measured with the same Flesch–Kincaid yardstick as check_k12. Only `k12-` stations
  and lessons that carry one; no fear words, no digits in labels.
- **Union training centres** (3: Market Street, Mandela Parkway, Japantown): a lobby board with the hall's programmes and
  trades (trade references checked against `tools/unions.json`; a no-partnership note) and five craft bays — electrical,
  pipe, rigging, equipment, hazmat — each with three catalog stations and a PROJECTSIM simulation.
- **Bay Restoration Academy rooms** (2, the Bay Program maps): ACADEMY's first-track stations (`br-*`, all in the catalog)
  and `ps-tidal-channel-dig`, with ACADEMY's no-partnership wording.
- **Robotics bays** (2: San Jose campus labs, West Oakland warehouse row): the robot-cell / AMR / cobot stations and
  ROBOTICS' four games (`rb-teleop-pick-place`, `rb-amr-fleet-routing`, `rb-cobot-zone-setup`, `rb-cell-entry`), launched
  through `globalThis.rbOpenGame` (guarded; a plain toast until the robotics layer is in the build).

## Seams

- `crRoomsFor(parish)` → rooms `{ id, kind, parish, site, name, band?, door, size, fixtures: [{ id, kind, label, at,
  launch: { type: lesson|station|sim|flow|game, id }, more? }] }` — plain data, dependency-free apart from the lesson lists.
- `crRegisterDressers({ ixRegisterDresser, IX_KIND_STYLE }, { parish, launch })` — INTERIORS' shell (`ix-interiors.js`,
  commit 47a549d): one dresser per style a room opens in; it furnishes only its site (an InstancedMesh per fixture kind,
  desks instanced) and registers each fixture with `room.addAction` (plain stations as `kind: "station"` so the mount's
  onLaunch takes them; lessons, sims, flows and games as `cr-<type>` with their own `run`). The app calls it guarded
  (`typeof ixRegisterDresser === "function"`); when it registers anything, the fallback mount goes passive.
- `crMountClassrooms({ three, scene, root, parish, groundAt, launch, toast, passive })` → `{ rooms, tick, near, enter,
  exit, inside, clamp, use, useNear, origin }` — the minimal fallback room with INTERIORS' enter/exit contract (E at a door
  goes in, the world root is hidden, the walls clamp, E at a fixture launches, E at the door wall or the list's button goes
  out to the door). `window.__parishTest.classrooms` exposes it.
- The app's `crLaunch(l, room)`: lesson → `scSession.open`, sim → `psWorld.open(id, site)`, game → `rbOpenGame` (guarded),
  station / flow → the station link.

## Cycles

1. Reason: one K-12 classroom end to end (door, board → real lesson, exit). Act: cr-classrooms.js + app wiring + bundle.
   Observe: live page (orleans, dist) — chip at door, E inside, room built, board click opened SCHOLAR "Sorting Containers at
   the Port", exit restored; no page errors. check_classrooms contract line passes.
2. Reason: every school / union-hall map gets its room within budget and every launch resolves. Act: check_classrooms
   sections 1–5. Observe: `ok — 894 passed, 0 failed`; 31 K-12 · 3 union · 2 Academy · 2 robotics; 205 launches resolved,
   worst room 13 meshes / 156 triangles.
3. Reason: union centre and programme rooms launch simulations live. Act: live test of sf-downtown / bp-strip-marsh-east /
   bay-san-jose. Observe: union electrical bay opened PROJECTSIM `ps-zero-emission-charging-yard`; Academy opened its
   simulation; robotics game button ran the guarded path; all exited; no page errors.
4. Reason: ROBOTICS' game ids are real. Act: ran check_classrooms with rb-robotics-data.js from its branch temporarily in
   the tree. Observe: `213 resolved · 0 ROBOTICS games pending`; file removed again.
5. Reason: furnish INTERIORS' shell per its Seams (47a549d). Act: crRegisterDressers / crDress, guarded app call, passive
   fallback, checker section 7. Observe (ix-interiors.js from 47a549d temporarily in the tree): `38 rooms dressed, 168
   fixture actions, worst 22 meshes (cap 120)`, `ok — 1122 passed, 0 failed`; file removed again.
6. Reason: readable launch labels. Act: simulation names from PS_SIMS, ROBOTICS game titles. Observe: check_classrooms ok,
   K-12 live run unchanged.

LA-COHORTS added the Louisiana lessons board (`crLouisianaBoard`, fixture `lkboard`): every K-12 classroom on a Louisiana map
lists LA-K12's six lessons (those on its map as SCHOLAR lessons, the rest as their K-12 stations); the main board keeps the
parish's own lesson. See `docs/consoles/LA-COHORTS.md`.
