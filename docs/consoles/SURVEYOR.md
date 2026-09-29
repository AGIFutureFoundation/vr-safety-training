# SURVEYOR — review every map and feature, publish the recommended next steps

Console SURVEYOR (prefix `sv`, port 8960), review & neighbourhoods wave. SmartCiti.X · Powered by AGI Corp.
Base 793d16d. Brief: the wave's `review-brief.md` (section SURVEYOR), with the Shared rules of `tools/briefs/packs-brief.md`
and the reactor loop.

## Plan

1. `node tools/eval_worlds.mjs` before (AS_PORT=8960), saved to `docs/evals/platform-review.md`'s "before" line.
2. A walker, `tools/sv_survey.mjs` (one headless browser, one page at a time): each of the 13 parish-engine maps via
   `parishes/parishes.html?parish=<id>` at 1280×720 and 390×844, then Bay World, the Deep, Redwood Reach, Sierra Summit,
   the Packs page, the scoreboard and the instructor console. Per page: page errors, boot ms (navigation start to the
   first WebGL draw), median frame ms over two seconds of rAF, draw calls and triangles per frame (counted at the GL
   calls, the same for every world), what the menu offers (its buttons and mounted sections), whether each first- and
   second-wave feature is reachable (`__parishTest` handles and menu mounts), and a still per map to
   `docs/screenshots/review/<map>.jpg`. Writes JSON to `docs/evals/platform-review.json`.
3. Publish `docs/evals/platform-review.md`: a table per world and map, the ten worst findings with owning module, the
   ranked next steps.
4. Fix the five cheapest high-impact findings, one cycle each, measured with the walker or a single checker.
5. `eval_worlds` after.

Seams: none new. The walker is a review tool, not a gate (never in `check_all`).

## Cycles

Format: reason (the change and the check that proves it) → observed result.

1. Baseline: eval_worlds and the walker over 20 pages / 39 views → eval mean 98 (10 of 18 at 100, 11 findings;
   billing 88); walker 39/39 views without a page error; stills for all 20 pages in docs/screenshots/review/.
2. The parishes test handle repeated `teleport`/`setTime`/`krewe` (a merge artifact: the second teleport skipped the
   streets and ground updates) — keep one key each, add `dean`; check: the walker's `_teleportUpdatesStreets` on
   Orleans → false before (orleans, jefferson, st-bernard), **true** after at 1280 and 390; 0 page errors.
3. Billing: auth-config.json gains the null `levels`, `applePay`, `googlePay` keys (docs/payments.md line updated);
   check: check_payments "All seat-billing checks pass.", check_auth "All account, demo and private-profile checks
   pass.", check_deploy passes; eval billing resolves 1/2 → see cycle 5.
4. sf-bayview's shipyard blurb said "the record read first" (trips the facts regex; means the site's paperwork) →
   "the site file read first"; check: eval sf-bayview facts 56/57 → see cycle 5. Parishes bundle rebuilt
   (`python3 tools/bundle_webxr.py parishes`).
