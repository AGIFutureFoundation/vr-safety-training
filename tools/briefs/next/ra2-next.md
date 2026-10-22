# ARENA-2 → next (robot arena, small model, robotics sets)

Read `docs/consoles/ARENA-2.md` first, then `docs/evals/arena-declared-r7.json` (the declaration and amendment 1) and
`docs/evals/arena.json` `retest7`.

**Seeds.** These ranges have been seen:

- 7001–7120 by earlier rounds;
- 7121–7180 by ROBO-ARENA;
- 7181–7240 by ARENA-2, and by STRANDS and CLAW-2 if they ran on it (check their notes).

Use a fresh range, for example 7241–7300. Write a new declaration file and commit it before any run on it; follow
`arena-declared-r7.json`, consumers section included. Develop on seeds 1–20 only, with the stations in training as
declared: gym-only numbers differ.

1. **The promoted model per scenario on the arena panel** (ra-next item 5, not done).
   - If OMEGA-CLAW promoted a model, show it read-only beside each scenario card on `WebXR/robotics/programme.html`.
   - Read it from the claw's own file (`oc-claw-record.js` or its JSON). Never re-run it.
   - Check: `check_arena` 8 is extended to read that file, and `check_claw` still passes.
2. **A `retest7` card on the programme page.**
   - Show the headline (−0.067 [−0.152, 0.018]: no claim), the change's effect (+0.133 [0.028, 0.235]) and the cobot
     station's 0 → 10 of 10, from `arena.json`, as static HTML. No script.
   - Check: `check_arena` 8 compares the card's figures with the file, and `check_robotics_programme` passes.
3. **AMR base.** ra-lm-h scores 0.717 against bc's 0.817 on 7181–7240, an interval that spans 0.
   - Declare one change: either the clone's per-robot `order` / holder features (`amr-robots`, which needs `RA_LM_D` ≥ 19),
     or more hidden units.
   - Test it once on the fresh range, under a new model id beside `ra-lm-h`.
   - Check: an `arena.json` row under a new key, and `check_arena` 9 extended to it.
4. **Station samples.** The committed sample keeps 100 lines per station.
   - If ROBOEXPORT's folder cap changes, or an older sample is retired, commit one whole station episode instead.
   - Check: `check_roboexport` 1–2 and `check_arena` 7.
5. **Consented takes into training.**
   - `raLmTrain({ consented })` already accepts DX episodes.
   - Add a page path that trains ra-lm-h on the learner's own exported takes, on their device only, while
     `dxCollecting()` holds.
   - Report per-sample provenance in the model's `provenance`.
   - Check: a drive with the fixture store (signed out: 0 human rows; opted in: N; revoke: 0) and `check_dataworks`.

Before hand-back: `check_arena`, `check_roboexport`, `check_dataworks`, `check_claw`, `check_newton`, `check_imports` and
`check_parse`, plus `check_interface` if a control changes. Rebuild the bundles before a drive, and restore the committed
dist after it.
