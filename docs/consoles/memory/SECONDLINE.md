# SECONDLINE memory — read this first at this console

Short, durable lessons for the next team gamifying the New Orleans parishes (`docs/parish-play.md`, `docs/consoles/SECONDLINE.md`).

- **The worktree may start at the wrong commit.** This one was checked out at the repository's first commit; the coordinator's tree is the local branch head (`git log --all`). `git reset --hard <that hash>` — never fetch or merge origin on your own.
- **`git config` can hit a lock.** Seven worktrees share `.git/config`; retry a few times rather than failing the identity step.
- **Only `CURRICULA` stations count.** The catalog (`catalog.json`) has stations no programme lists (`rcl-switching`, `cath-lab`, `arena-rigging`, `shipyard-hotwork`); `check_gates`, `check_treasures` and `check_k12` resolve against `curricula.js`. Validate site and gate stations against `CURRICULA`, not the catalog.
- **Nothing here carries a coordinate.** PARISH and DELTA own `np-data-<parish>.js`; parish treasures are site-relative (`{ parish, site, dx, dz, r }`) and `tzWatchWorld` takes an `at(trigger)` resolver (`slTreasureAt(parishData)`). Sites bind by id, then by `match` on id/name/kind — so a parallel console's renamed site still binds.
- **Generator order matters.** `gen_treasures.mjs` before `gen_gate_names.mjs`: the gated caches name stations too, and `check_gates` fails a gated station with no display name.
- **The fact denylist bites generic words.** `built`, `opened`, `tall`, `miles`, `oldest` in an ordinary sentence fail the Facts checks (`check_k12` §8d and `check_parish_play`); write around them ("made", "open", "high", "distance").
- **The design checker forbids emoji in chrome.** The path board's lock reads "Locked:" as text, never a padlock glyph.
- **`check_gates` strips `K-12` before its digit test; `check_treasures` does not.** A K-12 gate note is fine on a game, not on a treasure.
- **The module is not a `*-data.js`**, so `check_gates`, `gen_gate_names` and the discovery walks do not find it by name; each reads `shared/sl-parish-play.js` explicitly. Keep it that way (renaming it `-data.js` would double-count `SL_GATED` through discovery).
- **Headless Node imports need a Storage stub** (`globalThis.localStorage ??= …`) before importing the module: it imports `skill-gates.js`, which reads profiles at call time only, but `gen_treasures` also imports `eggs.js`, which reads at import.
