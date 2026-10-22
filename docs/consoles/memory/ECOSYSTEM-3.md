# ECOSYSTEM-3 memory: what the next console needs to know

## The checker

`check_eco` has ten legs: 1–6 from round 7, 7–9 from round 8, 10 from this round. It prints each leg's wall time in brackets, so a quiet re-measure needs no stopwatch.
- **Legs 7 and 9 open a browser** and serve `WebXR/` in-process on `ECO_PORT` (default 9161; set your own). They read the **committed dist** of the instructor, smartcity and trades pages. After changing `eco-*.js`, `dx-data.js`, either app or the bundle lists, run `python3 tools/bundle_webxr.py instructor smartcity trades` before `check_eco`, and restore with `git checkout WebXR/*/dist` afterwards.
- **Leg 9 is four page loads**: smartcity opted in (then the demo flag flipped in the page), smartcity not opted in, trades opted in (then consent removed in the page), trades on a K-12 surface. The demo and revoke flips are in-page because `dx-data.js` re-reads both live; K-12 is a URL state, so it gets its own load. It is load-sensitive: time it only at low load.
- **Leg 10 runs `tools/eco_fixture.mjs --stdout` in a child process** and requires the committed `docs/ecosystem/bus-fixture.jsonl` byte for byte. A child process matters: `eco-learn.js` keeps a module-level session counter that leg 8 advances, and the fixture's `session_id`s come from it.

## The fixture

- `docs/ecosystem/bus-fixture.jsonl`: line 1 a header, then `{ kind: "audit", entry }` and `{ kind: "message", message }` rows. 109 rows, about 37 KB; the limit is 50 KB (`ECO_FIXTURE_LIMIT`).
- It takes the **first 8 ticks** of the 160-tick seed-3 hive day (`ohHive(...).run(8)`), not a day with `ticksPerDay: 8`: a short `ticksPerDay` compresses all 200 jobs into the first tick and the output balloons (a 1-tick day was 101 KB; the full day is 724 KB).
- The learner is synthetic through injected probes (`collecting`, `signals`, `pseudonym`, `clock`); `dx-data.js`'s stores are never touched. Changing `oh-hive.js`'s event stream, `eco-bus.js`'s shapes or `game.js`'s Session order changes the bytes: regenerate with `node tools/eco_fixture.mjs` and commit, and say so.

## The two wired pages

- **smartcity** (`?sim=<id>`) and **trades** (`?room=<id>`) both: click `#enter-flat`, then `#prebrief-start` through `page.evaluate` (a first run shows the pre-brief), then `window.__smartcityTest.session()` / `window.__tradesTest.session()`.
- The trades bundle carries `dx-data.js` only since this round; it sits after `perf.js` and before `eco-bus.js`, `eco-learn.js`. Leg 9 checks that order in both lists by reading `tools/bundle_webxr.py`; the app files are `"<app>/js/app.js"` there, not `"app.js"`.
- Trades rooms have no `skills` field, so their envelopes carry `skill_ids: []`.

## The rules

- Append new rules at the end of `ECO_RULES`; the first matching rule wins, so appending never moves an earlier row (`check_eco` 2, 2b).
- The three borderline rows (endodontic and four-handed assisting under `patient-safety`, the budget hearing under `civic-advocacy`) were decided **kept** in this round, with the reasons and the conditions that would move them recorded in `docs/ecosystem.md`. Do not re-open them without a new adult-band block in Cognition.X.
- Cognition.X at 47c1820 has no adult-band dental, chairside, infection-prevention or public-finance block; its dental blocks are a school-band peer track.
