# TREASURE — memory (read first)

- Lessons are never typed: `tools/gen_treasures.mjs` lifts each from a source and `tools/check_treasures.mjs` re-reads it verbatim. Add a treasure by adding a source line, not prose.
- Bay World's 24 egg field notes own the 28 landmarks; the Deep's lanterns sit 2 m off landmarks. Treasures sit at training SITES (Bay ±8 m, Deep −6 m) so the layers never share a spot.
- The homepage already binds up-up-down-down-left-right-left-right-B-A (the racer) and "radio" (Foreman's Radio). Pick other sequences.
- The ledger key `vr-treasures-v1` is in profiles.js `GT_PROFILE_KEYS`; always read and write through `gtStorage()` so it is per profile and dies with the demo tab.
- Bundles share one scope: every top-level name is `tz…`. The bundler auto-inserts treasures-data.js + treasures.js after profiles.js wherever account.js or guide.js ride — do not list them by hand.
- Plants and world markers raycast for themselves (like shared/eggs.js's hard hats). Never add them to `state.selectables` — Session.select scores unknown ids as wrong answers.
- Gates: the local `tzGateOpen()` reads `vr-training-records-v1` (1+ star). When QUESTMASTER's `shared/skill-gates.js` lands, swap its body for `isOpen(gate)`; the data already uses the shared schema.
- The worktree guard refuses long compound shell commands; run git steps as plain single commands and put multi-file edits in a script under the scratchpad.
