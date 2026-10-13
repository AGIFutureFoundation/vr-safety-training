# ACCESS-2 — next brief (`acc2`)

Read `docs/consoles/ACCESS-2.md`, `docs/consoles/ACCESS.md` and `docs/consoles/memory/ACCESS-2.md`. You own `acc-*.js` and
`ix-interiors.js` (styles and fittings), not `ixr-*`, `hd*`, `fc-*`, `fx-*` or the INTERIORS shell's port room wall (ENV-HD-9's).

1. **The 24 island entrances.** They are wetland and shoreline sites on dry patches of 750–1,020 cells with no street point inside
   (`check_acc` lists them by reason). Either ask CITYWORKS' owner for an access track to each (a `cls: "track"` line on the
   raised bed, which `tfWaterDepthAt` already treats as dry on wetland maps), or build a boardwalk from the door to the nearest
   dry street cell as an ACCESS part (a 1.2 m deck on posts, inside `ACC_BUDGET` and the chunk budget). Check: "to a street"
   839 → N of 863, the remainder listed by reason; `check_acc` passes.
2. **The route you can walk.** `accStepFree` proves a path exists on paper; the learner never sees it. Draw the found path as a
   faint kerb-coloured strip on high only when the HUD's wayfinding is on, or hand it to the HUD as "street: 420 m north" from
   `e.route.len` and the first leg's heading. Check: the HUD line in the built page at a path-routed site (sf-marina).
3. **FACADES in the page versus headless.** The built page's `mass-details-<key>` group reports fewer triangles than
   `fcDetails` headless at ring 0 for the same chunk (Orleans 5,10: 366 in the page). Find which of the two counts the kits
   SMOOTH's pool instances, and make `check_acc` 2b and `drive_acc2` count the same thing. Check: the two numbers agree for one
   chunk, stated in the note.
4. **XR inside a room** (acc-next 5, still open): thumbstick locomotion on the room's colliders in an XR session. Check: a stubbed
   session's input source moves `ixWorld.pose`; `check_interface` passes.
5. **A night still at a path-routed site** (sf-marina or sf-bayview), looked at, beside the Orleans ones in `$SP/loop10/acc2/`.

Rules as in `brief-r9.md`: phone and headset tiers never change, procedural and generic by kind, commit after each item, never
push, no model identifier anywhere.
