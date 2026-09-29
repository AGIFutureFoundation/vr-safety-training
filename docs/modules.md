# Versions and modules — DEAN's control layer (docs/consoles/DEAN.md)

Teachers and admins control, from the instructor console's **Versions & modules** tab, what a class or organisation
sees across every world. Code: `WebXR/shared/dn-modules.js` (store, apply, progress), `WebXR/shared/dn-index.js`
(lesson index and parish frames), `WebXR/instructor/js/dean.js` (the tab). Checker: `node tools/check_dean.mjs`.
Store `vr-dean-v1` through `gtStorage()` (private to the profile, in `GT_PROFILE_KEYS`); no network request.

## 1. Module (a file, `kind: "module"`)

```jsonc
{ "v": 1, "kind": "module", "id": "mod-…", "title": "…",
  "lessons": [{ "kind": "station" | "field" | "parish-lesson", "id": "<catalogue station | K2/parish field lesson | BY_LESSONS id>", "world": "parishes" | "bayworld" | … | null }],
  "due": "YYYY-MM-DD" | null, "requiredScore": 0..100,
  "assign": [{ "classCode": "XXXX-XXXX", "at": "ISO" }], "createdAt": "ISO" }
```

A class code is an organisation-layer cohort's invite code (docs/enterprise.md). Every lesson id must resolve in
`dnLessonIndex()`; an import naming an unknown id is refused with the id.

## 2. Version (`kind: "version"`)

```jsonc
{ "v": 1, "kind": "version", "id": "ver-…", "name": "…", "scope": { "kind": "class" | "org" | "device", "id": "XXXX-XXXX" | null },
  "packs": null | ["<pack id>"], "worlds": null | ["parishes", …], "paths": null | ["union-trades", …], "programmes": null | […],
  "locked": false, "lockedPath": null | "<path id>", "updatedAt": "ISO" }
```

`null` means all on. The effective version (`dnVersion()`) is the device's applied override, else a joined class's,
else the organisation's, else everything on — then intersected with the deployment's `enterprise` block (the
stricter side always wins). A station is hidden only when every pack carrying it is off. A locked version allows
only its `lockedPath` (`dnCanSwitchPath`, which STORYLINE's picker calls). Packs come from PACKS' `pkPacks()` once
registered (`dnUsePacks`), else one per catalogue programme.

## 3. Bundle and apply

`dnExport()` writes `{ v: 1, kind: "dean-bundle", versions, modules }`; `dnImport(text, index)` merges by id. At
world load `dnApplyModule(world, { sites })` returns what glows and what is hidden; the parishes app swaps the
glowing boards' material (no new mesh), drops hidden stations from boards and names the module in the menu.
Progress (`dnProgress(moduleId, classCode)`) reads consented cohort snapshots and SCHOLAR's `scSessions()` (`dnUseSessions`).

## 4. Shared data with SmartCiti.X Trade Craft Academy

`node tools/export_shared.mjs` writes `exports/shared/holodeck-shared.json` and `holodeck-shared.schema.json`
(contract `smartcitix-holodeck-shared`, semver `version`): packs, paths, the module and version schemas, lesson and
station ids by world, every parish/district id with its lat/lng frame (centre and bounds of the approximate fit), and
provenance — including the Trade Craft Academy's procedural street fabric (AUTHORED, not the real grid) that CITYWORKS
reuses. Ids and frames only: no learner data.
