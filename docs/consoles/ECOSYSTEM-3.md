# Console ECOSYSTEM-3 (loop 10, round 9, prefix `eco3`, port 9171)

**Task.** This console did eco2-next items 1–4, in order, for the ecosystem seams with SmartCiti.X and Cognition.X:

1. The cross-repo fixture: a committed JSONL of the adapter's output for the SmartCiti.X brief to use.
2. The trades app wired behind consent, like smartcity.
3. Leg 9 made cheaper and re-timed.
4. The three borderline rows decided and recorded.

**Base.** The worktree was fast-forwarded to `61d85871` (`git merge --ff-only`) and the hash confirmed.

**Sources.** Both sibling clones were only read: SmartCiti.X at `398f287` (its `bus/` modules are imported at run time by `check_eco` legs 4, 8 and 10 when the clone is present) and Cognition.X at `47c1820` (`data/blocks.csv`, read for the borderline decisions). Nothing was written to them or pushed, and no SmartCiti.X code was copied.

## What was built

| Item | Files | Check | Commit |
|---|---|---|---|
| 1. The fixture | `tools/eco_fixture.mjs` (new), `docs/ecosystem/bus-fixture.jsonl` (new, 109 rows, 37.2 KB), `tools/check_eco.mjs` leg 10 and per-leg timing, `docs/ecosystem.md`, `tools/briefs/ecosystem/smartcitix-adopt-bus-adapter.md` item 4 | `check_eco` 10 | `fe962dae` |
| 2. The trades app | `WebXR/trades/js/app.js` (one import, one guarded call before `session.start()`), `tools/bundle_webxr.py` (`dx-data.js`, `eco-bus.js`, `eco-learn.js` in the trades list after `perf.js`), `tools/check_eco.mjs` leg 9 (the trades page as a case, the bundle order of both lists) | `check_eco` 9 | the items 2–3 commit |
| 3. Leg 9 cheaper | `tools/check_eco.mjs` leg 9: four loads across both apps instead of four for one (six after item 2), the demo and revoke flips in-page, a 800x600 viewport, `domcontentloaded`; `docs/perf/checkers-baseline.json` note | `check_eco` 9 | the items 2–3 commit |
| 4. Borderline rows | `docs/ecosystem.md` (a decision table under the round-8 rule table) | `check_eco` 1, 2, 2b (rows unchanged) | the item-4 commit |

## Cycles (reason → act → observe, each with its check)

