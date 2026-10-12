# Robotics exports — the sim-to-real readiness package

Written by `node tools/rb_export.mjs` (console ROBOEXPORT, `docs/consoles/ROBOEXPORT.md`). Six gym scenarios, each with a labelled synthetic demonstration dataset (summary, datasheet and a small LeRobot-/RLDS-style sample), the trained k-NN behaviour-cloning policy's parameters and its eval card; `governance.json` holds the lineage and the hash-chained audit log. Deterministic (fixed timestamps): `tools/check_roboexport.mjs` rebuilds it in memory and compares.

**Every dataset here is SYNTHETIC and says so; every policy is evaluated on the simulated scenario only. No hardware run has happened.** Licence of the simulated data: CC0-1.0.

| Scenario | Station | Demos kept / offered | Random | k-NN clone | Expert | Gap | Clone violation steps (episodes of 60) | Policy id |
|---|---|---:|---:|---:|---:|---:|---:|---|
| [Robot Cell Entry](rb-cell-entry/) | `ad-robot-cell-lockout-and-safe-reentry` | 24 / 40 | 0 | **1** | 1 | 0 | 0 (0) | `rx-bc-rb-cell-entry` |
| [Cobot Safety-Zone Setup](rb-cobot-zone-setup/) | `ad-cobot-risk-assessment-and-speed-separation` | 39 / 40 | 0.05 | **1** | 1 | 0 | 0 (0) | `rx-bc-rb-cobot-zone-setup` |
| [Teleop Pick-and-Place](rb-teleop-pick-place/) | `ad-cobot-risk-assessment-and-speed-separation` | 19 / 40 | 0 | **0.967** | 0.983 | 0.016 | 755 (2) | `rx-bc-rb-teleop-pick-place` |
| [AMR Fleet Routing](rb-amr-fleet-routing/) | `ad-amr-fleet-traffic-and-estop-drill` | 37 / 40 | 0 | **0.817** | 1 | 0.183 | 785 (11) | `rx-bc-rb-amr-fleet-routing` |
| [Ceiling-Drilling Robot Set-Up](rb-construction-drilling/) | `rp-construction-drilling-robot-setup` | 17 / 40 | 0 | **1** | 1 | 0 | 0 (0) | `rx-bc-rb-construction-drilling` |
| [Port Automation Lane](rb-port-gantry/) | `ad-amr-fleet-traffic-and-estop-drill` | 25 / 40 | 0 | **1** | 1 | 0 | 0 (0) | `rx-bc-rb-port-gantry` |

Audit chain head `6badf45ae6cf5ea0` (30 lines, verified). Report: `docs/perf/robot-policies.html` (`node tools/rb_report.mjs`). Bench protocol (method only, no result): `docs/bench-protocol.md`. Learner-data terms (draft for counsel): `docs/learner-data-terms.md`.
