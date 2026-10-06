# ENTERPRISE-3 (`ent3`, port 9033) — the enterprise layer for robot and agent training

Loop 4 (the robotics & enterprise Holodeck). Base 949c0919. Owns `WebXR/shared/ent3-governance.js` (consent
registry, dataset cards, lineage, append-only audit, revoke, fleet / agent registry), `WebXR/shared/ent3-billing.js`
(off-by-default seat-licence adapters: mock, Chargebee, PayPal), `WebXR/instructor/js/governance.js` (the console's
"Data governance" tab), `tools/check_enterprise3.mjs`, `docs/billing-adapters.md`.

## Eval

`node tools/check_enterprise3.mjs` — 13 independent requirement checks (each brief item, the DATAWORKS privacy
rules, the billing constraints), plus a measured sub-eval: stale-marking precision/recall on 200 seeded random
lineage graphs against a ground-truth closure. Before (base 949c0919): **0 passed, 13 failed**.

## Cycles

1. Reason: write the checker first so the same script measures before and after; check = it runs with every module absent. Observed: 0 passed, 13 failed (before).
2. Reason: governance registry (consents, datasets + DATAWORKS cards, policies, evals, deploy, lineage, hash-chained audit, revoke with transitive stale marking); check = checks 1–6. Observed: 6 passed, 7 failed; stale marking precision 1.000 / recall 1.000 (474 stale policies, 200 graphs), deployments flagged 797/797; measured rb-cell-entry seeds 101–108: scripted expert 1.000, lapsing skill 0.5 0.250.
