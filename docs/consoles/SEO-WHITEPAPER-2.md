# SEO-WHITEPAPER-2 (loop 10, round 8)

Prefix `swp2`, port 9166. Base `a10f1ff8` (fast-forwarded, hash confirmed). The whitepaper page is now generated, current
through round seven, held by a tighter figure check, and carries a `VideoObject` for a committed clip of real footage.

## What was built

| File | What |
|---|---|
| `tools/gen_whitepaper_page.mjs` (new) | Builds `WebXR/whitepaper.html`. The SEO block is `gen_seo.mjs`'s own `wfBlock` (so `gen_seo` re-stamps it unchanged, asserted); the kickers are `WF_WHITEPAPER.sections`; the hand-read claims of round 6c (opening, problem, platform, stack) stay as data; every other claim is a bullet of a `docs/wiki/` page copied verbatim, citing the files the bullet names and the wiki page; the loop-ten tables are the wiki's "Measured, loop by loop" table, one row per console, grouped by round (one to seven), measures paired with their figures where the row lists them in step. A bullet or row that is not found stops the build by name. No date in the output: a re-run is byte-identical, and `--check` reports staleness. |
| `WebXR/whitepaper.html`, `WebXR/dist/whitepaper.html` | Generated. Three new sections (Robots compete, The Strands harness, The ecosystem), refreshed hive, buildings and bodies claims (moods, kind cues, the high-detail robots, the room-level console), the roadmap's Planned list from the executive summary, a CI line in the stack, and round tables with STRANDS ("simulated only"; `strands_harness` does not exist), ECOSYSTEM ("Router.X is absent"), the two CI fixes (from `docs/consoles/COORDINATOR.md` and the workflow) and the round-six page itself (from `docs/consoles/SEO-WHITEPAPER.md`). A short review clip in the loop-ten section. |
| `tools/check_whitepaper_page.mjs` | 12 sections; the page must equal the generator's output; **a small number (0 to 9) counts only where it stands as a number of its own in a cited file with at least two content words it shares with the claim among its four nearest content words either side** (numbers, short and common words skipped); a synthetic and a real planted negative case; the fundraising pattern needs money or a round beside "raised" (the agents' raised hand is not fundraising), with a case proving it still catches both; five checks on the video (committed and published byte-identical, H.264, index first, no audio, at most 1.2 MB, poster JPEG under 200 KB, the JSON-LD names them, the page shows them). |
| `tools/gen_seo.mjs` | `WF_WHITEPAPER.sections` gains three kickers (articleSection one per `<h2>`); `WF_WHITEPAPER.video`, and the TechArticle carries a `VideoObject` (contentUrl, thumbnailUrl, uploadDate, duration, name, description). |
| `WebXR/home/media/whitepaper-review.mp4` (144,098 bytes), `whitepaper-review.jpg` (59,725 bytes), copied to `WebXR/dist/media/` | An 8-second cut (84–92 s) of REEL's 2-minute review, cut 16 (`reel16-narrated.mp4`, 120.000 s, scratch only): real captures of the built page (the hive's operations room at its morning briefing, then the robot arena's leaderboard), re-encoded with ffmpeg to 960 × 540 H.264, faststart, audio, data and chapter tracks dropped. The poster is a frame of the same footage. No generation service was used. Inside the media folder's rules (`docs/home-backgrounds.md`: a non-hero file at most 1.2 MB, a poster under 200 KB) and the brief's 2 MB. |

## Eval, before → after

