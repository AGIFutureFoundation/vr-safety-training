# SEO-WHITEPAPER-2 memory

- Base a10f1ff8 (loop 10 round 8). Prefix `swp2` (new names keep `swp`), port 9166. Commits ddcf543f (generator, rows, tighter
  check) and 5b3746e7 (VideoObject), then the notes.
- Publish order: `node tools/gen_whitepaper_page.mjs` → copy to `WebXR/dist/whitepaper.html` (what `bundle_webxr.py` does for this
  page) → `node tools/gen_seo.mjs` (stamps the dist copy's canonical). The generator emits `wfBlock(page, "whitepaper.html")` and
  asserts `wfStamp` leaves it unchanged.
- Section kickers live in `WF_WHITEPAPER.sections` (gen_seo); the generator fails if its section count differs. Add a section in
  both, and in `SWP_SECTIONS` in the checker.
- Wiki parsing: `swpBullet(page, prefix)` needs exactly one bullet starting with the prefix (after a **Built**/*Planned* tag);
  `swpHeadline(page, heading)` takes the bullets that end in backtick paths under `## heading`; directory cites are dropped (only
  files are cited). The measured table's group rows match `Loop 10(, round <word>): \`NAME\`, title`.
- Tighter rule: `SWP_NEAR` = 4 content words each side, `SWP_SHARED` = 2. When a hand-read claim fails, reword it to its file's
  words; do not widen the window. Licence ids (CC0-1.0 etc.) go in `<code>` (the generator does it for wiki text).
- Media: source `WebXR/home/media/`, published `WebXR/dist/media/` (the bundler copies the folder). The checker reads `git ls-files`,
  so stage new media before running it.
- The worktree guard refuses heredocs that mention git and shell variables before sed options: put edit scripts in `$SP/loop10/swp2/`
  and run them with paths spelled out. `pkill -f` on a checker name killed the calling shell; stop background runs with TaskStop.
- Stills: `node $SP/loop10/swp2/shots.mjs` (port 9166).
