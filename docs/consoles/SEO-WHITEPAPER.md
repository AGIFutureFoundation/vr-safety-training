# SEO-WHITEPAPER (loop 10, round 6c)

Prefix `swp`, port 9147. Base `86ca8491`. The whitepaper as a shareable page of the site: `WebXR/whitepaper.html`, published
beside the homepage as `whitepaper.html`, stamped by `tools/gen_seo.mjs`, listed in the sitemap, linked from the homepage footer
and the docs index, and held by a new checker, `tools/check_whitepaper_page.mjs`.

## What was built

| File | What |
|---|---|
| `WebXR/whitepaper.html` | The page. A pitch-deck-style opening (title, lead, a procedural SVG of seven software agents around the safety governor above six simulated robot sites, four headline tiles), then nine sections: the problem, what the platform does, the Omega Hive, robotics buildings and scenes, the agents' bodies, robot learning with measured results, **added in loop ten** (four tables: the hive, bodies and voices, buildings and scenes, robot learning, one row per console with its measure and its note), **the stack** (WebXR and three.js, the flat bundler, on-device speech, the checker suite and gate, CI, the deploy configs, the data formats, the SEO generator) and the roadmap (Built / Planned). Every figure sits in an element marked `swp-claim` that cites the committed file it is copied from, as a link to the file on the repository. Static: it reads the same without JavaScript (the Home chip and the Guide are added by script, as on the privacy page). Dark on the design system's tokens; tables become cards on a phone. |
| `tools/gen_seo.mjs` | `WF_WHITEPAPER` (title 55 chars, description 147) and its page: canonical, Open Graph with `og:type` article (new `page.ogType`, default `"website"`, so every other page's block is byte-identical), Twitter large-image card, JSON-LD `TechArticle` (headline, description, url, image, language, author and publisher, isPartOf, `articleSection` = the nine sections) and a `BreadcrumbList`. **No `VideoObject`:** the only committed videos are the homepage backgrounds (`WebXR/dist/media/*.mp4`); the whitepaper's video (the REEL cuts) lives in scratch, not in the repository. |
| `tools/capture_og.mjs` | A `whitepaper` shot (1200 × 630 JPEG, quality 72, like the others) and `WF_OG_ONLY=<id>` to re-take one capture without touching the others. Output `WebXR/assets/wf/og-whitepaper.jpg` (79 KB), copied to `WebXR/dist/og/whitepaper.jpg` by `gen_seo`. |
| `tools/bundle_webxr.py` | Copies `whitepaper.html` into `WebXR/dist/` (as `privacy.html`), and adds it to `EDGE_NO_STORE_PAGES` (navigational HTML is no-store). |
| `tools/gen_home.mjs` → `WebXR/home.html`, `WebXR/index.html`, `WebXR/dist/index.html` | The footer's documentation list links "The whitepaper — agents, robots and the stack". |
| `docs/README.md` | A row in "Overview and white papers". |
| `tools/check_whitepaper_page.mjs` (new; in `check_all.mjs`; an estimated 6 s row in `docs/perf/checkers-baseline.json`, to re-measure quiet) | 43 checks: the published copy carries the source's body; nine sections each with an `<h2>` and sourced claims; **every number in a claim found in one of the files it cites, and every cited file tracked by git** (220 of 220); no number outside a claim; no currency, valuation, fundraising, price, partnership, customer or model-identifier wording; the SEO block current, og:type article, a TechArticle with one section per `<h2>`, no VideoObject without a committed file; the og capture 1200 × 630 and ≤ 160 KB, published byte-identical; sitemap and no-store header; linked from both homepage layouts, the published homepage and the docs index; with JavaScript off at 390 × 844 and 1920 × 1080: one `<h1>`, nine of nine sections shown with their text, no horizontal scroll, body text ≥ 16 px. |
| `tools/check_seo.mjs` | The page takes the full document audit (`WF_FULL`): landmarks, skip link, 16 px body copy, 44 px controls, layout shift. |
| `tools/check_design.mjs`, `tools/check_links.mjs` | The page is listed with the other document pages (`SOURCE_PAGES`, `LK_DOC_PAGES`). |

## Eval, before → after

| Measure | Before (86ca8491) | After | Source |
|---|---|---|---|
| SEO-stamped page files | 180 | 182 (the source and its published copy) | `node tools/check_seo.mjs` ("stamped pages") |
| Public pages in the sitemap | 79 | 80 | `WebXR/dist/sitemap.xml` (`git show 86ca8491:WebXR/dist/sitemap.xml`) |
| Whitepaper sections on the site, each with sources | 0 | 9 of 9 | `node tools/check_whitepaper_page.mjs` |
| Figures on the page present in the committed files they cite | — | 220 of 220 (69 claims) | `node tools/check_whitepaper_page.mjs` |
| Figures outside a sourced claim | — | 0 | same |
| Commercial claims, model identifiers | — | 0 | same |
| Pages linked to it | 0 | homepage (both layouts and the published copy), docs index | same |
| Page errors in the stills drive; horizontal scroll at 390 and 1920 | — | 0; 0 | `$SP/loop10/swp/shots.mjs` |

## Cycles

1. **Reason:** the page must be a page of the site, not a document beside it. **Act:** follow the privacy page's pattern (source at `WebXR/`, copied by the bundler, stamped by `gen_seo`). **Observe:** `check_seo` stamped 182 files, 80 sitemap entries. **Check:** `check_seo` all pass.
2. **Reason:** "copy, never invent" needs a proof, not a promise. **Act:** every figure inside a `swp-claim` with a `<cite>`; a checker that looks each number up in the cited file. **Observe:** first run 218 of 220 — "100" (in "95.8 of 100") is not in `docs/investor/platform-summary.json`. **Act:** cite `docs/wiki/Executive-Summary.md` too, which states "mean 95.8 out of 100". **Check:** 220 of 220.
3. **Reason:** the og:image should be the page itself. **Act:** a capture of the opening at 1200 × 630. **Observe:** the first diagram put the bottom agent on the governor's line to the robots, as if an agent stood between them. **Act:** seven agents spaced round the ring with the gap at the bottom. **Check:** looked at the capture; the line runs from the governor between the two lower agents.
4. **Reason:** the checker proves numbers, not sentences. **Act:** read each qualitative claim against its file. **Observe:** CI does not run on every push (only paths under `WebXR/` and `tools/`); the bundler file does not state the prefix rule; "a workflow without its secrets does nothing" is a stronger reading than the deploy doc's "gated on the secrets being present"; the problem heading made an unsourced market claim. **Act:** reworded each to what its file says; the bundler row also cites `tools/check_imports.mjs`. **Check:** `check_whitepaper_page` 43 of 43.
5. **Reason:** a phone at 390 wide. **Act:** stills. **Observe:** three-column tables squeezed the source column to five letters a line. **Act:** rows become cards on a phone; a 300 px source column on a desktop. **Check:** stills at 390 and 1920 re-shot and looked at; no horizontal scroll, 0 page errors.
6. **Reason:** the new page is a document page for every checker that lists them. **Act:** `check_design` `SOURCE_PAGES`, `check_links` `LK_DOC_PAGES`, `check_seo` `WF_FULL`. **Check:** `check_design` pass, `check_seo` 4,595 pass, `check_links` 23,818 pass (the published page opened, its anchors resolved, Home and the Guide asserted).

## Honest points

- The figure check is lexical: a number passes when the same digits appear anywhere in a cited file. A small number ("0", "6") is
  found almost anywhere; the reader's protection for those is the cited file, and the cycle-4 reading of each sentence.
- Several rows cite `docs/wiki/Roadmap-and-Changelog.md` or `docs/wiki/Executive-Summary.md` (committed, generated from the
  whitepaper fragments) rather than the console note, where the note phrases the figure differently.
- The page is dark only, like the privacy page; it follows the design system's tokens and does not offer a light scheme.
- No `datePublished` in the TechArticle: no committed file dates the page.
- The rebuild also regenerated `WebXR/dist/instructor-console.html`, `WebXR/dist/parishes.html` and their per-app copies from
  AVATARS-HD-3's committed sources (the base did not carry rebuilt bundles). They are not committed here; the coordinator's rebuild
  will produce them.

## Left

- A `VideoObject` once a video of the whitepaper is committed (the REEL cuts are scratch only).
- A light scheme if the design system's light tokens are wanted on document pages.
- A refresh path: the page is written by hand; a generator from the whitepaper fragments (as `tools/gen_wiki.mjs` builds the wiki)
  would keep it current, with this checker unchanged.
