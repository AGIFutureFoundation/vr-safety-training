# SEO-WHITEPAPER, next (`swp3`)

Read `docs/consoles/SEO-WHITEPAPER-2.md` and its memory, `tools/gen_whitepaper_page.mjs`, `tools/check_whitepaper_page.mjs`, the
`WF_WHITEPAPER` entry in `tools/gen_seo.mjs`.

1. **Round eight's rows.** After the coordinator rebuilds the wiki from the round-8 fragments, run the generator and publish.
   New consoles appear by themselves if the wiki's measured table has their group rows; add a section only for a new kind of work.
   Check: `node tools/gen_whitepaper_page.mjs --check` current, `check_whitepaper_page` figures N of N.
2. **Cite the note first.** Where a generated claim cites only the wiki page (the roadmap bullets), add the console note the bullet
   came from, so a reader has the primary file. Check: every generated claim cites a file outside `docs/wiki/`.
3. **A stronger figure rule for the long wiki page.** Against `Roadmap-and-Changelog.md` most planted small digits still pass
   (only 4 and 9 fail on the drive row). Try matching the claim's measure phrase on the same table row or line, not anywhere.
   Check: more planted digits fail; the page still passes.
4. **The repository layout's poster.** The page's `./media/` poster resolves only in the published layout; either accept it (and
   say so in the checker) or have the bundler rewrite one path. Check: `check_links` on both layouts.
5. **A light scheme** if the design system wants one on document pages. Check: `check_design`'s contrast pairs, stills in both.

Rules: copy figures, never invent; real footage only, never a generation service; no partnership, customer, price, valuation or
fundraising claim; one browser drive at a time on your own port; never run `tools/check_all.mjs`.
