# Eval card — Port Automation Lane k-NN clone (rx-bc-rb-port-gantry@d9e4b963)

Scenario `rb-port-gantry` (beside station `ad-amr-fleet-traffic-and-estop-drill`). Method: behaviour cloning, k-nearest neighbours (k=5) over 14 hand-written features. Trained on `rx-ds-rb-port-gantry` (synthetic: 25 of 40 demonstrations kept, 623 rows). Parameters in `policy.json` (hash `d9e4b96357ba131b`).

## Results on 60 held-out seeds (7001-7060)

| Policy | Success | Clean (no rule broken) | Mean steps |
|---|---:|---:|---:|
| Random floor | 0% | 16.7% | 160 |
| k-NN clone, filtered demonstrations | **100%** | 100% | 27.7 |
| k-NN clone, every demonstration | 100% | 100% | 27.917 |
| Scripted expert (ceiling) | 100% | 100% | 27.8 |

Gap to the expert (success): 0. Source: `docs/evals/colearn.json` (`tools/col_eval.mjs`).

## Invariant violations (counted live over the same 60 seeds)

Rules: `crossing-stop-zone`, `pinned-keep-out`. Clone: **0** violation steps in 0 of 60 episodes (1662 steps). Expert: 0 in 0 of 60 episodes (1668 steps).

## Lineage and audit

ENTERPRISE-3 registry (built in memory by `tools/rb_export.mjs`, `governance.json`): dataset `rx-ds-rb-port-gantry` → policy `rx-bc-rb-port-gantry` → 2 measured evals → deployed (sim) to `rb-site-west-oakland-port-automation`. Audit chain head after this policy's lines: `6badf45ae6cf5ea0` (30 lines, chain verified).

## Read honestly

- Measured on the simulated scenario only. No hardware run has happened; `docs/bench-protocol.md` says how one would be scored.
- The demonstrations are synthetic (a scripted expert with lapses and noise), so this measures whether the clone copies that expert, not whether it learns from people.
- The scenario is small and discrete; a clone that reaches the expert shows the features name what the expert looks at, not that the task is hard.
