# BAYOU next — mount the parish lessons in the parishes app

Read `docs/consoles/BAYOU.md` and `docs/consoles/memory/BAYOU.md` first.

1. **Mount in the parishes app.** `WebXR/parishes/js/app.js`: at each site, list `byLessonsFor(parish, site)`; a GRIOT
   character (`grMount("parish:<id>")`, the lesson's `guide`) opens `byMountFlowAgent(panel, byFlowAgent(flow, { lesson,
   character, kiosks: <KREWE kiosk ids on device> }))`. Bundle `links.js`, `side-game-mechanics.js`,
   `by-parish-lessons.js`, `by-flow-agent.js` (after `passport.js`) in the parishes list of `tools/bundle_webxr.py`.
2. **KREWE reconcile.** Five lessons name `kw-sandbag-relay`, `kw-pump-startup`, `kw-floodgate-closeout`,
   `kw-container-sort`, `kw-ferry-lineup`; confirm KREWE's final ids, update `BY_KREWE_KIOSKS`, and have its side quests
   chain the `k12-by-*` station ids.
3. **Regenerate and gate.** The coordinator's chain (gen_catalog done here; gen_home, check_interop --write,
   gen_skill_registry, gen_wiki, export_unity, gen_investor, gen_guide_kb, bundle_webxr). The full suite was not run
   in this session; check_interrupts, check_smartcity, check_ladders and check_unity_export are the likeliest to see
   the twelve new stations.
4. **Originality.** Eval org sits at seventeen to forty (shared template words); rewrite interaction cues per station.
5. **A thirteenth station** if wanted: how a lock lifts a boat, at `canal-lock` (Orleans) or `pq-intracoastal-lock`.
