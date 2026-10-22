# SCHOLAR memory (Packs run, second wave) — read this first

- Prefix `sc`, port 8987. Core `WebXR/shared/sc-scholar.js` (pure; seams `scStartSession`, `scSessions`, `scBoard`
  documented at its top), panel `sc-session-ui.js` (DOM only), cross-world index `sc-lessons.js` (page and checker
  only: it imports every world's data, so never bundle it into a world).
- Lesson shapes differ by world: K2 `station` = K-12; Summit `station` = K-12 with `tradeStation`; Redwood,
  the maps and SG carry `k12` + trade `station`; BAYOU `station` = K-12 and `check.q`. `scNormalise` takes
  `l.k12 ?? l.station` — keep that order.
- The world registers its own lessons through `scMountSession({ lessons })`; parishes = `parish.fieldLessons`
  + `byLessonsFor(parish.id)` (by-parish-lessons.js joined the parishes bundle for this).
- check_imports fails a bare call to another module's global even when guarded with `typeof` once that module
  exists in the tree (enCohorts did). Pass such things in: `scBoard(code, { cohorts })`, `scMountSession({ path })`.
- Bundled pages: `scholar` is in the bundler's SIBLING_APP_DIRS so `../scholar/` links (and the panel's default
  board link) are rewritten in `<app>/dist/` and the flat dist. The combined `WebXR/dist/` only rebuilds on a full
  `python3 tools/bundle_webxr.py` (no arguments); check_home fails on a stale `WebXR/dist/index.html` otherwise.
- The fear check has an idiom list (a circuit proven dead, engines drown out voices); extend it rather than
  loosen the word list.
- The worktree guard refuses heredocs mixed with some tokens and `for` loops over checkers; write the script to
  the scratchpad and run it alone, one checker per command.
