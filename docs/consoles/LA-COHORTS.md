# LA-COHORTS: flows, apply games, classroom boards and the programme on Home (`lco`, port 9024)

Brief: `$SP/loop3/brief.md` (LA-COHORTS) under the Shared rules of `packs-brief.md` and the reactor loop of `packs-brief-3.md`.
Facts: `$SP/louisiana/la-facts.md` only (copy at `docs/sources/la-facts.md`). Base 684be2fb. SmartCiti.X Powered by AGI Corp.

The platform has no partnership with any company, agency or union named in the facts file. The K-12 content carries no project
figure, company name or employer's hiring; places are named as places.

## Plan (fixed before code)
1. FlowHub flows and apply games for LA-K12's six lessons, the ESTUARY pattern: `WebXR/shared/lco-la-flows.js` (six two-minute
   games with their own three rounds each, at each lesson's first fixed anchor), `tools/gen_lco_flows.mjs` →
   `WebXR/flows/lk-*.json` + `flows/index.json`, a `docs/flowhub.md` section.
2. CLASSROOMS boards list the Louisiana lessons: `crLessonsOf` takes LA-K12's session lessons, and every K-12 classroom on a
   Louisiana map gets a "Louisiana lessons" board (the lessons that play on that map, then the other lessons' flows).
3. Home links the Louisiana programme page (`tools/gen_home.mjs`: the programme finder and the "Also here" line).
4. Instructor guides a teacher or a union hall can run: `WebXR/shared/lco-cohorts.js` turns LA-PROGRAMME's DEAN templates
   into session-by-session run sheets (prep, timed blocks, roles, debrief, assessment, close-out) and adds a K-12 classroom
   guide for the six lessons with its own DEAN module and class-code set-up; `tools/gen_lco_guides.mjs` →
   `WebXR/louisiana/cohorts.html` and `docs/louisiana-cohorts.md`.
5. `tools/check_la_cohorts.mjs` proves all four; check_flowhub, check_k12, check_classrooms, check_home, check_la_programme,
   check_dean stay green; check_links once at the end.

## Cycles
1. Reason: the six Louisiana lessons get the ESTUARY pair — a flow that validates and a two-minute apply game with rounds of
   its own (the shared mechanics' fixed boards teach cranes and breakers, not marsh or locks). Act: `lco-la-flows.js`,
   `gen_lco_flows.mjs`, six `WebXR/flows/lk-*.json`, a `docs/flowhub.md` section, check_la_cohorts section 1. Observe:
   check_flowhub "All FlowHub checks pass" (15 ✓, 0 ✗); check_la_cohorts ok — 122 checks, 6 flows, 6 games (18 rounds),
   49 session places carry flow + game.
2. Reason: every K-12 classroom on a Louisiana map shows all six Louisiana lessons without taking the main board from the
   parish's own lesson. Act: `crLkLessonsOf` in `crLessonsOf`, `crLouisianaBoard` (lessons on the map first, then the other
   lessons' K-12 stations as flow launches), check_la_cohorts section 2. Observe: check_classrooms ok — 1933 passed, 0 failed
   (410 launches resolved, worst room 13 meshes); check_la_cohorts ok — 275 checks, 12 classrooms on 12 Louisiana maps
   carry the board (21 lesson launches, 51 station launches), none off the Louisiana maps.
3. Reason: Home links the Louisiana programme page (and the guides) on both layouts. Act: `aside.louisiana` / `aside.cohorts`
   in both layouts of `gen_home.mjs` (the flat layout names the pages where they live, as it does for the portal), a
   Louisiana line in the programme finder and the "Also here" line; the programme page links the guides. Observe:
   check_home 1 failed first — `WebXR/dist/index.html is stale`; copied `WebXR/home.html` to `dist/index.html` exactly as
   `bundle_webxr.py build_combined` does → "All homepage and sign-in checks pass" (33 ✓).
4. Reason: a teacher or a union hall can run every DEAN template from a run sheet whose every block launches something real.
   Act: `lco-cohorts.js` (`lcoRunSheets`, `lcoClassroomGuide`, `lcoClassroomModule`, `lcoSetUpClassroom`), `gen_lco_guides.mjs`
   → `WebXR/louisiana/cohorts.html` + `docs/louisiana-cohorts.md`, check_la_cohorts sections 3–5. Observe: FAILED 8 of 2037 —
   my own prep line said "hiring" (the K-12 project rule) and my link regex kept the `?sim=` query; reworded, fixed →
   ok 2037 checks: 31 guides, 147 sessions, 612 timed blocks, every launch resolves, a classroom set up with a class code.
5. Reason: nothing else broke, and the checker is registered. Act: `check_la_cohorts.mjs` in check_all's list (edited, not
   run) and `checkers-baseline.json` (318 ms measured); single checkers. Observe: check_cognition FAILED 1 — `gen_cg_units`
   stale: it generates a flow only for a K-12 station no other flow runs, and the `lk-*` flows now run the six Louisiana
   stations. Regenerated (28 generated flows, 58 embedded), removed the six superseded `cg-lk-*` files, rewrote the COGNITION
   paragraph of `docs/flowhub.md` (the ESTUARY precedent) → check_cognition 558 passed, 0 failed; check_flowhub all pass;
   check_k12 all pass (3217 checks); check_classrooms 1933/0; check_la_programme ok 1618; check_dean 3359/3359;
   check_imports "All 1070 modules call only what they declare or import"; check_storyline all pass; check_la_cohorts ok 2037.
6. Reason: the guides page works in a browser and a teacher can set up a classroom from it. Act: headless Chromium on port
   9024 at 360 px and 1280 px over `louisiana/cohorts.html`, `louisiana/index.html` and Home. Observe: 0 page errors and
   0 px overflow on all five loads; the form made "Class code … · 30 seats · module mod-lco-la-k12 (6 lessons) due
   2026-10-19" at both widths; Home's Louisiana line links `louisiana/index.html` and `louisiana/cohorts.html`; the only 404s
   are the shared Guide's `backgrounds.json` probe on the older pages. Screenshot showed the pathway lines starting
   lower-case → capitalised in the generator, check_la_cohorts ok 2037.
7. Reason: the apply games are played in the world, not only named in the flows. Act: an optional `games` lookup through
   COGNITION's `cgMountRunner` / `cgFlowRunner` (the apply phase's `say()` carries `game`), round-by-round play in
   `byMountFlowAgent` (a miss stays on the round with a nudge; Done after the last round), `lcoGameLookup` passed by the
   parishes app, `lco-la-flows.js` in the parishes bundle list, and `gen_cg_units.mjs` gives each Louisiana lesson its
   places (`lkPlacesOn`) so the runner offers it on the maps. Observe: first drive — the runner on `la-saronic-franklin`
   listed no Louisiana lesson (station-kind lessons had no places) → after the places: headless Chromium on port 9024 played
   "Why Steel Can Float" through brief, station, check, three rounds of "Load to the Mark" and the close, "Lesson complete",
   0 page errors; check_la_cohorts ok 2063 (6 flows played to the end headlessly, rounds in the apply phase, and the plain
   line without the hook); check_cognition 603/0; check_k12, check_flowhub, check_classrooms, check_imports pass.

