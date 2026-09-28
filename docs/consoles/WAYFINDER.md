# Console WAYFINDER — search metadata and usable pages across the homepage and every app

Team: WAYFINDER · Brief: the owner's "SEO and user friendly interfaces" request (with `console-brief.md`, `ui-review-brief.md`, `polish-brief.md`, `WebXR/ACCESSIBILITY.md`) · Branch: `claude/vr-ar-safety-training-wkwmve`

Rules kept here: new top-level names carry the `wf` prefix (the bundler concatenates every module into one scope). CINEMA owns the video layer on the same pages (background `<video>`, the `cn*` helper, band/scrim CSS): this console never touches it and keeps its edits to `tools/gen_home.mjs` to the `<head>` line and the two search-match lines. Every meta text is read from the catalog or the page's own copy: no claim, number or partner is invented.

- 05:29 UTC · Console opened; fast-forwarded the branch; read the briefs, POLISH's log, gen_home/gen_tracks, the bundler, check_home/check_tracks/check_links/check_guide/check_auth · next: plan.
- 05:31 UTC · Plan: (1) `tools/seo-config.json` (baseUrl empty) + `tools/gen_seo.mjs` stamping one marked head block into every page and writing sitemap/robots/manifest/404, run last by the bundler; gen_home and gen_tracks call its `wfHeadFor` so their "is current" checks stay exact; (2) forgiving search with trade↔union synonyms and `?q=`; (3) track-page site nav + breadcrumbs, descriptive alt, 16 px phone copy, 44 px targets; (4) `tools/check_seo.mjs` in check_all; (5) captures · next: build.
- 05:33 UTC · Before captures from HEAD's dist: `node tools/capture_wayfinder.mjs before` → docs/img/wayfinder/ · next: og images.
- 05:35 UTC · `tools/capture_og.mjs` took 1200×630 captures of the homepage, Trade Skills, the racer, the arcade and the instructor console, and rendered the hard-hat icon to 192/512 PNG (WebXR/assets/wf/); the seven worlds reuse WebXR/home/img · next: gen_seo.
- 05:45 UTC · check_tracks failed on `../index.html#finder` ("no file"): its resolver kept the #fragment in the path; now it strips it. check_home passed first time · next: commit, then check_seo.
