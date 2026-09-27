# Console COMPASS — the Guide

Team: COMPASS · Brief: `tools/briefs/homepage-guide-brief.md` (section COMPASS, with `console-brief.md` and `wojrc-brief.md`) · Branch: `claude/vr-ar-safety-training-wkwmve`

Rules kept here: every new top-level name is prefixed `gd…` because the bundler concatenates every module into one scope; the homepage block is a separate `<script>` line in `tools/gen_home.mjs` so it merges with MARQUEE's redesign; the Guide states nothing about wojrc.org beyond the sourced text in `tools/briefs/wojrc-brief.md`.

- 23:09 UTC · Console opened; fast-forwarded the branch; read the briefs, voice-assist.js, ei-guide.js, controls.js, touch.js, passport.js, the catalog, the world data modules, check_ui.mjs, gen_home.mjs, gen_tracks.mjs and the bundler · next: plan.
- 23:20 UTC · Plan: (1) `tools/gen_guide_kb.mjs` → `WebXR/shared/guide-kb.js` (programmes, stations, worlds, sites, zones, controls, unions, docs headings, FAQ, the sourced wojrc.org text); (2) `WebXR/shared/guide.js` — button, panel, BM25 retrieval and answer composition, voice in/out, optional endpoint; (3) `gdMount` beside every `ctlMount` (11 bundles, home via gen_home, tracks via gen_tracks) and the bundler lists; (4) `tools/check_guide.mjs` in check_all, `#gd-btn` in check_ui's overlap boxes · next: the generator.
