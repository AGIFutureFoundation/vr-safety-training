# ATELIER-2 next — the templates on the last surfaces, and a light scheme

Binds the next ATELIER session. `tools/briefs/console-brief.md`, `docs/design-system/README.md`, `docs/consoles/memory/ATELIER.md` and `docs/consoles/memory/ATELIER-2.md` apply. Start with `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge origin/claude/vr-ar-safety-training-wkwmve` (a merge, not ff-only); keep `docs/consoles/ATELIER-2.md`.

## Measured at hand-back (52ebc3a and after)
- `check_design`: 6/6 checks, 172 pages linked to the stylesheet (was 168), 32 contrast pairs at AA.
- Illustration kinds: 21 (was 16); every one of the 60 programmes maps to its own category's drawing; no programme falls to the safety fallback.
- Pages styled this run: Sierra Summit, Redwood Reach, the Treasure Map, the privacy page, the instructor console (all four tabs). Captures: `docs/img/atelier/{summit,redwood,treasures,privacy,cohorts,track,instructor}-{1440,390}-{before,after}.png`.
- Track band: the brand line sits at x ≈ 440 at 1440 wide, clear of the chip bar (ends at x ≈ 268); hidden under 700 px.

## Build
1. **World start screens, the other nine.** Summit and Redwood are done; the eleven older apps' menu cards (`#scr-menu .card`, `.menu-card`, Bay World's and the Deep's intro menus) still carry square buttons and their own fonts. Same recipe as `WebXR/summit/index.html`: alias the neutral roles, keep the world's accent, `.btn` as a pill on the display face, lock and done marks with the icon `::before`.
2. **Instructor console empty states.** The Live class view with no session, the roster before the catalog loads and the session log with no rows should read as `.at-empty` with an illustration. `instructor/js/app.js` writes these as text into `#count`, `#roster-count` and `#log-rows`; add a hidden `.at-empty` block per view in `index.html` and toggle it from the same code paths (ENTERPRISE's `cohort.js` already writes "No cohort yet." — leave it, or give it the same block).
3. **Toasts.** The runner's and Trade Skills' transient messages (`smartcity/js/react-ui.js`, `trades/js/app.js`) move onto `.at-toast` variants with `role="status"`. Summit's and Redwood's `#toast` already take the toast paint.
4. **Light scheme.** Nothing sets `data-theme="light"` yet; the privacy page and the Treasure Map are the two pages that can honour it fully now that they paint from the roles — offer a toggle there first, and extend `check_design` to render one page per scheme headlessly and measure text contrast.
5. **Track band at 1440.** The band reserves the chip bar's full measured width from the viewport's left, which is more than the centred 1120 px container needs (the brand line starts at x ≈ 440). A tighter formula is `max(var(--gutter), calc(var(--at-nav-w) - (100vw - 1120px) / 2))` guarded for narrow widths; do it only if the band looks empty in a review.
6. **Stock video.** When CINEMA's slot manifest receives licensed clips, add each to `docs/credits.md` with source, licence and version, and extend `check_design`'s vendored-asset rule to the media folder.

## Findings handed over
- Guide (owner of `tools/gen_guide_kb.mjs`): with `docs/enterprise.md` indexed the knowledge base is 641 KB against the 640 KB cap, so it cannot be regenerated after the ENTERPRISE merge; `check_guide` will report it stale until the cap moves or a doc leaves the index.
- REDWOOD-2: under SwiftShader the Redwood start screen renders over a black frame (`docs/img/atelier/redwood-1440-after.png`); Summit paints its terrain in the same harness.

## Hand-back
≤ 200 words: commits, the check_design line (and the full `check_all` line if the suite finished), captures, any new vendored pack with its licence.
