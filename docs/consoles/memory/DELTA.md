# DELTA memory — read this first

Short, durable lessons for the next team at this console (the parish data modules).

- **Your worktree may not be on the coordinator's tree.** DELTA's started at the repo's first commit. Check `git log -1`
  against the local branch `claude/vr-ar-safety-training-wkwmve` and `git reset --hard` onto it *locally* before anything
  else — that is not a fetch or merge of origin, which the brief forbids.
- **Place features in lon/lat, emit xz.** Every parish module was generated from approximate public lon/lat through one
  north-up uniform scale (x east, +z south; `x = Δlon·111320·cos(lat0)/S`, `z = −Δlat·110574/S`). Anchors then fit their
  own affine to a few metres and two parishes agree on a shared crossing for free. The generator is
  `$SP/crescent/delta/gen.mjs` (scratch, not committed); the modules are the source of truth now — edit them directly.
- **A long crossing is a point.** "Both ends within 1 km" cannot hold for a 38 km causeway unless the connector is the
  same point seen from both maps: the Causeway meets mid-lake, the twin spans mid-lake, the Chalmette ferry mid-river.
  Extend each map over the water far enough to contain the point (Jefferson's north half is lake by design).
- **Orleans is not in this tree.** Connector ends into Orleans are `position: null` with the agreed `lonlat`; PARISH
  fills them with `npGeoToXz("orleans", lonlat)`. docs/parishes.md carries the table PARISH needs to pin its anchors.
- **No top-level `*GATED*` export in a `-data.js` file** unless you want `check_gates.mjs` to discover it (it walks
  every `*-data.js` and imports any with that export, then demands `world`, display names in gate-names-data.js and a
  runner page link per station). Parish gated items live inside `NP_<PARISH>.gated`; PARISH aggregates them once.
- **Pure literals survive the bundler.** The modules import nothing and declare only `NP_<PARISH>`; check_parse and
  check_imports pass with nothing to erase. Any helper you add needs the `nd` prefix.
- **Sites must stay out of the water, ribbons included.** The validator does point-in-polygon against every lake/gulf
  polygon and holds every site further than half a ribbon's width (plus a pad margin) from a river/canal/bayou centre
  line; landmarks are exempt (a bridge, a lock sit on the water). Venice sat inside Breton Sound's edge and eight sites
  sat in a river ribbon on the first runs — move the polygon edge or the site to its *correct* bank (Chalmette is on the
  river's north-east bank; check which side of the centre line you land on, not only the distance).
- **Validator:** `node tools/check_parish_data.mjs` — 1,964 checks in under a second; it also asserts docs/parishes.md
  lists every connector id. PARISH's `check_parishes.mjs` is meant to absorb it.