## Seams
- `WebXR/shared/lco-la-flows.js`: `LCO_APPLY_GAMES`, `LCO_FLOW_OF`, `lcoFlowFor(lesson)`, `lcoApplyGame(id)`, `lcoGameFor(lesson)`,
  `lcoApplySteps(id)` → `[{ board, prompt, options: [{ text, safe }] }]`, `lcoApplyFor(lesson)` → `{ kind: "mini-game", id, game,
  steps, minutes }`, `lcoGameLookup(ref)` → `{ id, title, summary, idea, minutes, steps }` (COGNITION's runner hook),
  `lcoSessionLessons(parishId, opts)` → `lkSessionLessons` plus `flow` and `apply`.
- COGNITION: `cgMountRunner(el, { …, games })` / `cgFlowRunner(flow, { …, games })` — optional; the apply phase's `say()` carries
  `game`, and `byMountFlowAgent` plays its rounds. The parishes app passes `games: lcoGameLookup`.
- CLASSROOMS: `crLkLessonsOf(parish)` (in `crLessonsOf`) and `crLouisianaBoard(parish)` → the `lkboard` fixture
  `{ id: "lkboard", kind: "board", label, at, launch, more }` in every K-12 classroom on a Louisiana map.
- `WebXR/shared/lco-cohorts.js`: `lcoRunSheets(opts)`, `lcoClassroomGuide()`, `lcoClassroomModule()`, `lcoSetUpClassroom({ en, dn },
  { orgName, seats, startDate })`, `lcoGuide(id)` (shapes at the top of the module); page `WebXR/louisiana/cohorts.html`,
  handbook `docs/louisiana-cohorts.md`, both from `node tools/gen_lco_guides.mjs`.
- Home: `aside.louisiana` / `aside.cohorts` in both layouts of `tools/gen_home.mjs` (`#hm-louisiana` in the programme finder).
- Generators to re-run after a change: `gen_lco_flows.mjs` (lessons or games), `gen_cg_units.mjs` (flows), `gen_lco_guides.mjs`
  (templates, lessons or games), `gen_la_programme.mjs`, `gen_home.mjs`.

## Left
- `python3 tools/bundle_webxr.py` at integration: the parishes bundle now carries `lco-la-flows.js` and the app's `games` hook;
  only `WebXR/dist/index.html` was refreshed here (a verbatim copy of `WebXR/home.html`, as the bundler does).
- The Louisiana programme page and the cohort guides are not bundled into `dist/`; the flat Home names them where they live
  in the repository (like the portal and the Safety Campus page).
- The instructor console (`WebXR/instructor/index.html`) does not yet link the cohort guides (it links the Packs page).
- The SCHOLAR session panel does not play apply games; `lcoSessionLessons` carries `flow` and `apply` for it when it does.
