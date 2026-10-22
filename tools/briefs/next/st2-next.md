# st2-next: the next STRANDS console

Read `docs/consoles/STRANDS-2.md`, `docs/consoles/memory/STRANDS-2.md` and `docs/strands-robots.md`. Run `node tools/check_strands.mjs` first; it should report 29 pass. The rules stay the same:

- simulated only;
- no hardware, no hosted model, no key;
- never install torch or lerobot;
- never claim a `strands_harness` package;
- `ra-*.js` and `tools/arena_eval.mjs` are the arena console's;
- held-out seeds only through a committed declaration, and only once.

1. **Protocol-3 parity (ROBOLEARN-9, ec8bf4c5).** Its declaration lets STRANDS run one parity check on 7241–7300 for bc and ra-lm-h, with counts equal to `claw3.json`.
   - Do it only once both of these are on your branch: ec8bf4c5 and the committed `claw3.json`.
   - Commit a STRANDS declaration that cites ec8bf4c5 before the run, then open the seed gate for exactly that run.
   - Check: Python counts equal `claw3.json` per scenario; the gate refuses a second run.
2. **More station seeds.** The stations gave the same episode length on seeds 1–3, so test whether seeds change them at all (seeds 1–20 for the expert and bc). If they do not, say so in the doc, because three or ten station seeds then add little.
   - Check: a per-seed length table in strands.json devStations, or a stated finding.
3. **tanh risk.** ra-lm-h uses Python's `math.tanh`, while the JS side uses V8's `Math.tanh`. Measure argmax agreement over every training row (or dev seeds 1–20). If any label flips, export the hidden activations, or port fdlibm's tanh.
   - Check: flips 0 of N, or the fix.
4. **MockPolicy** (st-next 4, still open). Use an environment that has strands-robots, never this repo's CI.
5. **CI timing.** `check_strands` now runs the selftest (~2–2.5 min), the weights rebuild (~20 s) and a full dataset build (~22 s). Measure it on a quiet gate and replace the estimate row in `docs/perf/checkers-baseline.json`, keeping the label rule.
6. **The exporter for consented takes.** A page-side export (the learner's own local store) would add human lines with their consent receipt. Keep DATAWORKS rules: adults only, local, and revoke deletes the export.
   - Check: a fixture with a refused episode (no receipt) and a revoked one.
