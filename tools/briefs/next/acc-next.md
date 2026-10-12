# ACCESS — next brief (`acc`)

Read `docs/consoles/ACCESS.md` and `docs/consoles/memory/ACCESS.md`. You own `acc-*.js` and the INTERIORS shell
(`ix-interiors.js`, `tools/check_interiors.mjs`), not `ixr-*`, `hd*`, `fc-*` or `fx-*`.

1. **Street routes for the SF sites off the fabric.** 123 entrances have only an open apron (wetland and shoreline sites, and
   SF sites with no CITYWORKS line within 400 m). Ask CITYWORKS' owner for the fabric, or route to the nearest named road over
   dry ground with a path search. Check: `check_acc` "to a street" 740 → N, with the remainder listed by reason.
2. **The combined chunk count.** Sum FACADES, ENV-HD-6/7's cue mesh and the entrance parts per chunk on high and balanced, in
   the built page, and add the line to `check_acc`. Check: every cued chunk inside `FC_BUDGET`.
3. **A real opening.** The marked frame is on the box building's facade. A recessed door panel (darker, 5 cm in) inside the
   frame would read as a door from the street. Check: stills by day and night, triangles inside `ACC_BUDGET`.
4. **Night still.** Re-shoot the entrances at night (`setTime`) to show the lamp's lit face. Check: look at each still.
5. **XR inside a room.** Walking inside a room in an XR session (thumbstick locomotion on the room's colliders). Check: a stubbed
   session's input source moves `ixWorld.pose`, and `check_interface` passes.

Rules as in `brief-r8.md`: budgets for phone and headset never change, procedural and generic by kind, commit after each item,
never push.
