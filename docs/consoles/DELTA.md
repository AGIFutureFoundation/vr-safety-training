# Console DELTA — four parishes on the shared parish schema, connected

Team: DELTA · Brief: `$SP/crescent/crescent-brief.md` (DELTA section, Shared rules, the Facts rule for New Orleans, the
Shared data contract) with `tools/briefs/console-brief.md` and `frontier-brief.md` · Branch: `claude/vr-ar-safety-training-wkwmve`
(worktree `worktree-agent-aed19c0fe3fcb8c03`) · Prefix `nd` · Port 8991 · Temp `$SP/crescent/delta/`.

Rules held: real places named only by public names as places; no invented history, dates, statistics, populations,
addresses or business names; coordinates approximate (three decimals, `approximate: true`), only to place a map; every
station id an existing catalog station (no new stations); no secrets, no network.

- 18:44 UTC · Worktree was at the repo's first commit (589f0d8), not the coordinator's tree; moved the branch onto the
  local `claude/vr-ar-safety-training-wkwmve` (01539ab) with a local reset — no fetch, no merge of origin. Identity set.
  Read the crescent brief, console/frontier/mapbox briefs, SUMMIT-3 memory, the CARTOGRAPHER log (no memory file exists),
  summit-data / rw-data / rw-lore-data (site, gated and field-lesson shapes), bay-geo.js (the affine), check_gates,
  check_k12, check_parse, check_imports, the catalog (685 stations, 60 curricula, 28 K-12 stations) and unions.json (111 ids)
  · next: plan.
