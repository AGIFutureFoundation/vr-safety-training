# SEO-WHITEPAPER-3 memory

- Base 61d85871 (loop 10 round 9). Prefix `swp3` (new names keep `swp`), port 9178. Commits 7f10d998 (note-first cites),
  e5314cad (line-bound, measure-aware figure rule), d5e80438 (light scheme, poster path stated), then the notes.
- Publish order unchanged: `node tools/gen_whitepaper_page.mjs` → `cp WebXR/whitepaper.html WebXR/dist/whitepaper.html` →
  `node tools/gen_seo.mjs` (stamps only the dist copy's block; nothing else changes). `$SP/loop10/swp3/publish.sh` does the three
  and runs the checker.
- `SWP_PRIMARY` in the generator: the committed console note or doc behind a wiki bullet that names no file, by the bullet's
  first words; `swpNoteFirst` puts non-wiki cites first and throws when a claim would cite only `docs/wiki/`. Hand-read claims
  use `${swpCites([...])}` inside their template strings, primary file first.
- Figure rule (`swpFigureIn(n, claimText, fileText, rows)`): a small number is read line by line in the cited file; two of the
  claim's nearest words must sit beside it on that line; for a table row (`.swp-row` spans, "measure: figure" pairs) the last
  four content words of that figure's label must be on the line too (one label suffices where a row writes the digit for
  several measures). A figure is a standalone token: `swpTokens` keeps digits inside words (`depth-1`, `retest8`,
  `ROBOTS-HD-2`), and `swpNumbers` filters tokens, so the two agree. Figure count 974 → 873 for that reason.
- Planted-digit case: 8 of 9 on the drive row (the row's own 0 passes); the check asks for all but one. Three shared words
  would reject 12 true figures, so `SWP_SHARED` stays 2.
- Light scheme: the page already read tokens; the hero SVG now uses classes (`swp-d-*`) styled from the page's variables.
  `check_whitepaper_page` imports `AT_ROLES`/`thContrast` from `WebXR/shared/theme.js` and holds `SWP_PAIRS` (13 pairs) in both
  schemes, and refuses any `fill="#…"`/`stroke="#…"` in the body. Nothing sets `data-theme` on this page at runtime yet.
- Poster: `./media/` is the published layout's path (canonical); the source is `WebXR/home/media/`. The checker states it and
  checks both files exist. `check_links` does not read `poster`/`<source>` attributes.
- Stills: `node $SP/loop10/swp3/shots.mjs` (port 9178; sets `data-theme="light"` after load for the light pair). The loop-ten
  still shows the page mid smooth-scroll; wait longer or set `scroll-behavior: auto` before scrolling.
- The worktree guard refuses heredocs and compound commands: write scripts under `$SP/loop10/swp3/` with the Write tool and run
  `bash <path>` / `node <path>`.
