# st3-next: the next STRANDS console

Read `docs/consoles/STRANDS-3.md`, `docs/consoles/memory/STRANDS-3.md` and `docs/strands-robots.md` (round 9 section). Run `node tools/check_strands.mjs --quick` first (3 s; the full run is 4–5 min). The rules stay the same:

- simulated only; no hardware, no hosted model, no key; never install torch or lerobot; never claim a `strands_harness` package;
- `ra-*.js`, `dx-*.js`, `col-learn.js` and `tools/arena_eval.mjs` are other consoles';
- held-out seeds only through a committed declaration, and only once. 7241–7300 have been used by this harness (once) and are closed. Round 9's 7301–7360 are ROBOLEARN-10's; do not touch them unless a later declaration names STRANDS as a consumer.

1. **The three protocol-3 scenarios that could not run** (rb-cell-entry, rb-construction-drilling and its hard variant): add simulated robot types for them in `sim_robot.py` (a fenced cell and a drilling rig, generic by kind), export bc clones for them in `ra_export_weights.mjs`, and check parity on **dev seeds** only (the gym parity in the selftest). Do not run them on 7241–7300: that range is closed for this harness.
   - Check: the selftest's gym parity covers 6 scenarios; `check_strands` passes.
2. **MockPolicy** (open since round 7). Use an environment that has strands-robots, never this repo's CI.
3. **CI timing.** `check_strands` has grown (selftest + tanh sample, weights rebuild, dataset build). Measure it on a quiet gate and replace the estimate row in `docs/perf/checkers-baseline.json`, keeping the label rule.
4. **Python-side reader for the page export.** `lerobot_jsonl.py --check` reads the synthetic set's layout; give it a mode that reads the page's one-file bundle (`{ files: { path: text } }`), validates every frame's consent receipt and refuses a human frame without one.
   - Check: a fixture bundle with one good episode and one without a receipt → 1 read, 1 refused.
5. **Station policies that vary with the seed.** Only random and ra-lm@stations vary on the stations; if a later console wants station intervals that mean anything, it needs a policy whose choices depend on the seed, not more seeds.
