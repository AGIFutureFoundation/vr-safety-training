# Repository map

How the SmartCiti.X Holodeck repository is laid out, where the robotics training code lives, and how to run and check it. Counts are read from `docs/investor/platform-summary.json`, which `tools/gen_investor.mjs` computes from the repository itself.

## In numbers

| Measure | Value | Source |
|---|---|---|
| Scored training stations | 742 | `WebXR/smartcity/catalog.json` |
| Programmes | 61 | `WebXR/smartcity/js/curricula.js` |
| Station categories | 20 | `WebXR/smartcity/catalog.json` |
| Standards cited by name | 513 | `tools/standards.json` |
| Content evaluation, corpus mean (of 100) | 95.8 | `tools/eval-content.json` |
| Stations scoring 95 or more | 612 of 742 | `tools/eval-content.json` |
| Checkers in the gate | 161 | `tools/check_all.mjs` |
| Console notes | 176 | `docs/consoles/` |

## Where things are

| Path | What it holds |
|---|---|
| `WebXR/` | The browser and headset apps: `parishes/` (the walkable maps and stations), `smartcity/` (the station catalogue and the shared engine's sims), `holodeck/`, `robotics/` (the programme page), `avatars/`, `data/` (the learner's own data panel), `instructor/`, `dist/` (the flat build the sites serve). |
| `WebXR/shared/` | Shared modules, bundled flat (no import aliases). Robotics: `rb-env.js` (the gym: reset/step/reward, scenarios and their `hard` variants), `rb-robotics-data.js` (sites, scenarios, the cell's control table), `col-learn.js` (k-NN behaviour cloning, held-out evaluation, the ghost), `rt-teleop.js` (the teleoperation pad, pose sources, `rtFollowRig`/`rtFollowCell`), `vb-*.js` (the agent-jobs bridge: governor, ACP-style phases, providers, panel), `dx-*.js` (DATAWORKS: consent, the local store, dataset cards), `ent3-governance.js` (lineage and the hash-chained audit log), `rp-programme-data.js` (the robotics programme). |
| `tools/` | Generators (`gen_*.mjs`), the gate (`check_all.mjs` and one `check_*.mjs` per console), evaluations (`col_eval.mjs`, `ag_eval.mjs`, `eval_content.mjs`), the robotics exporter and report (`rb_export.mjs`, `rb_report.mjs`), the flat bundler (`bundle_webxr.py`), the Unity export (`export_unity.mjs`), the shared TradeQuest export (`export_shared.mjs`). |
| `docs/consoles/` | One note per build console: what it built, its evals before and after, its reason → act → observe cycles, and what is left. `COORDINATOR.md` logs every integration loop. |
| `docs/evals/` | Measured results, for example `colearn.json` (behaviour cloning on held-out seeds, base and hard variants). |
| `docs/perf/` | Agent baselines, checker timings with their load windows, `robot-policies.html` (the static policy evaluation report). |
| `docs/investor/` | Generated investor-facing summaries (`platform-summary.json`, `stations.csv`): every value names its source. |
| `exports/` | `robotics/` (labelled synthetic demonstration datasets, dataset cards, LeRobot/RLDS samples, policy parameters, eval cards, governance), `shared/` (the TradeQuest shared export and its schema), `unity/` (models and manifest). |
| `docs/wiki/` | This wiki. `SmartCitiX-Training-Series.md` is generated from the catalogue by `tools/gen_wiki.mjs`. |

## The robot gym, measured

Behaviour cloning (k-NN on labelled synthetic demonstrations) against a random floor and a scripted expert, success rate on 60 held-out seeds (`docs/evals/colearn.json`).

| Scenario | Random | Clone | Expert |
|---|---|---|---|


Hard variants (a second person or pedestrian with random timing, a wearing bit or a lane obstruction), same protocol:

| Variant | Random | Clone | Expert | Gap to expert |
|---|---|---|---|---|
| `rb-construction-drilling#hard` | 0.000 | 1.000 | 1.000 | 0.000 |
| `rb-port-gantry#hard` | 0.000 | 0.717 | 1.000 | 0.283 |
| `rb-amr-fleet-routing#hard` | 0.000 | 0.050 | 1.000 | 0.950 |

The gap is reported whatever it is. No tuning was done to close it.

## Run it

```
python3 tools/bundle_webxr.py          # the flat build into WebXR/dist
python3 -m http.server 9000 -d WebXR/dist
node tools/check_all.mjs               # the full gate; or one checker: node tools/check_robotrain.mjs
node tools/rb_export.mjs --check       # the robotics export is current
```

The GitHub Actions workflow `.github/workflows/webxr-checks.yml` runs the same gate on every push and fails if any generated file is stale.

## Rules every console follows

- Robots are simulated. The physical path in the agent-jobs bridge is disabled; the governor's e-stop wins every time; no keys, no chain calls.
- Learner data: off by default; adults only, opted in; never in K-12, demo or signed-out sessions; stored on the learner's device only; a revoke deletes it (`docs/learner-data-terms.md`, a draft for counsel).
- No partnership, endorsement, token, price, valuation, customer or hardware claim anywhere in the repository. Standards are cited by name.
- New stations score 95 or more on the content evaluation before they ship.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `e196829d`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
