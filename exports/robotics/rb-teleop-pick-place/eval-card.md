# Eval card — Teleop Pick-and-Place k-NN clone (rx-bc-rb-teleop-pick-place@d9b20015)

Scenario `rb-teleop-pick-place` (beside station `ad-cobot-risk-assessment-and-speed-separation`). Method: behaviour cloning, k-nearest neighbours (k=5) over 8 hand-written features. Trained on `rx-ds-rb-teleop-pick-place` (synthetic: 19 of 40 demonstrations kept, 984 rows). Parameters in `policy.json` (hash `d9b2001591c00551`).

## Results on 60 held-out seeds (7001-7060)

| Policy | Success | Clean (no rule broken) | Mean steps |
|---|---:|---:|---:|
| Random floor | 0% | 53.3% | 400 |
| k-NN clone, filtered demonstrations | **96.7%** | 96.7% | 62.633 |
| k-NN clone, every demonstration | 0% | 0% | 400 |
| Scripted expert (ceiling) | 98.3% | 98.3% | 51.05 |

Gap to the expert (success): 0.016. Source: `docs/evals/colearn.json` (`tools/col_eval.mjs`).

## Invariant violations (counted live over the same 60 seeds)

Rules: `over-force`, `keep-out`. Clone: **755** violation steps in 2 of 60 episodes (3758 steps) — keep-out 755; a held protective stop repeats on every step the policy keeps pushing, so the steps concentrate in the failed episodes. Expert: 1 in 1 of 60 episodes (3063 steps).

## Lineage and audit

ENTERPRISE-3 registry (built in memory by `tools/rb_export.mjs`, `governance.json`): dataset `rx-ds-rb-teleop-pick-place` → policy `rx-bc-rb-teleop-pick-place` → 2 measured evals → deployed (sim) to no site. Audit chain head after this policy's lines: `cbe2586f5f48b037` (14 lines, chain verified).

## Read honestly

- Measured on the simulated scenario only. No hardware run has happened; `docs/bench-protocol.md` says how one would be scored.
- The demonstrations are synthetic (a scripted expert with lapses and noise), so this measures whether the clone copies that expert, not whether it learns from people.
- The scenario is small and discrete; a clone that reaches the expert shows the features name what the expert looks at, not that the task is hard.
