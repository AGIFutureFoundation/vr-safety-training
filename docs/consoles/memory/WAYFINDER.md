# WAYFINDER memory — read first

- The head block is owned by `tools/gen_seo.mjs` (between `<!-- wf-seo … -->` and `<!-- /wf-seo -->`). Never hand-edit a page's `<title>`, meta description, canonical, og/twitter or JSON-LD: change the page table in gen_seo.mjs and rebuild.
- `check_home` and `check_tracks` compare the generators' output byte-for-byte with the files, so gen_home.mjs and gen_tracks.mjs call `wfHeadFor(key, at)` themselves; the bundler then runs gen_seo last, and a re-stamp of an already-current page is a no-op.
- `at` is where the file is *served* from, not where it sits: WebXR/home.html is stamped as `dist/index.html`, WebXR/home/tracks/x.html as `dist/tracks/x.html`.
- Every `*.html` in WebXR/dist/ is swept by check_guide (gdMount), check_links (Home chip + Guide), check_auth (`"gt-account"` in the file) and check_i18n: a new page there (404.html) must mount controls.js and guide.js and name `gt-account`.
- New visible strings: add the key to tools/i18n/en.json and `"@en"` to every other table (gen_i18n fails on a missing key), then `node tools/gen_i18n.mjs`.
- baseUrl is empty: canonical/og/sitemap stay relative. Set it once in tools/seo-config.json (ending in /) and rebuild.
