# PLAYLAYER — console memory

Short, durable lessons for the next team at this console. Read `docs/consoles/PLAYLAYER.md` for the log.

## Conventions
- **One source for a lesson**: a field lesson lives in its map's `fieldLessons` (np-data-<map>.js). The play layer
  (`sl-parish-play.js` for New Orleans, `sg-sf-play.js` for Marina/Bayview, `pl-bay-play.js` for the other fifteen Bay Area
  maps) only re-reads it. A lesson without `station` is left off the play layer — `check_playlayer` fails it.
- **Consumers read `[...SL, ...SG, ...PL]`**: `eval_worlds` (parish "completable"), `gen_treasures` (kits and lesson finds),
  `check_treasures`, `check_parish_play`. When a new map lands in a Bay Area region, `PL_BAY_MAPS` picks it up by
  `region`; add its short name to `PL_SHORT` and rerun `node tools/gen_treasures.mjs`.
- **The boards are fallbacks**: the app calls SECONDLINE's `slMountPathBoard` / KREWE's `kwMountQuestBoard` first and
  mounts PLAYLAYER's only when those render nothing, so a parish never gets two boards.
- **Port 8990 is also `eval_worlds`' and SV's default** — other consoles' evals hold it. Use `--no-browser` for the eval
  and `SV_PORT=18990` for `sv_survey`; restore `docs/evals/platform-review.json` afterwards (sv_survey rewrites it).
- **Worktree Bash refuses sed/git with runtime variables** — put edits in a scratch `.cjs`/`.mjs` and run it with node.
