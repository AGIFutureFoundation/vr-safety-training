# COGNITION — Cognition.X K-12 training and the learning module (`cg`, port 8975)

Brief: `tools/briefs/packs-brief.md` (Shared rules) and the third-wave brief (the reactor loop, COGNITION section).
Base 039f09e (the worktree started on 589f0d8; reset per the brief).

The Cognition.X flow structure (`WebXR/flows/`, `WebXR/shared/flowhub.js`, BAYOU's `by-flow-agent.js`) becomes the K-12
learning module: **unit → lesson → flow** for each K-12 programme.

- `tools/gen_cg_units.mjs` → `WebXR/shared/cg-units.js` (`CG_UNITS`, `CG_FLOWS`, `CG_PROVENANCE`), the generated flows
  `WebXR/flows/cg-*.json` and their `WebXR/flows/index.json` entries. `--check` writes nothing and fails when stale.
  - A unit per K-12 programme in the catalog (four). A lesson per programme station: a BAYOU parish lesson, a field
    lesson (`field-lessons.js`, Redwood's `RW_FIELD_LESSONS`), or the station alone; each carries its band, the band's
    reading ceiling (`BY_BAND_CEILING`; no band → the K-12 station ceiling 11), the Flesch–Kincaid grade of its lines,
    its flow id, a primary `where` and every `places` entry where the idea is taught. Lessons sort by ceiling, then grade.
  - A K-12 station with no flow that has a station node for it gets one: brief → station (back to the brief until passed)
    → check (`checkin`, `params.check` from its field lesson; one station with none uses its first interruption) →
    close, and the **adaptive step**: a missed check takes the fallback edge to `reteach` (a `brief` of the same station,
    `params.reteach` = the station's own first three step titles, one short idea each) and returns to the check.
- `WebXR/shared/cg-runner.js` — the runner: a pure state machine over any flowhub flow (`startRun`/`advance`/
  `evaluateGate`) whose `say()` has `by-flow-agent.js`'s shape, so BAYOU's `byMountFlowAgent` renders it; the GRIOT
  guide comes from `npc-data.js`. A finished lesson reports to SCHOLAR and DEAN, guarded.
- Checker `tools/check_cognition.mjs` (in check_all's list; baseline 2900 ms).

## Cycles

1. Reason: generate units + one flow per K-12 station lacking one; proof = check line 2 "40/40 validate". Act: gen_cg_units.mjs, 24 flows. Observe: 40/40, 24 generated — passed. Then counted brief-only programme flows as not a station flow: 28 generated, still 40/40.
2. Reason: units resolve in reading-ceiling order, adaptive branch returns, runner finishes headlessly; proof = lines 3, 5, 6. Act: cg-runner.js + checker. Observe: 40/40 lessons resolve, 4/4 ordered, 28/28 adaptive, 40/40 finished with SCHOLAR 40 / DEAN 40 — passed; line 7 failed (0/2 mounted, redwood 0 lessons placed).
3. Reason: fix line 7 — a lesson plays at every place its idea is taught (`places`), mount in both worlds; proof = line 7 "2/2, redwood > 0". Act: places in the generator, cgLessonsAt over places, mounts in parishes menu and the Redwood job board. Observe: 2/2 mounted, parishes 12, redwood 9 — passed (186 passed, 0 failed).
4. Reason: the new flows must keep check_flowhub green; proof = its last line. Act: docs/flowhub.md section for the COGNITION flows. Observe: first run failed ("docs/flowhub.md does not describe cg-a-controlled-experiment.json"), after the section "All FlowHub checks pass." — passed. check_imports: "All 945 modules call only what they declare or import."

## Seams

- `cgUnits()` → `CG_UNITS` `[{ id, programme, title, lessons: [{ id, station, title, kind, lessonRef, band, ceiling, grade, flow, where, places }] }]`.
- `cgFlow(id)` → the flowhub flow a lesson names (embedded in `cg-units.js`).
- `cgLessonsAt({ world, parish?, site? })` → lessons taught there, each with `here`.
- `cgFlowRunner(flow, { lesson, character, report, at })` → `{ say, next, phase, run, done, state }` (by-flow-agent's `say()` shape).
- `cgGuideFor(lesson, fallbackId)` → `{ id, name, role }` from GRIOT's roster.
- `cgReport(lesson, run, report)` → `{ lesson, station, unit, flow, status, steps, reteaches, at, where }`; calls
  `report.scholar?.(lessonId, where)` (SCHOLAR's `scStartSession(lessonId, where)` shape) and
  `report.dean?.({ module, lesson, status, at })` (DEAN's module progress), both in try/catch.
- `cgWorldReport(toast)` → the hooks the worlds mount with: `globalThis.scStartSession?.()` and `globalThis.dnModuleProgress?.()`
  — **the coordinator closes these** to SCHOLAR's and DEAN's real exports when they merge (`dnModules()`/`dnApplyModule(world)`
  do not take progress; DEAN's progress call name is assumed as `dnModuleProgress`).
- `cgMountRunner(el, { world, parish?, site?, character?, guide?, report? })` → `{ open(lessonId), lessons, current }`.
  Mounted: parishes app menu `#menu-cognition` (`window.__parishTest.cognition`), Redwood Reach job board `#jb-cognition`
  (`rwApp.cognition`, guide `gr-rw-crew-boss`). The dist bundles are not rebuilt here (the coordinator's bundle pass).
