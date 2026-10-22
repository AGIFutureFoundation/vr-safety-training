# SEO-WHITEPAPER memory

- Base 86ca8491 (loop 10 round 6c). Prefix `swp`/`SWP_`, port 9147. The page follows the privacy page's pattern: source
  `WebXR/whitepaper.html`, copied to `WebXR/dist/whitepaper.html` by `tools/bundle_webxr.py`, stamped by `tools/gen_seo.mjs`
  (mirrors: `dist/whitepaper.html` and `whitepaper.html`, so the source's canonical is `dist/whitepaper.html`).
- The SEO entry is `WF_WHITEPAPER` in `gen_seo.mjs`; `page.ogType` is new and defaults to `"website"`, so no other block changed.
  The description limit is 155: the first draft was 156.
- The og capture: `WF_OG_ONLY=whitepaper WF_PORT=9147 node tools/capture_og.mjs`, then `node tools/gen_seo.mjs` to copy it into
  `dist/og/`. The capture reads `WebXR/dist/whitepaper.html`, so rebuild first when the opening changes. It also redraws the icons;
  they came out byte-identical.
- Claim markup: `<li|tr|p class="... swp-claim">… <cite><a href="https://github.com/AGIFutureFoundation/vr-safety-training/blob/main/PATH">PATH</a></cite></li>`.
  The checker strips `<code>`, `<cite>`, `<svg>`, scripts, styles and attributes, then looks every number of a claim up in the
  cited files (with or without thousands commas). Section labels are words ("loop ten", "Round" never as a digit) so that no number
  stands outside a claim.
- Where a console note phrases a figure differently from the page, cite the wiki page that states it
  (`docs/wiki/Roadmap-and-Changelog.md` rows carry "figure | file" pairs; `docs/wiki/Executive-Summary.md` the headline ones).
- Facts read against their files (cycle 4): CI runs only for paths under `WebXR/` and `tools/`; the prefix rule is a loop rule,
  not something `bundle_webxr.py` states; `docs/deploy-cloudflare.md` says the workflow is "gated on the secrets being present".
- The worktree's guard refuses shell loops over checker names and heredocs that mention git: `$SP/loop10/swp/run.sh <names>` runs
  checkers one at a time; `$SP/loop10/swp/shots.mjs` takes the stills on port 9147.
- Stale bundles at the base: a full rebuild changes `dist/instructor-console.html` and `dist/parishes.html` (AVATARS-HD-3's sources);
  left unstaged.
