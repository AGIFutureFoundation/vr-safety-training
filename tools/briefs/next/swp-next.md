# SEO-WHITEPAPER, next (`swp`)

Read `docs/consoles/SEO-WHITEPAPER.md` and its memory, `WebXR/whitepaper.html`, `tools/check_whitepaper_page.mjs`, the
`WF_WHITEPAPER` entry in `tools/gen_seo.mjs`.

1. **Generate the page from the whitepaper fragments.** Write `tools/gen_whitepaper_page.mjs` (prefix `swp`) that builds the
   sections and the loop tables from the committed wiki pages (`docs/wiki/Executive-Summary.md`, `Roadmap-and-Changelog.md`) the
   way `tools/gen_wiki.mjs` builds the wiki, keeping the claim markup. Check: the generated page equals the committed one
   (a staleness check in `check_whitepaper_page`), and figures in cited committed files stays N of N.
2. **Round six onward.** Add rows for HIVE-6, ENV-HD-6, ROBOTS-HD, ROBO-ARENA, OMEGA-CLAW and AKAMAI once their notes are merged,
   each citing its own note. Check: `check_whitepaper_page` (every new number found in its note).
3. **A VideoObject**, only if a video of the whitepaper is committed under `WebXR/dist/media/` (with a poster still): add it to
   the TechArticle's JSON-LD with `contentUrl`, `thumbnailUrl`, `name`, `description`, `uploadDate` from the commit. Check:
   the checker's "no VideoObject without a committed video file" passes with the VideoObject present.
4. **Tighter figure check.** Make small numbers (0–9) match only next to a word they share with the claim in the cited file
   (a window of a few words), so "0" or "6" cannot pass by appearing anywhere. Check: the current page still passes; a planted
   wrong small number fails (add it as a negative case in the checker).
5. **Light scheme** if the design system wants one on document pages: the page's tokens under `at-scheme--light`. Check:
   `check_design`'s contrast pairs, stills in both schemes.

Rules: copy figures, never invent; no partnership, customer, price, valuation or fundraising claim; one browser drive at a time
on port 9147; never run `tools/check_all.mjs`.
