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
