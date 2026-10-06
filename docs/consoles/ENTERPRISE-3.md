# ENTERPRISE-3 (`ent3`, port 9033) — the enterprise layer for robot and agent training

Loop 4 (the robotics & enterprise Holodeck). Base 949c0919. Owns `WebXR/shared/ent3-governance.js` (consent
registry, dataset cards, lineage, append-only audit, revoke, fleet / agent registry), `WebXR/shared/ent3-billing.js`
(off-by-default seat-licence adapters: mock, Chargebee, PayPal), `WebXR/instructor/js/governance.js` (the console's
"Data governance" tab), `tools/check_enterprise3.mjs`, `docs/billing-adapters.md`.

## Eval

`node tools/check_enterprise3.mjs` — 13 independent requirement checks (each brief item, the DATAWORKS privacy
rules, the billing constraints), plus a measured sub-eval: stale-marking precision/recall on 200 seeded random
lineage graphs against a ground-truth closure. Before (base 949c0919): **0 passed, 13 failed**. After: **13 passed, 0 failed**;
stale marking precision 1.000 / recall 1.000, deployments flagged 797/797; ~0.3 s.

## Cycles

1. Reason: write the checker first so the same script measures before and after; check = it runs with every module absent. Observed: 0 passed, 13 failed (before).
2. Reason: governance registry (consents, datasets + DATAWORKS cards, policies, evals, deploy, lineage, hash-chained audit, revoke with transitive stale marking); check = checks 1–6. Observed: 6 passed, 7 failed; stale marking precision 1.000 / recall 1.000 (474 stale policies, 200 graphs), deployments flagged 797/797; measured rb-cell-entry seeds 101–108: scripted expert 1.000, lapsing skill 0.5 0.250.
3. Reason: billing adapters off by default (mock, Chargebee subscriptions/entitlements, PayPal invoices as request descriptors to the deployment's own proxy, only through a handed-in transport); check = checks 7–10. Observed: 10 passed, 3 failed (console view, docs not yet written); 4 descriptors through the fake transport, 0 global fetches, 10 bad configs refused.
4. Reason: the Data governance tab (consents + revoke, dataset cards, lineage, fleet + deploy, agent tutors, billing status, audit with chain check) in the console and the instructor bundle; check = checks 11–13 + the bundler. Observed: the bundler refused twice (its multi-`const` parser read `n` from a one-line arrow and from a template string) → plain functions; bundle 100 modules; docs/billing-adapters.md → 13 passed, 0 failed.
5. Reason: neighbours must still pass; check = check_console, check_payments, check_dataworks, check_auth, check_imports, check_robotics, check_enterprise. Observed: check_payments 1 failed (its learner-surface rule matched governance.js importing ent3-billing.js) → governance.js allowed as a coordinator surface like billing.js, and ent3-billing.js added to its no-network scan; then all pass (dataworks 59/0, imports 1075 modules, robotics 18/18, enterprise incl. the live pass).
6. Reason: the tab must work in a real browser; check = headless Chromium on 9033 against the bundled console, desktop and 390 px. Observed: sample loaded, chain "16 line(s) intact"; one Revoke tap → 1 deployment flagged STALE, 5 stale lineage/agent rows, chain "22 line(s) intact"; billing "off (not configured)"; 0 page errors, 0 horizontal overflow at 390 px, 0 external requests (console 404s are cinema.js probing media/backgrounds.json, pre-existing).
7. Reason: document the layer where the Guide can find it; check = check_guide. Observed: docs/enterprise.md section 6; gen_guide_kb 1538 chunks; check_guide 268 checks pass.

## Seams

- COLEARN registers its behaviour-cloning policy and tutor with `ent3RegisterDataset({ id, source: "synthetic"|"human", consentIds, ... })`,
  `ent3RegisterPolicy({ id, version, method: "behaviour-cloning-knn"|"behaviour-cloning-mlp"|"bandit-tutor"|"heuristic-tutor", trainedOn, basedOn?, kind? })`
  and `ent3RecordEval(id, { suite, metric, value, n, seeds, baseline, measured: true })`; then `ent3Deploy({ policyId, siteId })` over `RB_SITES`.
- DATAWORKS: `ent3RegisterLocalConsent(orgId)` reads `dxConsent()`; `ent3Revoke` calls `dxRevoke()` when the revoked consent is this device's own.
- Billing: `ent3BillingConfig(authConfig)` reads an optional `billing` block (none ships); `ent3BillingAdapter(config, { transport })`.
- Console: `ent3MountGovernanceView(root, { toast, config })` → `{ render, setConfig }`, mounted in `WebXR/instructor/js/app.js` (`#ent3-root`).

## Left

- `profiles.js` gained a profile key, and every bundle carries profiles.js: only the instructor bundle was rebuilt here. The
  coordinator's full `python3 tools/bundle_webxr.py` rebuilds the other bundles and `WebXR/dist/` (the combined folder is only
  assembled on a full build), so `WebXR/dist/instructor-console.html` does not yet carry the tab.
- `guide-kb.js` was regenerated for the new docs; regenerate once more after the loop's merges.
- Registry export/import between devices (like the cohort file) and a lineage diagram are not built; the lineage is a table.
- The billing proxy itself (the server that maps descriptors to the vendors' APIs with its own credentials) is a deployment's job,
  described, not built. No live Chargebee or PayPal call was made.
- `check_links` not run (the tab's two doc links follow the Cohorts panel's existing `../../docs/` pattern).
