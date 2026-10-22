# Eval card — AMR Fleet Routing k-NN clone (rx-bc-rb-amr-fleet-routing@91a7b57c)

Scenario `rb-amr-fleet-routing` (beside station `ad-amr-fleet-traffic-and-estop-drill`). Method: behaviour cloning, k-nearest neighbours (k=5) over 9 hand-written features. Trained on `rx-ds-rb-amr-fleet-routing` (synthetic: 37 of 40 demonstrations kept, 1168 rows). Parameters in `policy.json` (hash `91a7b57c6a817b04`).

## Results on 60 held-out seeds (7001-7060)

| Policy | Success | Clean (no rule broken) | Mean steps |
|---|---:|---:|---:|
| Random floor | 0% | 0% | 120 |
| k-NN clone, filtered demonstrations | **81.7%** | 81.7% | 24.65 |
| k-NN clone, every demonstration | 60% | 60% | 15.5 |
| Scripted expert (ceiling) | 100% | 100% | 13.85 |

Gap to the expert (success): 0.183. Source: `docs/evals/colearn.json` (`tools/col_eval.mjs`).

## Invariant violations (counted live over the same 60 seeds)

Rules: `conflict`, `yield-missed`. Clone: **785** violation steps in 11 of 60 episodes (1479 steps) — conflict 785; a held protective stop repeats on every step the policy keeps pushing, so the steps concentrate in the failed episodes. Expert: 0 in 0 of 60 episodes (831 steps).

## Lineage and audit

ENTERPRISE-3 registry (built in memory by `tools/rb_export.mjs`, `governance.json`): dataset `rx-ds-rb-amr-fleet-routing` → policy `rx-bc-rb-amr-fleet-routing` → 2 measured evals → deployed (sim) to `rb-site-west-oakland-warehouse`, `rb-site-orleans-warehouse`. Audit chain head after this policy's lines: `78e242f01ae930e8` (20 lines, chain verified).

## Read honestly

- Measured on the simulated scenario only. No hardware run has happened; `docs/bench-protocol.md` says how one would be scored.
- The demonstrations are synthetic (a scripted expert with lapses and noise), so this measures whether the clone copies that expert, not whether it learns from people.
- The scenario is small and discrete; a clone that reaches the expert shows the features name what the expert looks at, not that the task is hard.
