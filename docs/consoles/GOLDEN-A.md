# GOLDEN-A — San Francisco on the parish engine: regions, hills, three districts

Console GOLDEN-A of the Bayou & Golden run (`tools/briefs/bayou-brief.md`). Prefix `sf`, port 8993.
Base: `a643c66` on `claude/vr-ar-safety-training-wkwmve` (the worktree started at 589f0d8 and was reset locally).

## Plan (written before code)

1. **Regions in the registry.** `np-parishes.js` gains `NP_REGIONS` (`new-orleans` "New Orleans Parishes", a map is a
   *parish*; `san-francisco` "San Francisco Districts", a map is a *district*), `npRegionOf(map)` (a map without a
   `region` field is New Orleans, so the five parish modules stay untouched — ASSAYER is editing four of them this run),
   `npRegion(id)` and `npRegionGroups()` (regions in order, each with its maps). The SF modules carry
   `region: "san-francisco"`.
2. **The app follows the region.** The menu selector and the P modal draw a heading per region, then that region's maps;
   `document.title` is `<map> — <region title>`; the control grammar's world name and the "welcome" toast use the
   region's noun. `?parish=sf-downtown` is the deep link (the query name stays `parish` so every existing link holds).
3. **Hills.** Schema: `hills: [{ id, name, center: [x, z], radius, height }]` (optional; absent means flat). `npHeightAt`
   adds a gentle cosine mound per hill to the base ground before the water cut (water still wins), and a site pad
   flattens to the hill's height at the site's centre rather than to sea-level ground, so a site on a slope sits on a
   terrace, not in a pit. Orleans is bit-identical (no hills → the old field). `npValidate` checks each hill (id, a name
   with no digits, centre on the field, radius 80–1500 m, height 0–120 m, gentle: `height·π / (2·radius)` under 0.35).
   Names only (Twin Peaks, Nob Hill, Russian Hill, Telegraph Hill, Bernal Heights, and Potrero Hill in the Mission
   map); a `height` is a procedural map number, never quoted as an elevation.
4. **Water kinds `bay` and `ocean`** join the schema (colours in `NP_WATER_KINDS`, both checkers' kind lists, a site
   never inside either, the app's pelicans fly over them).
5. **Three districts** written by a scratch generator (`$SP/bayou/golden-a/gen_sf.mjs`) from approximate public
   lon/lat through one north-up uniform scale of 2.2 real metres per map metre (a 9 km box per map — `check_parish_data`
   wants a field wider than 8 km; the three boxes overlap, as the parishes do). One shared coastline (the bay from the
   Golden Gate round the Embarcadero to Candlestick, the ocean down Ocean Beach) is clipped to each field, so every map
   agrees on the shore. Each module is a pure literal (no imports), `NP_SF_*`:
   - `sf-downtown` "Downtown & Embarcadero": port, the Ferry Building as a place, a transit hub, a hospital, a union
     hall, plus a cable-car barn, a high-rise site, the Bay Bridge crew yard; hills Nob, Russian, Telegraph.
   - `sf-mission` "Mission & SoMa": rail yard, construction site, school campus, stadium district, maker workshop,
     plus a hospital, a bus yard, a pier-side shipyard; hills Bernal Heights, Potrero Hill, Twin Peaks.
   - `sf-golden-gate-park` "Golden Gate Park, the Richmond & the Sunset": park crews, the windmill (landmark), an Ocean
     Beach lifeguard station, a hospital, a university campus, plus the park nursery, a streetcar terminal at the beach,
     the zoo grounds' service yard and a school; hill Twin Peaks; water the ocean, Stow Lake, Spreckels Lake, Lake Merced.
6. **Connectors.** The GOLDEN-B contract (exact ids and lonlats, far end `position: null`): `sf-van-ness-north`,
   `sf-embarcadero-north` (→ sf-marina), `sf-third-street-south`, `sf-bayshore-south` (→ sf-bayview), `sf-park-presidio`
   (→ sf-marina). `sf-bay-bridge` (kind `world`) is GOLDEN-B's; the Downtown map keeps its point `[-122.387, 37.790]`
   on dry land at the anchorage so the learner can walk to it. Between GOLDEN-A's own districts, mirrored under each
   side's own id at one lonlat: Market Street (downtown ↔ mission), King Street (downtown ↔ mission), Geary Boulevard
   (downtown ↔ golden-gate-park), Oak Street at the Panhandle (mission ↔ golden-gate-park).
7. **Checkers.** `check_parishes.mjs`: every map has a known region, regions group in order, the app groups the
   selector and titles by region; hills validate, raise the ground at their centre, stay gentle, keep off the water, and
   Orleans stays flat; SF sites/landmarks carry no figures or history words. `check_parish_data.mjs`: `region`
   optional, a known slug when present; `hills` shape; bay/ocean kinds; SF pairs connect. Bundler list, docs/parishes.md
   section with the connector table.

## Log
- 22:48 started; base reset to a643c66 (worktree was at 589f0d8).
- 22:56 read brief, engine, checkers, docs, PARISH and DELTA memory; plan above. Connector contract with GOLDEN-B taken
  verbatim from the coordinator's task.
