# STORYLINE — next

1. Mount `stMountPaths` in Redwood Reach, Sierra Summit and Bay World (their GRIOT characters have `site`, not `siteKind`;
   extend `tools/gen_st_stories.mjs` to those worlds' sites and field lessons).
2. Carry the chosen path in `ppExport` and the instructor console (a teacher sees which path a class picked).
3. PACKS: once `pk-packs.js` lands, show the pack(s) of each path in the picker's blurb (`pkPacks().filter(p => p.path === id)`).
4. TYCOON: a branch's station pays through `tyEarn` like any pass; a path chip on the ledger is optional.
5. A browser checker step for the picker (the smoke in `$SP/packs/storyline/smoke.mjs` shows the shape: pick, glow count,
   reload, Just Roam clears stories and glow) folded into `check_storyline.mjs` behind a `--browser` flag.
6. Regenerate `st-stories-data.js` whenever the catalog, GRIOT's roster or a parish module changes (`--check` fails otherwise).
