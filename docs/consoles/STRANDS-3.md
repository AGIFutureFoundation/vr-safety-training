# STRANDS-3 (loop 10, round 9)

The protocol-3 parity check ec8bf4c5 allows, run once; station seed sensitivity on dev seeds 1–20; Python-vs-V8 tanh argmax agreement over every training row; a page-side LeRobot-style exporter for the learner's own consented takes. Simulated only. Prefix `st3`; no port. Base 61d85871 (fast-forwarded and confirmed). Full write-up: `docs/strands-robots.md` (round 9 section). Predecessors: `STRANDS.md` (round 7), `STRANDS-2.md` (round 8).

Honesty, unchanged: no `strands_harness` package exists (`create_harness` is this repository's own); simulated only; no hosted model and no key; strands-robots, torch and lerobot are not installed; every model is trained here on synthetic data; nothing was tuned on 7241–7300.

## What was built

1. **Protocol-3 parity, once** (`docs/evals/strands-declared-r9.json`, `harness.py`). The declaration citing ec8bf4c5 (consumers.STRANDS-2) and claw3.json (3b06415a) was committed first (4e226f3b). `seed_gate` gained a `policies` argument and a `_protocol3_gate`: 7241–7300 open only for bc and ra-lm-h on gym scenarios, every cited file committed and ec8bf4c5 an ancestor of HEAD, and only while `strands.json` has no `protocol3Parity` block. `compare()` writes the block with `parity_vs_claw` (successes, n and rule breaks per (policy, scenario) against `claw3.json` runs[].results[]). Run once (bedb50b7): 12 of 12 equal, 720 episodes, physical 0, network 0. 6 of the protocol's 9 scenarios; the three with no simulated robot type here are recorded as `notRun`.
2. **Station seeds 1–20** (`devStationSeeds`, with `seed_sensitivity` on every station block). Expert and bc × 3 stations × 20 seeds: 0 of 20 seeds change an episode; one length per station (279/278/278), 20 of 20 passes. Stated finding: more station seeds add nothing for these policies.
3. **tanh agreement** (`tools/ra_bridge.mjs` op `js_lm_rows`, `robotics/strands/tanh_agreement.py`). The bridge rebuilds the published ra-lm-h and hands over its 12,818 training rows (raLmTrain's row construction written out, V8's `Math.tanh`), the Python adapter labels them with `math.tanh`: 12,818 of 12,818 agree, 0 flips, training accuracy 0.8744 on both sides. `ra_export_weights.mjs` now writes `labelsByTask`/`pReg`/`taskVectors` for all six gym tasks into the two `@stations` files (hidden weights unchanged, hash-equal), so every row could be labelled. The selftest runs a 40-rows-per-task sample through the cached oracle bridge.
4. **Page-side exporter** (`WebXR/shared/st3-lerobot-takes.js`, mounted on `WebXR/data/index.html`, listed in `tools/bundle_webxr.py`). Builds on `raTakesExport` (DATAWORKS-gated, receipt-checked) and lays the lines out as `lerobot_jsonl.py` does, field for field; one JSON file holds the layout. Nothing sent; the page keeps no copy.

## Cycles (reason → act → observe)

1. **Is the parity run allowed yet?** → `git merge-base --is-ancestor ec8bf4c5 HEAD` true; `claw3.json` committed at 3b06415a; the clause names bc and ra-lm-h, gym, counts equal → write the declaration before touching the gate → gate test: every undeclared case refused, the declared case refused until the declaration was committed.
2. **Run exactly once** → `run_parity.py` after 4e226f3b → 12 of 12 equal in 20.8 s; the gate's reply to a second run: "already run once … never run again or tuned".
3. **Only 6 of 9 scenarios can run here** → say so in the declaration (`notRun`) and the block (`scenariosNotRun`) rather than add robot types on held-out seeds mid-round → `check_strands` prints "6 of 9 protocol scenarios (not run: …)".
4. **Do seeds change a station episode at all?** → 120 episodes, per-seed length table → 0 of 20; the station drill is scripted and these two policies choose the same at every seed. The round-8 suspicion is now a measured finding.
5. **Every training row, not a sample** → first bridge pass gave 12,818 rows (= `m.rows`), but Python could label only 7 tasks (no `labelsByTask` for cell-entry and drilling in the export) → extend the export's `own` list to RA_LM_TASKS, regenerate (only the two `@stations` files change, 383 → 386 KB) → 12,818 of 12,818 compared, 0 flips.
6. **The fixture threw "reading 'id'"** → the debug script showed `dxOptIn` ok but `dxConsent()` null: the consent lives in profile storage over `localStorage`, which Node lacks → a Map-backed `localStorage` for the check's process only → signed out 0; opted in 1 take, 25 frames in 5 files, 1 refused; K-12 0, demo 0; revoke 0.
7. **Check the counts the same way the clause words them** → `check_strands` recomputes successes, n and rule breaks per (policy, scenario) from `claw3.json` and asks the gate for a second run, which must be refused; `--quick` (development only) skips the slow legs so the fast checks run in 3 s.

## Evals

| Eval | Before → after | Source |
|---|---|---|
| Parity on 7241–7300 (bc, ra-lm-h), counts equal claw3.json | not run → 12 of 12 (6 of 9 scenarios), 720 episodes | `docs/evals/strands.json` protocol3Parity; `$SP/loop10/st3/parity.log` |
| Parity on 7301 | not touched → not touched (the gate names 7241–7300 only; 7301–7360 are ROBOLEARN-10's) | `harness.py` PROTOCOL3_SEEDS; gate test |
| Second protocol-3 run | — → refused | `check_strands` "second run refused"; selftest "protocol-3 parity only as declared, once" |
| Seeds that change a station episode (expert, bc; 1–20) | unknown → 0 of 20 | `strands.json` devStationSeeds.seedSensitivity; `$SP/loop10/st3/station_seeds.log` |
| tanh argmax agreement Python vs V8 | 3 seeds × 9 runs (round 8) → 12,818 of 12,818 training rows, 0 flips | `strands.json` tanhAgreement; `$SP/loop10/st3/tanh.log` |
| Page-side export rows valid | 0 → 25 of 25 frames in 5 files (fixture), every frame with the receipt; 1 refused without; revoke → 0 | `check_strands` page-side fixture |
| Physical dispatches | 0 → 0 (all new blocks) | `strands.json` totals; bridge replies |
| Network calls | 0 → 0 | `strands.json` totals; tanhAgreement.network |
| Weights files | 18, 383 KB → 18, 386 KB (two `@stations` files carry six gym tasks; hashes unchanged) | `node tools/ra_export_weights.mjs --check` |
| `check_strands` | 29 → 36 checks, 0 fail (238.5 s on the loaded shared machine; `--quick` 13 checks in 2 s) | `node tools/check_strands.mjs` |
| Selftest | 33 → 35 pass (the gate's protocol-3 check; the tanh sample 360 of 360) | `python3 robotics/strands/selftest.py` |

No ranking claim is made anywhere: the parity rows reproduce the claw's record; the station rows are identical across seeds; the tanh rows compare two implementations of one model.

## What is left

See `tools/briefs/next/st3-next.md`.
