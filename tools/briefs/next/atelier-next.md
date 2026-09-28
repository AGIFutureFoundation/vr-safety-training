# ATELIER next — carry the templates into every surface

Binds the next ATELIER session. `tools/briefs/console-brief.md`, `docs/design-system/README.md`, `docs/consoles/memory/ATELIER.md` and `docs/credits.md` apply. Start with `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge --ff-only FETCH_HEAD`; keep `docs/consoles/ATELIER.md`.

## Build
1. **World start screens.** The eleven apps' menu/start cards (`#scr-menu .card`, `.menu-card`, Bay World's and the Deep's intro menus) adopt `.at-btn` shapes, `.at-badge` for mode chips and a world illustration or capture in an `.at-card__media` slot — paint and markup inside the card only, no box a checker measures moves.
2. **Lock state for skill-gated items.** When the frontier brief's side quests and games land, every gated item renders `.at-locked` with an `.at-lock` badge naming its real condition (from the ladder data, never invented).
3. **Instructor console and Atlas.** Tabs become `.at-tabs`/`.at-tab`; empty roster and empty log states become `.at-empty` with an illustration; the Atlas detail panel's actions become `.at-btn--secondary`.
4. **Toasts.** The runner's and Trade Skills' transient messages move onto `.at-toast` variants with `role="status"`.
5. **Light scheme.** Nothing sets `data-theme="light"` yet; offer it where a page can honour it fully (track pages, homepage sections, instructor console), with `check_design` extended to render one page per scheme headlessly and measure text contrast.
6. **Stock video.** When CINEMA's slot manifest (`WebXR/home/media/backgrounds.json`) receives licensed clips, add each to `docs/credits.md` with source, licence and version; `check_design` already fails on an unlisted vendored file — extend it to the media folder.

## Findings handed over
- WAYFINDER: on track pages and the instructor console the fixed Home/help/sign-in bar overlaps the header brandline/eyebrow at 1440 and 390 (see `docs/img/atelier/track-*-after.png`, `instructor-*-after.png`); the homepage already reserves `--hm-nav-w` for it.

## Hand-back
≤ 200 words: commits, the check_all line, captures, any new vendored pack with its licence.
