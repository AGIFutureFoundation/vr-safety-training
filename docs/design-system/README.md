# Design system — tokens, templates, icons, illustrations

One stylesheet, `WebXR/shared/design.css`, is linked by every app page: the
homepage (both layouts), all 60 track pages, the 11 app bundles in the repo
layout, each per-app `dist/` and the flat `WebXR/dist/` folder, the portal, the
verifier, the Safety Campus page and the template gallery. It is generated, so
edit the sources below and run:

    node tools/gen_design.mjs          # design.css + the gallery
    python3 tools/bundle_webxr.py      # copies it, the fonts and icons into WebXR/dist/
    node tools/check_design.mjs        # the gate (also in check_all)

The gallery, `WebXR/design/index.html` (and `WebXR/dist/design/index.html`),
shows every component, illustration and icon in dark and light, the colour
roles and the contrast table.

## Sources

| What | Where | Notes |
|---|---|---|
| Colour roles, type scale, spacing, radius, elevation, motion | `WebXR/shared/theme.js` (`AT_ROLES`, `AT_TYPE`, `AT_SPACE`, `AT_SHAPE`) | The roles map onto the POLISH palette `TH_TOKENS`, so the HUD adoption rules `thMount()` injects and the templates never drift apart. |
| Contrast pairs | `theme.js` `AT_CONTRAST_PAIRS` | Every pair at WCAG AA (4.5:1 text, 3:1 for the focus ring and the illustration line) in both schemes; checked. |
| Component templates | `tools/gen_design.mjs` (`AT_COMPONENTS`) | All classes are `.at-*`. |
| Spot illustrations | `WebXR/shared/illustrations.js` (`atIllustration`, `atIlloKind`) | Pure-shape inline SVG, painted by `--at-illo-*` roles. |
| Icons | `WebXR/vendor/icons/*.svg` (Lucide, ISC) | Inlined into design.css as mask data URIs: `--at-icon-<name>`. |
| Fonts | `WebXR/vendor/fonts/*.woff2` (Fontsource, OFL-1.1) | `@font-face` with latin and latin-ext `unicode-range`. |

Credits and licences for every vendored file: `docs/credits.md`.

## Tokens

