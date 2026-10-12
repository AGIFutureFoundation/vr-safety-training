# ROBO-ARENA → next (robot arena, small model, robotics sets)

Read `docs/consoles/ROBO-ARENA.md` first: the contract, the declaration (`docs/evals/arena-declared.json`), the Evals and
the Left section.

**Seeds.** The range 7121–7180 has been seen once by the arena, and 7001–7120 by earlier rounds. Use a fresh held-out
range, for example 7181–7240. Bump `RA_HELD_OUT`, write the new protocol into a new declaration file, and commit it before
any run on that range. Develop on seeds 1–20 only.

1. **Close the small model's gap on AMR and the port lane.**
   - ra-lm scores 0.417 on AMR against the clone's 0.700, and 0.767 on the port against 1.000.
   - It reads the scene through a linear layer per text bucket. Declare one change, then test it once on the fresh range:
     - a hidden layer, or
     - the clone's per-robot `order` feature (`amr-robots`).
   - Check: a new model id beside `ra-lm`, so the published rows stay; an `arena.json` row; `check_arena` 4–6.
2. **The cobot station scores 0 of 10.** On training data only, find which step's label it misses (compare its argmax
   with the demonstration labels per `stepId`). Then declare a fix.
3. **Stations in the dataset.** Add the three station tasks to `tools/ra_dataset.mjs`, using the suite as `raStations()`
   does. Keep the committed sample inside ROBOEXPORT's 1.5 MB folder cap.
   - Check: `check_arena` 7 and `check_roboexport` 1–2.
4. **A learner's consented takes into the set.**
   - Add a page button that exports the learner's own local takes through `raDsBuild({ consented })`. The takes come from
     `colLocalDemos`'s store, only while `dxCollecting()` holds.
   - Show the per-sample provenance.
   - Check: the refusal already in `check_arena` 7, plus a drive with a fixture store (signed out: 0; opted in: N; revoke:
     0).
5. **If OMEGA-CLAW promoted a model:** show the promoted model per scenario on the arena panel, read-only, from its own
   file.
