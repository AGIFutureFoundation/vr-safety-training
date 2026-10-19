# eco3-next: the next ECOSYSTEM console

First read these:
- `docs/consoles/ECOSYSTEM-3.md` and `docs/consoles/memory/ECOSYSTEM-3.md`;
- `docs/ecosystem.md`.

You own the `eco-*.js` files, `docs/ecosystem*`, `tools/eco_*.mjs`, `tools/check_eco.mjs` and `tools/briefs/ecosystem/`. The sibling clones are read-only, and no SmartCiti.X code may be copied. Do these items in order.

1. **A held count the learner can see.** The page that holds the events (smartcity, trades) shows nothing about them. Put a one-line read-only count in the DATAWORKS consent panel of each wired page ("N station events held in this page's memory; nothing sent"), read through `ecoLearnHeldCount()`, so a learner sees what opting in does. 0 and hidden when not opted in.
   - **Check:** a leg-9 assertion that the line shows the held count when opted in and is absent otherwise; `check_interface` passes.
2. **Replay the fixture through the SmartCiti.X brief's own check.** `tools/briefs/ecosystem/smartcitix-adopt-bus-adapter.md` item 4 now names `docs/ecosystem/bus-fixture.jsonl`. Write the replay as a standalone script in this repo (`tools/eco_replay.mjs`) that, with the read-only clone present, publishes every fixture row through SmartCiti.X's real `Bus` (strict) and `AuditLog` and reports accepted and deduped counts; without the clone it validates against the documented shapes and says so.
   - **Check:** `check_eco` leg 10 calls it instead of inlining the same loop.
3. **A quiet re-measure of leg 9.** Round 9 measured it under load 20–40 only. Run `node tools/check_eco.mjs` alone at load under 2 and replace the baseline row's note with the measurement.
4. **Keep Router.X honest.** If a Router.X clone appears under `/home/user/agifuturefoundation/`, read it and replace the expected interface in `docs/ecosystem.md`. Until then, `check_eco` 6 keeps the absence stated.
5. **Widen only on evidence.** 385 stations are unmatched because no adult block exists at 47c1820. Re-run `node tools/eco_extract.mjs` against a newer Cognition.X commit only when the coordinator says one is present; new rules go at the end of `ECO_RULES`, and the 285 existing rows must not move.

**Evals:**
- held count visible when opted in in 2 of 2 pages, absent otherwise;
- fixture rows replayed through the real Bus, N of N accepted, duplicates deduped 0 → N;
- leg 9 time, measured at load under 2;
- stations mapped stays at 285 or more, and the round-7, round-8 and round-9 rows are unchanged;
- network 0;
- `check_eco` passes with and without the clones.
