# STRANDS memory

- Prefix `st`; no port. Owns `robotics/strands/`, `tools/ra_bridge.mjs`, `tools/ra_export_weights.mjs`, `tools/check_strands.mjs`, `docs/strands-robots.md` and `docs/evals/strands*.json`. `ra-*.js` belongs to ARENA-2: read it, never edit it.
- strands-robots 0.3.8 facts (read from the wheel in `$SP/loop10/st/src`, never installed or vendored):
  - `Policy` is an ABC with `get_actions` (async), `set_robot_state_keys` and `provider_name`.
  - `MockPolicy` returns 8 × `uniform(-0.1, 0.1)` per key.
  - `Robot(AgentTool)` needs lerobot. Its tool_spec `action` enum is execute/start/status/stop.
  - Importing `strands_robots.policies` runs the package `__init__`, which catches its own ImportError.
  - There is no `strands_harness` anywhere.
- Bridge ops: hello, reset, step, summary, check, js_run, bye.
  - `step` accepts an env action, `{label, params}` (decoded by `colAction`), `{moves}` or `{expert: true}`.
  - The episode loop mirrors `raEpisode` (cap at `maxSteps + 1` steps).
  - `js_run` is the parity oracle. For ra-lm it uses texts without stations, which matches the exported build.
- Parity tips: send features from the bridge, never recompute them in Python.
  - k-NN: sum per feature in order; top-k by (s, i) with a stable argsort; vote `(w||1)/(sqrt(s)+0.05)`; ties broken by label ascending.
  - ra-lm: strict `>` argmax over the mask in order; params sorted by (z, i), top 5.
  - Rounding: JS `Math.round` is half-up, so use `floor(x*1000+0.5)/1000` in Python, not `round`.
- Seeds: dev 1–20. Held-out 7181–7240 ran ONCE (heldOut block in `strands.json`); `seed_gate` refuses another run. Declarations: arena 8ea01d3c, strands e38fa35c.
- Timing: the dev compare takes ~30 s, the held-out ~137 s, the selftest ~29 s, the weights `--check` ~14 s.
- Gotcha: a worktree-isolated shell refuses heredocs and compound `cd` commands near git. Write scripts with the Write tool into `$SP/loop10/st/` and run them plainly.
