# Ecosystem loop rules: shared by every brief in this folder

These are briefs for loop agents that a session **with push access** to the named repository could run. Writing them changed nothing in those repositories. They were written from read-only clones: SmartCiti.X at `398f287`, Cognition.X at `47c1820`, and this platform (vr-safety-training) at base `40d97421`. The full seam map is in this repo's `docs/ecosystem.md`.

## Rules (every brief)

- **Base.** Fast-forward to the stated commit (`git merge --ff-only <hash>`; never reset) and confirm the hash. If the head has moved, re-read the cited files before you change anything.
- **Own repository only.** Change only the repository the brief names. Read the other two, never write to them, and cite file and commit for every shape you rely on.
- **Licences.** Cognition.X is Apache-2.0 for code and CC BY 4.0 for content: attribute any extract. SmartCiti.X has no licence file: code against its documented contracts and copy none of its code or data into another repository.
- **Router.X does not exist.** Say so wherever routing comes up. Use only the interface marked "expected, not yet built" in vr-safety-training's `docs/ecosystem.md`.
- **People and data.** Adults who have opted in only. Never K-12, demo or signed-out users. Data stays local; revoking consent deletes it. Affect labels never reach an export (SmartCiti.X ACP-08). Learner ids crossing a seam are pseudonyms.
- **Robots.** Robots are simulated. The VBRIDGE governor checks every step, the physical path stays disabled, and physical dispatches stay at 0.
- **Agents.** Agents are labelled "software agent" and make no model or network call unless an owner configures one.
- **Facts.** No partnership, endorsement, customer, hardware, price, valuation or fundraising claim. Name no union, company or trade body in new content unless the repository already carries it under its own rules (SmartCiti.X `unions/`, Cognition.X `data/unions/`).
- **Commits.** Commit after each item that passes its check. Put the attribution trailer the session gives you in each commit. Put no model identifier anywhere. Push only if the session's owner asked for it.
- **Heartbeats** go at about minutes 15, 35 and 55, as `HH:MM <CONSOLE> done / next / blockers`, stamped with `date -u +%H:%M`.
- **Hand back** within the stated window, even if unfinished. Include the branch and last commit, the files, the checkers run with results, the eval table (before → after, with sources) and what is left.

## The repositories' own checkers

| Repository | Whole suite | Focused |
|---|---|---|
| SmartCiti.X | `./verify_all.sh` (one exit code; it also fails when a README count drifts) | `node bus/test.mjs`, `node bus/test_safeguards.mjs`, `node control/test.mjs`, `node control/test_graph.mjs`, `node stations/test.mjs`, `node lessons/test.mjs`, `node agents/test.mjs`, `node brand/lint.mjs .` |
| Cognition.X | `python3 tests/test_platform.py` (CI: `.github/workflows/validate.yml`) | `python3 tools/validate_blocks.py`, `python3 tools/validate_standards.py`, rebuilds such as `python3 tools/build_flow_hub.py` and `python3 tools/build_trades.py` (CI fails on drift) |
| vr-safety-training | single checkers only, never `tools/check_all.mjs` in a loop | `node tools/check_eco.mjs`, `node tools/check_parse.mjs`, `node tools/check_imports.mjs` |

## Seams (from vr-safety-training `docs/ecosystem.md`)

| Seam | SmartCiti.X | Cognition.X | vr-safety-training |
|---|---|---|---|
| Bus and telemetry | `bus/bus.mjs`, `bus/telemetry.mjs`, `bus/audit.mjs` | none | `WebXR/shared/eco-bus.js` |
| Stations and blocks | `stations/registry/stations.json` | `data/blocks.csv` (`grade`, `transfer_check`) | `WebXR/shared/eco-blocks.js`, `docs/ecosystem/blocks-match.json` |
| Learner profile and skill graph | `control/lpa.mjs`, `control/graph.mjs` | themes × bands | `competency.js`, `rp-programme-data.js` |
| Agents | `agents/registry/*.json` | `apps/flow-hub/` | `oh-hive-data.js`, `agents/` |
| Router.X | none | none | expected interface only, **not yet built** |
