# st-next: the next STRANDS console

Read `docs/consoles/STRANDS.md`, `docs/consoles/memory/STRANDS.md` and `docs/strands-robots.md`. Run `node tools/check_strands.mjs` first. It should report 22 pass. The rules stay the same:

- simulated only;
- never connect hardware, use a hosted model or read any key;
- never install torch or lerobot;
- never claim a `strands_harness` package;
- `ra-*.js` is ARENA-2's;
- held-out seeds only through a committed declaration, and only once.

1. **Stations through the bridge.** Load the headless station suite the same way `tools/arena_eval.mjs` `raStations()` does. Map `rb-station-*` to the cobot and AMR robot types, and add station seeds to the gate.
   - Check: the station ra-lm/bc parity against `js_run` on dev seeds 1–3; station rows in `strands.json` dev.
2. **The arena's own ra-lm weights.** Export the station-trained build that the arena publishes (texts with stations), beside the gym-only file. Each file says which build it is.
   - Check: parity 1:1 with the arena rows on dev seeds.
3. **ra-lm-h.** When ARENA-2's `ra-lm-h` lands, add an adapter. It is a hidden layer: tanh(V·[s,1]), then the same bilinear head.
   - Check: parity with `js_run` on dev seeds; never a second held-out run on 7181–7240 (`seed_gate`).
4. **A MockPolicy run when strands-robots is importable.** Use an environment that has it, never this repo's CI. Otherwise keep the scratch check: load only `strands_robots/policies/__init__.py` (stdlib + numpy) from a downloaded wheel by file path, and run it on so100.
   - Check: actions are mapped to move/grip, physical 0, and it is reported as random.
5. **A LeRobot-style JSONL exporter.** Write it only if it needs no new dependency (Parquet does). Follow the field table in `docs/strands-robots.md`.
   - Check: round-trip counts against `exports/robotics/arena/index.json`, leakage 0.
6. **CI timing.** Measure `check_strands` on a quiet gate and replace the 60 s estimate in `docs/perf/checkers-baseline.json`.
