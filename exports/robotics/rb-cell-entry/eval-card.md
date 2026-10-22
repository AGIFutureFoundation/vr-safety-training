# Eval card — Robot Cell Entry k-NN clone (rx-bc-rb-cell-entry@31f876a6)

Scenario `rb-cell-entry` (beside station `ad-robot-cell-lockout-and-safe-reentry`). Method: behaviour cloning, k-nearest neighbours (k=5) over 9 hand-written features. Trained on `rx-ds-rb-cell-entry` (synthetic: 24 of 40 demonstrations kept, 584 rows). Parameters in `policy.json` (hash `31f876a605368d44`).

## Results on 60 held-out seeds (7001-7060)

| Policy | Success | Clean (no rule broken) | Mean steps |
|---|---:|---:|---:|
| Random floor | 0% | 5% | 159.4 |
| k-NN clone, filtered demonstrations | **100%** | 100% | 24.583 |
| k-NN clone, every demonstration | 100% | 100% | 23.583 |
| Scripted expert (ceiling) | 100% | 100% | 22.583 |

Gap to the expert (success): 0. Source: `docs/evals/colearn.json` (`tools/col_eval.mjs`).

## Invariant violations (counted live over the same 60 seeds)

Rules: `enter-live-cell`, `skip-estop-test`, `lockout-order`, `no-verify`, `restart-with-lock`, `left-locked`. Clone: **0** violation steps in 0 of 60 episodes (1475 steps). Expert: 0 in 0 of 60 episodes (1355 steps).

## Lineage and audit

ENTERPRISE-3 registry (built in memory by `tools/rb_export.mjs`, `governance.json`): dataset `rx-ds-rb-cell-entry` → policy `rx-bc-rb-cell-entry` → 2 measured evals → deployed (sim) to `rb-site-soma-robot-cell`. Audit chain head after this policy's lines: `e951f5b2ab674f86` (5 lines, chain verified).

## Read honestly

- Measured on the simulated scenario only. No hardware run has happened; `docs/bench-protocol.md` says how one would be scored.
- The demonstrations are synthetic (a scripted expert with lapses and noise), so this measures whether the clone copies that expert, not whether it learns from people.
- The scenario is small and discrete; a clone that reaches the expert shows the features name what the expert looks at, not that the task is hard.