| Measure | Before (a10f1ff8) | After | Source |
|---|---|---|---|
| Page generated; output byte-identical on re-run | no (hand-written) | yes; second run "Unchanged", `--check` "current" | `node tools/gen_whitepaper_page.mjs [--check]` |
| Sections, each with sources | 9 of 9 | 12 of 12 | `node tools/check_whitepaper_page.mjs` |
| Sourced claims | 69 | 116 | same |
| Loop-ten console rows; rounds shown | 19; rounds one to five, by theme | 34; rounds one to seven | the page (`<tr class="swp-claim">` in `#loop10`) |
| Figures found in their cited committed files | 220 of 220 (lexical: anywhere in the file) | 817 of 817 under the tighter small-number rule | `check_whitepaper_page` |
| Small-number failures the tighter rule found on the way (fixed by rewording to the file's own words or pairing measures with figures) | — | 3 under the first form, 6 under the two-word form, then 0 | cycles 2–3 |
| Planted wrong small number | passed (lexical) | fails (synthetic and real) | `check_whitepaper_page` negative cases |
| Checker checks | 43 | 55 | same |
| Page in the sitemap | yes (80 entries) | yes (80 entries) | `WebXR/dist/sitemap.xml`; `check_seo` |
| VideoObject | none | 1, its clip and poster committed | `check_whitepaper_page` |
| Commercial claims, model identifiers on the page | 0 | 0 | `check_whitepaper_page` |
| Stills: page errors; failed responses; horizontal scroll at 390 and 1920 | — | 0; 0; 0 | `$SP/loop10/swp2/shots.mjs` |

## Checkers

`check_whitepaper_page` 55 pass; `check_seo` 4,595 pass; `check_design` pass; `check_deploy` 347 pass; `check_newton`, `check_imports`
(1,141 modules), `check_parse` (2,726 modules) pass. `check_links`: see the hand-back (a first run at a load of about 35 failed
two pages this work does not touch, `trades/index.html` and `bayworld/index.html`, and nothing on this page).

## Cycles

1. **Reason:** the page must follow the wiki, not be retyped. **Act:** a generator whose claims are wiki bullets and whose tables are the wiki's measured table. **Observe:** 12 sections, 116 claims; second run unchanged. **Check:** `--check` current.
2. **Reason:** "0" and "6" passed by appearing anywhere. **Act:** small numbers need a shared word nearby, with a planted negative. **Observe:** the first form (one shared word within 6 tokens) still passed every planted digit against the long wiki page, because "page", "errors" and "checks" sit near digits everywhere. **Act:** two shared content words. **Check:** planted 4 fails; 1–3, 5–8 still pass on that row (the rule narrows, it does not prove).
3. **Reason:** a window counted in tokens missed context in table rows where measures come before figures. **Act:** count content words, and pair "a; b: 1; 2" as "a: 1; b: 2". **Observe:** 813 → 817 of 817 after rewording two hand-read claims to their files' words ("0 of 116", the licence id as a name). **Check:** 817 of 817.
4. **Reason:** the fundraising pattern fired on "the bid's raised hand". **Act:** require money or a round beside "raised", and test that it still catches both. **Check:** the case passes; no row was dropped to satisfy it.
5. **Reason:** a VideoObject only with real committed footage. **Act:** an 8-second cut of the review's re-captured round-six frames, inside the media folder's rules, shown on the page. **Check:** five video checks pass; stills 0 page errors, 0 failed responses.

## Honest points

- The small-number rule narrows the lexical check; it does not prove a figure. Against a long wiki page several planted digits still pass (on the drive row, 4 and 9 fail; the others are found beside "checks" or "page" elsewhere). Citing the console note before the wiki page is what keeps a reader able to check.
- Generated claims cite the wiki page as well as their own files; the wiki was verified against the repository when it was built (`a8379051`, by the round-7 docs commit), not by this checker.
- The clip carries the reel's caption overlays (figures from the review, sourced in its `captions.json`, which is scratch). The page's figure check does not read video frames.
- In the repository layout the page's `./media/` poster does not resolve (the source sits beside `home/media/`); the published layout, which the canonical names, does. The video preloads nothing.
- `uploadDate` is the commit date written in `gen_seo.mjs`, not read from the commit.
- The base commit `a10f1ff8`'s message carries a model identifier in its trailer; not changed here (it is history).

## Left

See `tools/briefs/next/swp2-next.md`.
