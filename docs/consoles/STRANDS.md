# STRANDS (loop 10, round 7)

A Python-first harness for robots on the strands-robots `Policy` / `AgentTool` interface, simulated only. It compares this repository's arena models. Prefix `st`; no port. Base 40d97421; ARENA-2's declaration 8ea01d3c was merged in. Full write-up: `docs/strands-robots.md`.

## What was built

- `tools/ra_bridge.mjs` exposes the arena's gym scenarios over JSONL, one step at a time. Every step makes one `vbGovernor.monitor`, exactly as `raEpisode` does. `physical` is 0 on every reply. Network modules are replaced with throwing counters, and the count is 0. `check` returns the governor's decision, so a physical target is refused as `physical-target`.
- `tools/ra_export_weights.mjs` exports bc, dagger-r1 and dagger-r3 for the four robot scenarios, plus the gym-only small model. That is 13 gzip JSON files, 154 KB, in `robotics/strands/weights/`. Each clone is rebuilt with COLEARN's calls, and its hash must equal `raBuild`'s. `--check` rebuilds the files and compares them.
- `robotics/strands/sim_robot.py` provides `SimRobot(robot_type)`: so100/so101 → pick-and-place, cobot, amr (+hard) and gantry (+hard). It has the Robot tool's four actions and its `tool_spec` shape. Other types are refused, and hardware kwargs are refused with the governor's reason.
- `robotics/strands/policies.py` holds the `Policy` adapters: k-NN clone, small model, expert (run in the bridge), random, and MockPolicy when strands-robots is installed. The base is the real `Policy` when importable, otherwise an identical local ABC, and `POLICY_BASE` says which.
- `robotics/strands/harness.py` holds `create_harness` (this repo's own; no `strands_harness` package exists), a rule-table scenario picker, `compare()`, and a seed gate: dev 1–20, held-out only with both declarations committed, once.
- `robotics/strands/examples/pick_red_cube.py` makes the user's sample runnable. `selftest.py` uses the standard library only. `tools/check_strands.mjs` is in `check_all`, with an estimated baseline row.

## Cycles (reason → act → observe)

1. **The Python side must be the arena, not a look-alike** → features come from the bridge (`colF`), the label is decoded by `colAction`, and the k-NN/softmax maths uses the same operation order → bc, dagger-r1, ra-lm and the expert match `raRun` per seed on all four robot types, seeds 1–5 (`parity_probe.py` in scratch; 16 of 16 on seeds 1–3 in the selftest).
2. **`raBuild` hides the clone model, and `ra-*.js` is ARENA-2's** → the exporter rebuilds the models with the same calls and throws unless `colHash` equals `raBuild(...).hash` → all 12 clone files match.
3. **Hardware must be refused with the governor's reason, not ours** → the bridge's `check` op calls `vbGovernor().check` with a physical target → `physical-target` with the governor's text. A sim command is `allow-sim`. The first try was refused as `task-not-allowed` / `unregistered-policy`, fixed by using the governor's allowlisted task id and a registered policy id.
4. **The held-out seeds belong to ARENA-2** → I watched the heartbeat, merged 8ea01d3c, and committed `docs/evals/strands-declared.json` (e38fa35c) before the run → the run happened once: 2,160 episodes, 97,289 of 97,289 steps governor-checked, physical 0, network 0. The seed gate now refuses a second run.
5. **"No credential read" has to be measured** → the selftest guards `os.environ`, devices, `serial`/`cv2` stubs and sockets, and the bridge gets only `PATH` → reads were PATH plus numpy's and asyncio's own variables. No credential-like name, 0 sockets, 0 device opens.
6. **A checker string mismatch** → `check_strands` looked for "simulated only" case-sensitively, but the doc says "Simulated only" → the match is now case-insensitive, with the same words required.

## Evals

| Eval | Before → after | Source |
|---|---|---|
| Robot types simulated | 0 → 4 kinds (so100/so101 arm, cobot, amr, gantry; 6 scenarios with the hard variants) | `sim_robot.py` `ROBOT_TYPES`; selftest |
| Policies runnable through the `Policy` interface | 0 → 6 (random, bc, dagger-r1, dagger-r3, ra-lm, expert); MockPolicy skipped (not installed) | selftest "6 of 6" |
| Python adapters reproduce `raRun` | 0 → 16 of 16 (model × scenario, seeds 1–3) | selftest |
| Harness compare rows | 0 → 6 dev rows (720 episodes) + 6 held-out rows (2,160 episodes), Wilson 95% | `docs/evals/strands.json` |
| Held-out (7181–7240, once) | expert 1.000 [0.989, 1]; dagger-r3 0.794 [0.750, 0.833]; bc 0.761 [0.714, 0.802]; ra-lm (gym-only) 0.733 [0.685, 0.776]; dagger-r1 0.731 [0.682, 0.774]; random 0.003 [0, 0.016] | `docs/evals/strands.json` heldOut |
| The sample runs | 0 → 1 of 1 (so100, bc, 51 of 51 steps governor-checked) | `examples/pick_red_cube.py`; selftest |
| Physical dispatches | 0 → 0 | bridge replies; strands.json totals |
| Network calls | 0 → 0 (Python sockets 0, bridge 0) | selftest |
| `check_strands` | absent → 21 checks | `node tools/check_strands.mjs` |

The learners' held-out intervals overlap, so no ranking claim is made. The exported ra-lm is the gym-only build, which is not the arena's published weights.

## What is left

See `tools/briefs/next/st-next.md`.
