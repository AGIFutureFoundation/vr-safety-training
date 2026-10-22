# Eval card — Ceiling-Drilling Robot Set-Up k-NN clone (rx-bc-rb-construction-drilling@2f23e1ab)

Scenario `rb-construction-drilling` (beside station `rp-construction-drilling-robot-setup`). Method: behaviour cloning, k-nearest neighbours (k=5) over 7 hand-written features. Trained on `rx-ds-rb-construction-drilling` (synthetic: 17 of 40 demonstrations kept, 320 rows). Parameters in `policy.json` (hash `2f23e1aba60c630b`).

## Results on 60 held-out seeds (7001-7060)

| Policy | Success | Clean (no rule broken) | Mean steps |
|---|---:|---:|---:|
| Random floor | 0% | 0% | 59.283 |
| k-NN clone, filtered demonstrations | **100%** | 100% | 17.767 |
| k-NN clone, every demonstration | 100% | 100% | 17.767 |
| Scripted expert (ceiling) | 100% | 100% | 17.767 |

Gap to the expert (success): 0. Source: `docs/evals/colearn.json` (`tools/col_eval.mjs`).

## Invariant violations (counted live over the same 60 seeds)

Rules: `person-in-barricade`, `drill-unscanned`, `no-barricade`, `dust-off`, `bit-change-live`. Clone: **0** violation steps in 0 of 60 episodes (1066 steps). Expert: 0 in 0 of 60 episodes (1066 steps).

## Lineage and audit

ENTERPRISE-3 registry (built in memory by `tools/rb_export.mjs`, `governance.json`): dataset `rx-ds-rb-construction-drilling` → policy `rx-bc-rb-construction-drilling` → 2 measured evals → deployed (sim) to `rb-site-richland-drilling-robot`. Audit chain head after this policy's lines: `be5576c2dba2fbc6` (25 lines, chain verified).

## Read honestly

- Measured on the simulated scenario only. No hardware run has happened; `docs/bench-protocol.md` says how one would be scored.
- The demonstrations are synthetic (a scripted expert with lapses and noise), so this measures whether the clone copies that expert, not whether it learns from people.
- The scenario is small and discrete; a clone that reaches the expert shows the features name what the expert looks at, not that the task is hard.
