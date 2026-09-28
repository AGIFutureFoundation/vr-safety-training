# GOLDEN-B memory — read this before touching the San Francisco districts or the world ways

Short, durable lessons for the next team at this console (the Bayou brief's GOLDEN-B section, docs/consoles/GOLDEN-B.md).

- **The districts are generated.** `$SP/bayou/golden-b/gen.mjs` (scratch, not committed) writes `np-data-sf-marina.js`
  and `np-data-sf-bayview.js` from approximate lon/lat through DELTA's north-up uniform scale (S = 2.05 real m per map m).
  The modules are the source of truth now — edit them directly. Water and district edges are written with far-off
  sentinel coordinates that the generator clamps to ±2048, so a scale change never leaves a dry strip at the edge.
- **`check_parish_data` wants a ground width over 8 km.** A city district at under two real metres per map metre fails
  it; two real metres per metre gives 8.3 km and keeps every site on its own pad.
- **The relief check samples a 132 m grid.** A short seawall can fall between samples and the district reads as flat;
  the generator inserts one levee vertex on the grid (`-2048 + 132·k`). GOLDEN-A's hills will add relief too.
- **Keep sites clear of hills.** The pad-flatness check (a 20 m step under 0.6 m) would fail once GOLDEN-A's
  `npHeightAt` adds mounds; check_parishes holds every SF site outside `radius + 40` of every hill.
- **A world way lives outside the district it leaves.** `shared/sg-ways.js` keys `sf-bay-bridge` by `from.parish:
  "sf-downtown"`; `npResolveConnectors` appends `sgWaysFor(id)` and projects the end through that district's fit. So
  GOLDEN-A's module is never edited, and until sf-downtown is registered check_parishes tests the way on a stand-in.
- **No bare hash on a cross-world link.** Bay World reads `#site=` as its own return site; `lkWorldLink` encodes the
  whole return inside `&return=`, so the parishes' `#site=<district>/<site>` never reaches Bay World's hash.
- **A new parish-surface treasure touches four checkers.** gen_treasures (the kits and lesson finds), check_treasures
  and check_parish_play (both bind triggers through SL_PARISHES — extended with `sgDistrict`), and check_gates (a gated
  kit needs a display name: run `node tools/gen_gate_names.mjs`). Copy the regenerated `guide-kb.js`,
  `treasures-data.js` and `gate-names-data.js` into `WebXR/dist/shared/` (DIST_SHARED is a plain copy) or check_guide
  reports the dist stale.
- **A partial bundle needs three more steps for the flat folder:** `bundle_webxr.py parishes atlas bayworld`, then
  `combined_fixup` into `WebXR/dist/<page>`, then `stamp_seo()` (else check_seo calls the flat pages stale), and
  `cp WebXR/home.html WebXR/dist/index.html` after gen_home (else check_home does). Restore
  `tools/__pycache__/bundle_webxr.cpython-311.pyc` before committing — it is tracked.
- **Flat links come from the bundler's own rewrites.** Source `../bayworld/index.html?site=` becomes
  `./bayworld.html?site=`; `../parishes/parishes.html?parish=` becomes `./parishes.html?parish=`. check_parishes runs
  `dist_fixup` + `combined_fixup` in Python, as check_links does.