All tokens are CSS custom properties prefixed `--at-`. Dark is the default
(`:root`); `:root[data-theme="light"]` switches to light; `.at-scheme--dark` and
`.at-scheme--light` scope either scheme to a subtree (the gallery's previews).

- **Colour roles** — `bg`, `surface`, `surface-2`, `raised`, `raised-2`,
  `on-surface`, `on-surface-muted`, `on-surface-dim`, `primary`,
  `primary-strong`, `on-primary`, `secondary`, `success`, `warning`, `danger`,
  `border`, `border-strong`, `scrim`, `focus`, and the illustration roles
  `illo-sky`, `illo-ground`, `illo-line`, `illo-fill`, `illo-warm`, `illo-accent`.
- **Type** — `font-body` (Barlow), `font-display` (Barlow Condensed),
  `font-mono`; sizes `fs-2xs` 11 → `fs-3xl` 34 on a 1.2 ratio, `fs-4xl` a clamp
  for heroes; `lh-tight`/`lh-snug`/`lh-body`; weights 400–700.
- **Spacing** — a 4px grid, `sp-1` 4px … `sp-16` 64px.
- **Shape** — radii `r-xs` 4 … `r-xl` 20 and `r-pill`; elevation `elev-0…3`;
  motion `dur-fast` 120ms / `dur` 200ms / `dur-slow` 360ms with `ease-out`,
  `ease-in-out`; `tap` 48px (minimum touch target), `measure` 68ch.

## Components

| Component | Markup | Notes |
|---|---|---|
| Hero | `.at-hero` > text (`.at-eyebrow`, `.at-hero__title`, `.at-hero__lead`, `.at-hero__actions`) + `.at-hero__art` | Stacks with the art first under 720px. |
| Section header | `.at-section-head` (`.at-eyebrow`, `h2` or `.at-section-head__title`, `p`) + an optional action | Styling only: WAYFINDER owns heading levels and page structure. |
| World card | `a.at-card` > `.at-card__media` (capture or illustration) + `.at-card__body` | 16:9 media slot. |
| Programme card | `.at-card` > `.at-card__art` (illustration) + `.at-card__body` (`.at-card__title`, `.at-card__meta`, `.at-card__foot`) | Cards in an `.at-grid` stretch to equal heights; the foot sits at the bottom. |
| Stat tile | `.at-stat` > `.at-stat__value` + `.at-stat__label` | Tabular numerals. |
| Badge / chip | `.at-badge[--primary|--success|--warning|--danger]`, `.at-chip[aria-pressed]` | Status never by colour alone: pair with a word or icon. |
| Buttons | `.at-btn--primary`, `.at-btn--secondary`, `.at-btn--ghost` | Pill, 48px tall, display face; `disabled`/`aria-disabled` dim. |
| Lock state | `.at-locked` on the item + `.at-lock` badge (lock icon + the condition) | For skill-gated side quests and games; the condition text is required. |
| Toast | `.at-toast[--success|--warning|--danger]` with `role="status"` | |
| Dialog | `.at-scrim` > `.at-dialog` (`.at-dialog__title`, `.at-dialog__actions`) | |
| Tabs | `.at-tabs` > `.at-tab[aria-selected]` | |
| Breadcrumb | `.at-breadcrumb ol > li` | Chevron separators; styling only. |
| Footer | `.at-footer` > `.at-footer__cols` | |
| Empty state | `.at-empty` > illustration + `.at-empty__title` + `p` + action | Honours `hidden`. |
| Icon | `<span class="at-i at-i--<name>" aria-hidden="true">`, or `data-at-icon="<name>"` on any element (a `::before` icon) | Follows `currentColor`. |

## Illustrations

`atIllustration(programmeIdOrKind, { title })` returns an inline SVG; without a
title it is decorative (`aria-hidden`). `atIlloKind(id)` maps a programme id to
one of 21 kinds: electrical, construction, maritime, dive, health, culinary,
logistics, environmental, aerospace, robotics, sports (and emotional
intelligence), responders (emergency services), the four K-12 programmes
(k12-maths, k12-science, k12-civics, k12-literacy) and a generic k12
classroom, events, garment, pathway and a general safety fallback. No two
programme categories share a drawing; a keyword only matches at the start of
a segment of the id (`support` no longer reaches the port drawing).
Motifs are tools, structures, vehicles and symbols — no brands, logos or
people.

## Where the templates are applied

- **Homepage** — programme cards carry their category illustration; the finder's
  "no match" message is an `.at-empty`; the page's palette variables alias the
  `--at-*` roles; buttons are pills. CINEMA's background video and WAYFINDER's
  headings, meta and navigation are untouched.
- **Track pages** — the hero carries the programme's illustration; palette
  aliased to the roles.
- **Atlas, instructor console** — palette aliased to the roles; buttons pills;
  the console's views are underline tabs (the `.at-tab` paint) and the page
  clears the fixed chip bar; the Cohorts tab's grid and invite-code chips paint
  from the roles (ENTERPRISE's `cohort.js` draws them).
- **Sierra Summit, Redwood Reach** — the neutral roles, the display face, pill
  buttons, the card surface on Redwood's mode cards, lock and done marks with
  the lock and check icons, the toast surface, chip-shaped map layers. Each
  world keeps its own accent (Summit's sky-blue and gold, Redwood's amber and
  moss) so it still reads as itself; the Home chip carries the house icon only.
- **Treasure Map, privacy page** — linked to the stylesheet; headings on the
  display face, cards and tables on the surfaces, the empty state a dashed box
  with the map icon, buttons pills.
- **Track pages** — the sticky top band pads by `--at-nav-w`, the fixed chip
  bar's measured width (set at run time as the homepage does), so the brand
  line never runs under Home / help / sign-in / language; under 700 px the
  brand line hides and the "All stations" link stays.
- **Every app** — the Home chip's house icon (the ⌂/⛳ glyph removed from the
  markup and from all 21 language tables); the station runner's results and
  leaderboard cards, overlay button rows and the sign-in dialog take the
  dialog surface and pill buttons through `theme.js`'s `TH_ADOPT`.
- **Icons replacing emoji in the chrome** — SmartCiti.X runner (voice, controls,
  first/third-person view, read-aloud, steering), Holodeck (read-aloud, speak),
  Trade Skills (voice, read-aloud), the level-milestone badge, the Field notes
  and Toolbox Talk Bingo buttons and their lock marks, the Race vehicle picker
  and signal arrows. Emoji stay where they are content (the Guide's chat,
  station text).

## Rules

- Paint first: applying a template to existing chrome changes colours, borders,
  radii, icons and fonts, not a fixed panel's box, so the UI and mobile
  checkers' layouts hold.
- New JS top-level names are prefixed `at`/`AT_` (the bundler concatenates every
  module into one scope).
- A new vendored file gets a line in `docs/credits.md` in the same commit.
