# BAYMAP memory — read this before touching the Oakland & East Bay districts

- **Base first.** The worktree started at 589f0d8; `git reset --hard 4713545` put it on the coordinator's tree.
- **Generated once, edited after.** `$SP/packs/baymap/gen_oak.mjs` + `oak-content.mjs` (scratch) write the three
  `np-data-oak-*.js` modules from lon/lat at 2.1 real m per map m (centres: West Oakland -122.312, 37.812; Downtown &
  Lake -122.262, 37.806; Fruitvale & Estuary -122.230, 37.772). The modules are the source of truth now.
- **The estuary is a `canal` ribbon** (spannable), so roads and the Webster tube cross it without a deck; Lake Merritt
  and the bay are open water — roads must stay off them.
- **`check_parish_data` wants `to.position` filled** for a far end that is in the tree (a null fails "on the field");
  write it from the other district's projection of the shared `lonlat`.
- **The Bay Bridge pair** (`bm-wo-bay-bridge-west` / `sf-dt-bay-bridge-east`) meets at (-122.358, 37.812), a point
  both fields hold; it added one connector line to `np-data-sf-downtown.js` (merge with SITEWORKS's site growth there).
- **Bridge landmarks sit on a bank**, not mid-water (check_parishes allows only shore/point/canal/lock kinds on water).
- **A block in check_parishes that runs before the wiring section cannot use its top-level `bundler`** (TDZ); read the
  file locally.
- Checkers: `node tools/check_parish_data.mjs` (< 1 s), `node tools/check_parishes.mjs` (~1 min for thirteen maps).
