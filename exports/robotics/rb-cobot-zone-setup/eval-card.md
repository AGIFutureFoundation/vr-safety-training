# Eval card — Cobot Safety-Zone Setup k-NN clone (rx-bc-rb-cobot-zone-setup@52faed1b)

Scenario `rb-cobot-zone-setup` (beside station `ad-cobot-risk-assessment-and-speed-separation`). Method: behaviour cloning, k-nearest neighbours (k=5) over 5 hand-written features. Trained on `rx-ds-rb-cobot-zone-setup` (synthetic: 39 of 40 demonstrations kept, 241 rows). Parameters in `policy.json` (hash `52faed1b6ea1f4eb`).

## Results on 60 held-out seeds (7001-7060)

| Policy | Success | Clean (no rule broken) | Mean steps |
|---|---:|---:|---:|
| Random floor | 5% | 5% | 4.367 |
| k-NN clone, filtered demonstrations | **100%** | 100% | 6.05 |
| k-NN clone, every demonstration | 100% | 100% | 6.05 |
| Scripted expert (ceiling) | 100% | 100% | 6 |

Gap to the expert (success): 0. Source: `docs/evals/colearn.json` (`tools/col_eval.mjs`).

## Invariant violations (counted live over the same 60 seeds)

Rules: `zone-too-small`, `warn-inside-stop`, `skip-scanner-test`, `skip-estop-test`. Clone: **0** violation steps in 0 of 60 episodes (363 steps). Expert: 0 in 0 of 60 episodes (360 steps).

## Lineage and audit

ENTERPRISE-3 registry (built in memory by `tools/rb_export.mjs`, `governance.json`): dataset `rx-ds-rb-cobot-zone-setup` → policy `rx-bc-rb-cobot-zone-setup` → 2 measured evals → deployed (sim) to `rb-site-san-jose-robotics-lab`. Audit chain head after this policy's lines: `33e97731d607b539` (10 lines, chain verified).

## Read honestly

- Measured on the simulated scenario only. No hardware run has happened; `docs/bench-protocol.md` says how one would be scored.
- The demonstrations are synthetic (a scripted expert with lapses and noise), so this measures whether the clone copies that expert, not whether it learns from people.
- The scenario is small and discrete; a clone that reaches the expert shows the features name what the expert looks at, not that the task is hard.
