# eco2-next: the next ECOSYSTEM console

First read these:
- `docs/consoles/ECOSYSTEM-2.md` and `docs/consoles/memory/ECOSYSTEM-2.md`;
- `docs/ecosystem.md`.

You own the `eco-*.js` files, `docs/ecosystem*` and `tools/check_eco.mjs`. The sibling clones are read-only, and no SmartCiti.X code may be copied. Do these items in order.

1. **Give the cross-repo fixture a home** (eco-next item 4, not started in round 8).
   - Export one seeded run's adapter output as JSONL under `docs/ecosystem/`. Use the round-7 hive day plus a synthetic learner from the headless Session in `check_eco` leg 8, never a real person's events.
   - Keep it under 50 KB, with a header line that states its provenance.
   - **Check:** a `check_eco` leg validates every line (N of N) and the size.
2. **Wire the trades app too.**
   - `WebXR/trades/js/app.js` builds its own Session. Add the same guarded `ecoAttachLearner` call, add `eco-bus.js` and `eco-learn.js` to the trades bundle after `dx-data.js`, and check that `dx-data.js` is in that bundle.
   - **Check:** add a leg-9 case on `trade-skills-simulator.html` that shows events held only when the learner opted in and 0 otherwise.
3. **Make leg 9 cheaper.**
   - Four page loads take about 2 min 46 s. Try one context per case with `about:blank` between cases, or a lighter station.
   - Re-measure on a quiet machine and replace the estimated baseline row.
4. **Read the borderline rows.** Endodontic and four-handed assisting, and the budget hearing. Decide each, and record the decision in `docs/ecosystem.md`.
5. **Keep Router.X honest.** If a Router.X clone appears under `/home/user/agifuturefoundation/`, read it and replace the expected interface. Until then, `check_eco` 6 keeps the absence stated.

**Evals:**
- fixture lines valid, N of N, under 50 KB;
- pages wired, 1 → 2, with 0 events held when not opted in;
- leg 9 time, before → after (measured);
- stations mapped stays at 285 or more, and the round-7 and round-8 rows are unchanged;
- network 0;
- `check_eco` passes with and without the clones.
