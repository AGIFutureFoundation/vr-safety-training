# Console GOLDEN-B — Marina & Presidio, Bayview & Hunters Point, the bridges, and the way to Bay World

Team: GOLDEN-B · Brief: the GOLDEN-B section of `tools/briefs/bayou-brief.md` (under the console, frontier and crescent
briefs) · Branch: `worktree-agent-adbe8038fbd8f5805` off a643c66 · Port 8994 · Prefix `sg` · Temp `$SP/bayou/golden-b/`.

Rules held: the Facts rule (real places by public name only, as places; no history, dates, statistics, addresses or
business names; coordinates approximate, three decimals, only to place a map); Mapbox only with a viewer's token; every
page works in the procedural fallback; kids' text at its age band, one idea per step, no digits, no fear framing.

## Connector contract with GOLDEN-A (agreed ids and approximate lon/lat; kind `road` unless noted)
| id | joins | lon, lat | owner of each end |
|---|---|---|---|
| `sf-van-ness-north` | sf-downtown ↔ sf-marina | −122.424, 37.795 | A writes sf-downtown's end, B writes sf-marina's |
| `sf-embarcadero-north` | sf-downtown ↔ sf-marina | −122.415, 37.806 | A / B |
| `sf-third-street-south` | sf-mission ↔ sf-bayview | −122.389, 37.755 | A / B |
| `sf-bayshore-south` | sf-mission ↔ sf-bayview | −122.404, 37.735 | A / B |
| `sf-park-presidio` | sf-golden-gate-park ↔ sf-marina | −122.472, 37.782 | A / B |
| `sf-bay-bridge` (kind `world`) | sf-downtown → Bay World | −122.387, 37.790 | **B** (in `shared/sg-ways.js`, attached to sf-downtown at load — A's module is not touched) |
| `sf-golden-gate-bridge` (kind `bridge`) | sf-marina → marin-headlands (no map yet) | −122.478, 37.829 | B (pending — a way out north) |

Each end is written `to: { parish, position: null, lonlat }` with a top-level `lonlat` (the agreed crossing), so
`npResolveConnectors` projects it through the other district's fit when that module is registered and the checker
reports it *pending* until then.

## Schema decisions (additive to GOLDEN-A's region/hills engine work)
1. **Region and hills in the data only.** Both modules carry `region: "san-francisco"` and `hills: [{ id, name, center, radius, height }]`
   on the brief's shape. This worktree's engine ignores both; GOLDEN-A's `npHeightAt` adds the mounds. Sites sit outside
   every hill's radius so the pad-flatness check holds after the merge. A seawall `levee` in each district keeps the
   relief check (bed to crest) true without hills.
2. **A `world` connector kind** (`NP_CONNECTOR_KINDS` gains `"world"`): `to: { world, href, site, name }` instead of a
   parish; `href` is the source-layout link (`../bayworld/index.html?site=<id>`) the bundler flattens to
   `./bayworld.html?site=<id>`. `npValidate` checks the far end; `npResolveConnectors` passes it through as resolved;
   the app draws it as a way out and crosses with `lkWorldLink` (the passport rides along in local storage; the link
   carries `from=parishes` and a `return` to the district and site).
3. **World ways live in `shared/sg-ways.js`** (`SG_WAYS`, `sgWaysFor(parishId)`), keyed by the district they leave, with
   `from: { parish, position: null }` and a `lonlat`; `npResolveConnectors` appends `sgWaysFor(parish.id)` and projects the
   `from` end through that district's own fit. So `sf-bay-bridge` belongs to sf-downtown without editing A's module.
4. **The way back.** Bay World's Atlas and the Bay World map gain a "San Francisco districts" way back
   (`../parishes/parishes.html?parish=sf-downtown`, flattened to `./parishes.html?parish=sf-downtown`).
5. **Lessons** live in each district's `fieldLessons` (np shape plus the trade `station`, ids `sg-fl-…`); `shared/sg-sf-play.js`
   re-exports them on the play layer's shape (`parish` added) with the districts' treasure sites; `gen_treasures.mjs` reads it.

## Plan
- `WebXR/shared/np-data-sf-marina.js`, `np-data-sf-bayview.js` — generated from approximate lon/lat by
  `$SP/bayou/golden-b/gen.mjs` (one north-up uniform scale per district), 10 and 11 sites.
- `np-parish.js` (world kind + validation), `np-parishes.js` (register, attach ways), `sg-ways.js`, `links.js`
  (`lkWorldLink`), parishes `app.js` (draw and cross a world way), Bay World `atlas.js` + `map.js` (way back).
- Ten SF field lessons (five per district) tied to K-12 stations; `check_k12` section for them; treasures in gen_treasures.
- Wiring: bundler module lists, `check_parishes` (SF sites, world connector, Bay World link), `check_links` (static: the
  Bay Bridge and the way back resolve in both layouts), passport, home card, SEO entry, Guide KB chunk.

## Log
- Base reset from 589f0d8 to a643c66 (local, no fetch). Plan and the connector table above written first.
- 8339a1e — the two districts (generated from lon/lat, S = 2.05), the `world` connector kind, `sg-ways.js`,
  `lkWorldLink`, the app's way out, Bay World's way back (Atlas and map), check_parishes' San Francisco section,
  docs/parishes.md's San Francisco section. check_parishes and check_parish_data green.
- 3a693dc — ten SF field lessons (`sg-fl-…`, five per district) on the play layer via `sg-sf-play.js`; a Fog-Day Kit
  off every SF site and the lessons as Field Scholar finds; check_k12 8e, check_treasures, check_gates green.
- 1fb183f — the San Francisco Districts home card (own capture), the parishes SEO line naming both regions, the
  Guide's `world:san-francisco` chunk; parishes, Atlas and Bay World bundles rebuilt and flattened.
- 3cf40cc — check_links section 9 (the Bay Bridge both ways, both layouts, a crossing loaded); check_parish_play
  knows the SF caches; `tools/briefs/next/golden-b-next.md`.