1. **Base.**
   - Act: `git merge --ff-only 61d85871`; `check_eco` once on the base, on port 9171, for a before.
   - Observe: `61d85871`; 10 of 10 passed in 79 s wall at load 1–6 (the round-8 note's 2 min 46 s was at load 30+).
2. **The round-7 day does not fit in 50 KB.**
   - Reason: the next brief asked for the round-7 hive day in the fixture, under 50 KB.
   - Act: generated it. `ohHiveDay(3, { ticksPerDay: 160 })` gives 2,173 hive events, 724 KB. A shorter day (`ticksPerDay` 8, 3, 2, 1) stayed at 101–125 KB, because a short day compresses all 200 jobs into its first ticks. Switched to the same 160-tick day's first 8 ticks (`ohHive(...).run(8)`): 95 hive events.
   - Observe: 109 rows, 37.2 KB; the header says which slice it is and why. The check is `check_eco` 10's size and header assertions.
3. **A clean module state for a byte-identical regeneration.**
   - Reason: `eco-learn.js` keeps a module-level session counter that leg 8 advances, and the fixture's `session_id`s come from it; an in-process regeneration in leg 10 would differ from a standalone one.
   - Act: leg 10 runs `node tools/eco_fixture.mjs --stdout` as a child process and compares bytes.
   - Observe: byte-identical, twice from the shell and once from the leg. The check is `check_eco` 10.
4. **The fixture through the real modules.**
   - Act: with the read-only clone, every message through SmartCiti.X's real `Bus` (strict) and `extractSignals`, every entry through its `AuditLog`.
   - Observe: 9 of 9 messages accepted and delivered, `extractSignals` usable (9 events, above the floor of 3), 100 of 100 entries appended with the documented keys. The check is `check_eco` 10.
5. **The trades bundle had no consent gate.**
   - Reason: eco2-next said to check that `dx-data.js` is in the trades bundle. It was not; `eco-learn.js` imports it.
   - Act: added `dx-data.js` (it reads `profiles.js`, already first in the list), then `eco-bus.js` and `eco-learn.js`, after `perf.js`; one import and one guarded call in `WebXR/trades/js/app.js`, mirroring the smartcity app. Leg 9 now reads both bundle lists and requires that order before the app file.
   - Observe: the first run of that assertion failed on its own bug: it looked for `"app.js"`, and the bundler writes `"trades/js/app.js"`. Fixed to `"<app>/js/app.js"`. Rebuilt trades: 3,234 KB, 57 modules, and the built page carries `ecoAttachLearner(`, `function dxCollecting` and `__ecoLearnTest`. The check is `check_eco` 9.
6. **Four loads for two apps, not six.**
   - Reason: item 2 added two trades loads to the four smartcity loads, and the brief asked for leg 9 to get cheaper, not dearer.
   - Act: the demo and revoke cases became in-page flips after the opted-in runs (`dx-data.js` re-reads the demo flag and the consent key live, and `eco-learn.js` re-reads the gate at every count), one per opted-in page; K-12 is a URL state, so it keeps its own load, on the lighter trades page; the "not opted in" load stays on smartcity. The viewport went from 1100x760 to 800x600 (SwiftShader frames cost by the pixel) and `goto` waits for `domcontentloaded` (the selector waits do the rest).
   - Observe: four loads cover opted in (both apps), not opted in, demo, K-12 and revoke mid-run, each with steps played after the flip. Times are in the eval table. The check is `check_eco` 9.
7. **Reading the borderline rows against the dataset.**
   - Reason: three rows were "borderline, kept" in round 8 without a recorded decision.
   - Act: read each station's metadata and searched every Cognition.X block naming dental, chairside, infection prevention, fiscal, budget or public finance.
   - Observe: the only dental blocks are a school-band peer track; the only fiscal blocks are a nonprofit's own books (adult) or a school-band fiscal-notes block. All three rows kept, with the reasons and the conditions that would move them in `docs/ecosystem.md`. Rows unchanged: `check_eco` 1, 2, 2b still give 285 of 670 and a byte-identical re-extract.

## Evals (before → after, with sources)

| Eval | Before | After | Source |
|---|---|---|---|
| Fixture rows | none | **109 of 109 valid** (9 telemetry messages from 2 synthetic runs, 100 audit entries: hive 95, governor 3, arena 2); all 9 messages accepted by SmartCiti.X's real Bus and `extractSignals`, all 100 entries by its AuditLog; 37.2 KB of 50; regenerated byte-identical | `check_eco` 10; `node tools/eco_fixture.mjs --stdout \| cmp - docs/ecosystem/bus-fixture.jsonl` |
| Pages wired | 1 (smartcity) | **2** (smartcity, trades) | `check_eco` 9; `tools/bundle_webxr.py` |
| Trades events, opted in | n/a | 2 of 2 held, every one valid (start + 1 step), module id `electrical` | `check_eco` 9 |
| Trades events for K-12 / not opted in / after revoke | n/a | 0 on a K-12 surface after 1 step; 0 after consent removed mid-run (wiped); not opted in 0 in the smartcity load (the same `eco-learn.js` attach path) | `check_eco` 9 |
| Smartcity events | 2 of 2 valid; 0 not opted in, demo, K-12, revoke (4 loads) | 2 of 2 valid; 0 not opted in; 0 once the demo flag is set in the page (wiped) | `check_eco` 9 |
| Leg 9 page loads | 4 (one app) | **4 (two apps)**; 6 after item 2 alone | `tools/check_eco.mjs` |
| Leg 9 time | 96.6 s at load 19 (round-8 shape, this machine); 2 min 46 s in round 8's note | **244.3 s at load 34 (whole checker 270 s wall)** — not a quiet measurement; the baseline note says so | `check_eco` 9's bracketed time; `docs/perf/checkers-baseline.json` |
| Borderline rows decided | 0 of 3 | **3 of 3** (all kept, with conditions) | `docs/ecosystem.md` |
| Stations mapped | 285 of 670 | 285 of 670, round-7/8 rows unchanged | `check_eco` 1, 2, 2b |
| Network calls | 0 | 0 | `check_eco` 5, 8, 10 |
| `check_eco` without the clones, fresh trades dist | n/a | NOCLONE2 | `ECO_SIBLINGS=/nonexistent node tools/check_eco.mjs` after `python3 tools/bundle_webxr.py trades` |
| `check_eco` with and without the clones | 10 of 10 | **11 of 11** with the clones; without (`ECO_SIBLINGS=/nonexistent`): 9 passed, 1 skipped (2b), and leg 9 fails on the committed trades dist with "the dist is stale: run python3 tools/bundle_webxr.py trades", the intended guard, until the coordinator regenerates — passes against a fresh trades dist (see the no-clone row below) | `node tools/check_eco.mjs` |

## Integration

- **The trades app** gains one import and one guarded call (`WebXR/trades/js/app.js`); no other console owns that file this round. The call is inert unless `dxCollecting()` is true.
- **The bundle.** The trades list gains `dx-data.js`, `eco-bus.js`, `eco-learn.js`. The coordinator's regenerate picks them up; the committed trades dist was restored after the drives.
- **Measured in the built pages.** `check_eco` 9 is the combined case for both apps.

## Stills

None this round: the console's work has no scene. Leg 9's page runs are headless.

## What is left

See `tools/briefs/next/eco3-next.md`: a held count the learner can see, the fixture replay as a standalone script, a quiet re-measure of leg 9 (this round's machine sat at load 20–40), Router.X, and widening only on a newer Cognition.X commit.
