# Console DEAN

- **Team:** DEAN — teachers and admins control versions, lessons and modules across all worlds
- **Brief:** `$SP/packs/packs-brief-2.md` (DEAN) under `packs-brief.md`'s Shared rules and seam shapes
- **Branch:** own worktree, reset to 4713545 (the tree started at 589f0d8)
- **Prefix:** `dn` · port 8988 · temp files under `$SP/packs/dean/`
- **Memory:** `docs/consoles/memory/DEAN.md` · next brief: `tools/briefs/next/dean-next.md`

## Plan (written before code)

1. `WebXR/shared/dn-modules.js` — pure core, one store `vr-dean-v1` through `gtStorage()` (listed in
   `GT_PROFILE_KEYS`): **versions** (which packs, worlds, paths, programmes are on; scope class code or organisation;
   `locked` + `lockedPath`), **modules** (ordered lesson refs `{ kind: station | field | parish-lesson, id, world }`,
   a due date, a required score, assigned class codes), file export/import with a validator, and the apply step
   (`dnApplyVersion(world)`, `dnApplyModule(world)`) that intersects the version with the deployment's `enterprise`
   block (`worlds`/`programmes`, file-only, always the stricter side). Progress per learner joins org.js's consented
   cohort snapshots (class code = the cohort's invite code) with SCHOLAR's `scSessions()` when registered.
2. `WebXR/shared/dn-index.js` — the lesson index across worlds: catalogue programme stations, parish/district site
   stations, K-12 field lessons (`K2_FIELD_LESSONS`, every parish's `fieldLessons`) and BAYOU's parish lessons
   (`BY_LESSONS`); plus the parish/district frames (`npToGeo` centre, `npBounds`) for the shared export.
3. The instructor console gains a **Versions & modules** tab (`WebXR/instructor/js/dean.js`, `el()`/`textContent`
   only): a version editor, a lock, a module builder with lesson search, assign to a class code, export/import
   file, and a progress grid per learner.
4. Parishes app: at load, the active module's lessons glow on their boards (the board material swapped — no new
   mesh), stations of switched-off packs leave the boards, world ways to switched-off worlds refuse, the menu shows
   the module and its due date.
5. `tools/export_shared.mjs` → `exports/shared/holodeck-shared.json` + its schema, versioned; provenance lists the
   Trade Craft Academy procedural street fabric we reuse.
6. `docs/modules.md` (the schema), `tools/check_dean.mjs` (round trip, ids resolve, version hides exactly, lock
   blocks a path switch, shared export validates).

## Seams

- **Exported by DEAN** (`WebXR/shared/dn-modules.js`):
  - `dnVersion() -> { id, name, scope, packs|null, worlds|null, paths|null, programmes|null, locked, lockedPath }` — the
    effective version on this device (the class's, else the organisation's, else everything on), already intersected
    with the enterprise block.
  - `dnModules() -> [{ v, kind: "module", id, title, lessons: [{ kind, id, world }], due, requiredScore, assign: [{ classCode, at }] }]`.
  - `dnApplyModule(world) -> { world, allowed, version, modules, glow: { stations, lessons, sites }, hidden: { worlds, packs, stations } }`.
  - `dnCanSwitchPath(pathId) -> boolean` — STORYLINE's path picker calls this before `stChosenPath` changes.
- **Consumed, guarded** (registered by the host, never imported, so this tree runs without them):
  - PACKS `pkPacks()` → `dnUsePacks(pkPacks)`; until registered, `dnPacks()` derives one pack per catalogue programme
    (`source: "fallback-programmes"`).
  - SCHOLAR `scSessions()` → `dnUseSessions(scSessions)`; assumed shape `[{ lessonId, learner, classCode, stars, score, at }]`.
  - STORYLINE path ids: `union-trades, k12, first-responders, un-training, disaster-relief, teachers, roam` (`DN_PATHS`).
- **Mounted:** the instructor console's Versions & modules tab; the parishes app (board glow, hidden stations/ways,
  menu line).

## Log
- 02:00 UTC · plan, dn-modules/dn-index, export_shared, check_dean 531/531, instructor tab, parishes mount, bundler lists; eval before mean 98 · this commit · next: hand-back
