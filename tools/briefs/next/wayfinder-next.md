# WAYFINDER next — from "every page is described" to "every page is findable and effortless"

Binds the next team at console WAYFINDER. Read `docs/consoles/WAYFINDER.md` and `docs/consoles/memory/WAYFINDER.md` first; `console-brief.md`, `WebXR/ACCESSIBILITY.md` and the shared control grammar apply.

## Where this phase left it (measured)
- `tools/gen_seo.mjs` stamps 160 pages (72 public in the sitemap: the homepage, 11 app bundles, 60 track pages) with a unique title (<= 60) and description (<= 155), canonical, Open Graph/Twitter with real captures, and JSON-LD: Organization + WebSite(SearchAction ?q=) + a 60-item ItemList on the homepage, one Course per programme (60 of 60) on the track pages. `tools/check_seo.mjs` runs 4000+ checks in check_all.
- The homepage finder tolerates a one- or two-letter typo and pairs everyday trade words with the unions of single-union programmes (92 synonym keys, `tools/wf_search.mjs`).
- `baseUrl` in `tools/seo-config.json` is empty, so every canonical, og:url, og:image and sitemap `<loc>` is relative — valid for browsers, weak for crawlers and share cards.

## Build
1. **A real address.** When the owner names the published URL, set `baseUrl` and rebuild; extend check_seo to assert every URL is absolute and https under it, and that robots.txt carries the Sitemap line.
2. **Game pages as landmarks.** The nine canvas apps have one h1 (from their menu card) but no `<main>`; give each menu/intro container `role="main"` (not the aria-hidden race stage) and make check_seo require it on every page.
3. **Header overlap on track pages.** At 1440 px the fixed chip bar (Home, ?, Sign in, language) sits over the header's brandline (see `docs/img/wayfinder/track-1440-after.png`); reserve its width the way the homepage does with `--hm-nav-w`.
4. **Station pages.** SmartCiti.X stations are `?sim=<id>` views of one bundle; give them the Trade Skills treatment (title and description follow the open station, `app.js` `wfRoomMeta` is the model) and a breadcrumb Home › Programme › Station in the runner HUD.
5. **Search depth.** Add station-level results to the finder (671 stations; the catalog already carries trade and union), a "Did you mean …" line when the nearest word is one edit away, and keep `?q=` as the one entry point; measure recall on a fixed list of 30 trade/union queries in check_seo.
6. **Contrast and axe.** Vendor axe-core (npm is reachable) under `WebXR/vendor/axe/`, run it at 390 and 1440 on the homepage, a track page, the 404 and the Atlas inside check_seo, and fix every serious finding.
7. **Languages.** The 12 `wf.*` keys ship English-only (`"@en"` in the 20 other tables); the i18n console fills them. Stamp `hreflang` alternates only once a translated page has its own URL.

## Process
Start with `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge --ff-only FETCH_HEAD`. Keep `docs/consoles/WAYFINDER.md` and the memory file. New top-level names carry `wf`. Never hand-edit a stamped head: change gen_seo.mjs and rebuild. Gate with `python3 tools/bundle_webxr.py && node tools/check_all.mjs` (exact "All N checkers pass" line).