- 18:58 UTC · **Plan.**
  1. Four pure data modules `WebXR/shared/np-data-{jefferson,st-bernard,plaquemines,st-tammany}.js`, each exporting
     `NP_<PARISH>` exactly on the brief's shape (id, name, size 4096, anchors, water, levees, roads, districts, sites,
     landmarks, connectors, fieldLessons, gated). Pure literals — no helpers, no imports — so the bundler, check_parse and
     check_imports see nothing to erase or clash. They are written once by a scratch generator (`$SP/crescent/delta/gen.mjs`)
     that places every feature from approximate public lon/lat through one north-up uniform scale per parish
     (x east, +z south, like Bay World), so the anchors fit their own affine to ~0 m and any two parishes agree on a
     shared crossing. The modules are the source of truth afterwards; SECONDLINE and PARISH edit them directly.
  2. Scales: Jefferson 1 map m = 8 m (the lake fills the north half, the Causeway runs off the top edge), St. Bernard 8,
     Plaquemines 20 (Belle Chasse to Venice, "the last road"), St. Tammany 10 (Madisonville to Slidell, Covington to the lake).
  3. Connectors: each parish lists its own outgoing crossings (`from` = this parish). The two ends of a crossing must
     project within 1 km, so a long causeway/bridge is a *point* both maps contain — the Causeway meets mid-lake at
     (-90.128, 30.170), the I-10 twin spans at (-89.820, 30.175), the Chalmette ferry mid-river. Every connector carries
     an extra optional `lonlat` (the agreed crossing point, approximate) so PARISH can compute Orleans's end with
     `npGeoToXz("orleans", lonlat)`; ends into Orleans ship `position: null` until then (documented in docs/parishes.md).
  4. `tools/check_parish_data.mjs` (pure Node, `nd`): shape, ids, sizes, bounds, anchors (6–10, three decimals,
     approximate, own affine round trip < 50 m), water/levee/road/district geometry inside the field, sites 8+ with
     union ids from tools/unions.json, programme ids from the catalog's curricula, station ids from the catalog, landmarks,
     connectors (kinds, both ends resolve, ends within 1 km via each parish's fit or the `lonlat`), field lessons on the
     RW shape (3 steps, 3 options, no digits, k12 station exists, site exists), gated items on the gate contract, the
     facts rule (no digits in names/blurbs, no token shapes, no brand words). Reports one line; exit 1 on any failure.
     Not added to check_all here (PARISH's `check_parishes.mjs` absorbs it); a note in docs/parishes.md.
  5. `docs/parishes.md`: how the five connect (a table of crossings with lon/lat and kinds), the scales, the schema notes.
  6. Memory and next brief at each commit / before hand-back. Full `check_all` started by 19:54.
  · next: generate the modules.
- 19:04 UTC · Generator written and run: four modules, 47 sites, 186 station references, 34 landmarks, 12 connectors,
  41 anchors, 12 field lessons, 8 gated items; every module parses · next: the validator.
- 19:08 UTC · `tools/check_parish_data.mjs` written; first run caught Venice marina inside the Breton Sound polygon
  (moved the polygon's edge) and no docs/parishes.md yet (written). Second run: 1,788 checks pass, 0 fail.
  check_parse (2,276 modules) and check_imports (880) green · next: commit, then the single checkers that walk shared/.
- 19:12 UTC · First increment committed · 0cd8711 · next: the checkers that see new files.
- 19:17 UTC · check_proving failed: every tools/check_*.mjs must be in check_all (or PV_UNLISTED) and named in
  docs/perf/checkers-baseline.json — added `check_parish_data.mjs` after check_summit with a 400 ms baseline (it runs in
  0.2 s). check_proving 162, check_console, check_gates (66 gated items, mine not discovered twice by design), check_k12,
  check_unity_export, check_treasures, check_interop all green · next: commit, start the full suite, next brief.
- 19:14 UTC · check_all wiring committed · dacc840 · full `node tools/check_all.mjs` started in the background at 19:14
  (load average 21 on four cores — seven consoles at once; expect 40 minutes) · next: the next brief, a ribbon audit.
- 19:18 UTC · Scratch audit: eight *sites* sat inside a river/canal ribbon (the validator only tested lake and gulf
  polygons) — the Chalmette ferry landing, the St. Bernard river road crew, Port Sulphur's terminal, the pipeline yard,
  Empire's harbour, Venice marina, the Intracoastal lock, Slidell's rail yard, the Madisonville boatyard. Moved each to
  its bank in the generator; landmarks on the water (a bridge, a lock) stay. The regeneration and a ribbon rule in the
  validator are held until the suite finishes so it reads a stable tree · next: apply after the suite, re-validate, commit.
- 19:20 UTC · Coordinator: a batch merged (origin at 4f20b8f, a small forward delta: i18n.js, controls.js, gen_home.mjs,
  investor data). The full suite is mid-run on this tree, so the fetch-and-merge waits for its exit (the next clean
  point), then `node --check` on every touched file · next: suite exit → merge → regenerate → validate → commit.
- 19:25 UTC · check_parish_data ran inside the suite (328 ms, green), so the held changes went in: the ribbon rule in
  the validator (a site further than half a ribbon's width plus a pad margin from every river/canal/bayou centre line),
  the nine sites regenerated on their banks — two of them first landed on the *wrong* bank (the ferry landing on the
  Algiers side), fixed by checking the side, not the distance. 1,964 checks pass, 0 fail; the four modules parse.
  tools/briefs/next/delta-next.md written · next: commit; suite exit → merge origin's batch.
- 20:08 UTC · Coordinator: deadline; the gate re-runs the suite on the merged tree. My full run (started 19:14, load
  average 21→35 on four cores) reached 72 of 82 checkers before I stopped my own task: three failed — check_investor
  (docs/investor counts the checkers named in check_all: regenerated with gen_investor), check_guide (guide-kb.js indexes
  every docs/*.md, so docs/parishes.md made it stale: regenerated with gen_guide_kb), check_ui (Trade Skills 1280×720
  waitForSelector 20 s timeout under load, the same timeout CARTOGRAPHER recorded; not a page this work touches).
  The origin merge (4f20b8f) was not done — the suite held the tree until the deadline; the gate merges.
- HAND-BACK · Full check_all did not finish (stopped at 72/82 at the coordinator's call). Single checkers green on this
  tree: check_parish_data (1,964 checks), check_parse (2,276 modules), check_imports (880), check_proving (162),
  check_console, check_gates (66 gated items, 2,387 checks), check_k12, check_unity_export, check_treasures,
  check_interop, check_investor (after regeneration); inside the suite also green: check_summit, check_mobile and 60
  others. No eval scores apply (no station changed). Counts: 4 parishes, 47 sites, 186 station references resolved,
  34 landmarks, 12 connectors, 41 anchors, 12 field lessons, 8 gated items.
