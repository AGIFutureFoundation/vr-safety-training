# COGNITION — next brief

State: the K-12 learning module ships (`tools/gen_cg_units.mjs` → `WebXR/shared/cg-units.js`, 28 `WebXR/flows/cg-*.json`),
the runner `WebXR/shared/cg-runner.js` is mounted in the parishes menu (`#menu-cognition`) and on Redwood Reach's job
board (`#jb-cognition`), and `node tools/check_cognition.mjs` gates it (308 checks). Read docs/consoles/COGNITION.md first.

1. **Close the SCHOLAR and DEAN seams.** `cgWorldReport()` calls `globalThis.scStartSession?.(lessonId, where)` and
   `globalThis.dnModuleProgress?.({ module, lesson, status, at })`. When `sc-*` and `dn-modules.js` are in the tree, import
   them in the two worlds and pass them as `report.scholar` / `report.dean`; add a check_cognition line that the real
   functions receive 40 reports.
2. **A GRIOT guide in every map.** Lessons placed through a district's field lessons or site boards have no guide of their
   own (`here.guide` null → "your guide"). Pick the character standing at that site (npc.js / kw-play-data `kwGriotSites`).
3. **Rebuild the bundles.** The dist pages (`WebXR/dist/parishes.html`, `WebXR/dist/redwood.html` and the per-world dist)
   were not rebuilt here; run the bundler at integration and confirm `cg-units.js` (~115 KB) stays inside the page budget.
4. **More worlds.** Summit, Bay World and the Deep have field lessons in `cg-units.js` places; mount `cgMountRunner` there.
5. **Passport.** Record a finished lesson (and whether a re-teach step was used) in the passport so the teacher view can read it.
