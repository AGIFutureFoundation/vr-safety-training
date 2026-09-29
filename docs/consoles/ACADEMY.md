# ACADEMY — the Bay Restoration Academy (`ea`, port 8997)

Brief: `$SP/restoration/wave-brief.md` (ACADEMY) under the Shared rules of `packs-brief.md` and the reactor loop of
`packs-brief-3.md`. Facts: `$SP/epa/epa-2026-facts.md` only (copied in the repo at `docs/sources/epa-2026-facts.md`).
Base 9914455. Prefix `ea`, port 8997.

## Plan
- `WebXR/shared/ea-academy.js` (data + pure functions): nine project tracks (the eight named EPA projects + Clean Ports),
  each work type a verbatim facts-file phrase → crafts (tools/unions.json ids) → stations / simulations / K-12 lessons;
  five role pathways per track, each ending in an existing competency made earnable in-module by a capstone; the
  competency matrix; 45 DEAN module templates with instructor guides; `eaSetUpCohort` on org.js + dn-modules.js;
  `eaCredentials` on competency.js (Open Badges, xAPI). UNIONSIMS' `us-` ids resolve only when they exist in the tree.
- `tools/gen_academy.mjs` → `WebXR/bayprogram/academy.html` (design system, Home chip, Guide) and `docs/bay-academy.md`.
- The hub (`tools/gen_bayprogram.mjs`) links the page.
- `tools/check_academy.mjs` (in check_all's list and the baseline).

## Seams
- `eaTracks()`, `eaTrack(id)`, `eaResolve(track, { stationIds, simIds })`, `eaPathways(track, opts)`, `eaMatrix(opts)`,
  `eaTemplates(opts)` (DEAN module docs + instructor guides), `eaSetUpCohort({ en, dn, stationIds, simIds }, { orgName, trackId, role, seats, startDate })`,
  `eaCredentials(records)` — in `WebXR/shared/ea-academy.js`.
- UNIONSIMS: `tools/gen_academy.mjs`' `eaTreeIds()` reads PROJECTSIM's `PS_SIMS` and, guarded, `WebXR/shared/us-unionsims-data.js`
  (any exported array of `{ id, steps }`). Re-run `node tools/gen_academy.mjs` after the merge and the pending ids link themselves.

## Cycles
1. Reason: one data module traces every track work type → craft → station/sim/K-12 → credential; check: a smoke run of `eaPathways` over all 9 tracks. Observed: 45 pathways resolve, but 17 end in a competency with 0 of its stations in the module (e.g. entry → core-trenching 0/2) — not earnable.
2. Reason: a capstone (the competency's own stations, Academy stations first) plus a per-track credential preference makes each credential earnable in-module; check: smoke `overlap + capstone >= require` for all 45. Observed: 45/45 earnable (e.g. cleanports appr → energy-transition 4/5 + 1 capstone; bacwa entry → core-confined-space 1/3 + 2).
3. Reason: generator (page + handbook) and `check_academy` prove facts, matrix, pathways, DEAN templates, cohort, credentials, words; check: `check_academy` ok. Observed: FAILED 2 — price scan read "$8" out of "$82 Million" (capital M) and later my own "not a price" wording.
4. Reason: case-insensitive money match and reworded seat line; check: `check_academy`, `check_bayprogram`, `check_dean`, `check_imports`. Observed: **check_academy ok — 1354 checks · 9 tracks · 45 pathways · 45 DEAN templates · 126 matrix links · 24 UNIONSIMS ids pending**; check_bayprogram PASS (hub regenerated with the Academy link); check_dean 1810/1810; check_imports "All 1005 modules call only what they declare or import."
