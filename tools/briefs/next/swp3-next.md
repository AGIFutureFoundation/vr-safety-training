# SEO-WHITEPAPER, next (`swp4`)

Read `docs/consoles/SEO-WHITEPAPER-3.md` and its memory, `tools/gen_whitepaper_page.mjs` (`SWP_PRIMARY`, `swpNoteFirst`),
`tools/check_whitepaper_page.mjs` (`swpFigureIn`, `swpMeasures`, `SWP_PAIRS`), the `WF_WHITEPAPER` entry in `tools/gen_seo.mjs`.

1. **Round nine's rows.** After the coordinator rebuilds the wiki from the round-9 fragments, run the generator and publish
   (generate → copy to `WebXR/dist/whitepaper.html` → `node tools/gen_seo.mjs`). A new wiki bullet that names no file needs an
   `SWP_PRIMARY` entry (the console note it came from) or the build stops by name.
   Check: `node tools/gen_whitepaper_page.mjs --check` current; `check_whitepaper_page` figures N of N, wiki-only claims 0.
2. **The 0 a row holds for another measure.** The planted-digit case rejects 8 of 9 digits on the drive row; the 0 the row
   itself carries (for "failed" and "page errors") still passes for "checks passed" because the lexical rule reads a line,
   not a cell. Try pairing each measure with its own cell of the wiki row (the generator already pairs "a; b: 1; 2" as
   "a: 1; b: 2"; the checker could read the row's cells in step). Check: 9 of 9 rejected; the page still passes; the
   synthetic case still passes.
3. **Prose figures.** Hand-read prose claims have no "measure: figure" pair, so they keep the line-bound rule alone (two
   shared words on one line). Try requiring the figure's nearest claim word on the same line for prose too, and reword a
   claim to its file's words where that fails rather than widening the rule. Check: figures N of N; more planted digits fail
   on a prose claim (add a second real negative case from a prose claim).
4. **A way to choose the light scheme.** The page honours `:root[data-theme="light"]`, but no shared module sets it yet
   (no scheme control exists on document pages, and `design.css` has no `prefers-color-scheme` rule). If the design system
   gains a scheme setting, mount it here; do not invent one on this page alone. Check: `check_design`, `check_interface`
   if a control is added, stills in both schemes.
5. **The repository layout's poster.** Accepted this round (the checker states it: `./media/` is the published layout's
   path, the source sits at `WebXR/home/media/`). If the bundler ever rewrites `home/media/` paths for the homepage, use
   the same rewrite here and compare bodies after it in check 1. Check: `check_links` on both layouts.

Rules: copy figures, never invent; real footage only, never a generation service; no partnership, customer, price,
valuation or fundraising claim; one browser drive at a time on your own port; never run `tools/check_all.mjs`.
