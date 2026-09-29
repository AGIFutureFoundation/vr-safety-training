# BAYMAP — deep districts of Oakland and the East Bay (prefix `bm`, port 8989)

The Holodeck Packs run, second wave (`packs-brief.md` shared rules; `packs-brief-2.md` section BAYMAP).
Base 4713545. Extends the parish engine's San Francisco work (GOLDEN-A, GOLDEN-B) across the bay.

## Plan

1. **Region.** `oakland` — "Oakland & the East Bay", title "Oakland & East Bay Districts", noun *district* — in
   `NP_REGIONS` (np-parishes.js) and `ND_REGIONS` (check_parish_data.mjs). Maps without `region` stay New Orleans.
2. **Three 4096 m districts** on the schema, written once by a scratch generator (`$SP/packs/baymap/gen_oak.mjs`) from
   approximate public lon/lat through one north-up uniform scale (2.1 real metres per map metre, x east, +z south),
   one shared East Bay shoreline, estuary and lake clipped to each field, so the districts agree on the shore. The
   modules are the source of truth afterwards (pure literals, no imports).
   - `oak-west-oakland` — the port's terminals, a rail yard, a union hall, a school, a recreation centre, a transit station.
   - `oak-downtown-lake` — downtown, Lake Merritt as water, a hospital, a college campus, a civic centre, a theatre as a place.
   - `oak-fruitvale-estuary` — the estuary as water, a marina, a public market, a school campus, a workshop, a shoreline park.
   Ten or more sites each (the coordinator's 300-site goal), real catalog stations by trade, unions from
   `tools/unions.json`, landmarks named as places, six to ten anchors, water, levees (the shoreline seawalls and
   bulkheads), named hills where the ground rises (a height is a map number), roads, field lessons (`bm-fl-`, the
   Redwood shape tied to K-12 stations, plus a trade station), gated side quests.
3. **Connectors** in the parishes' convention: a district-prefixed id on each side (`bm-wo-…`, `bm-dl-…`, `bm-fe-…`),
   same kind and `lonlat` on both sides, the far end projected from the shared lon/lat.
4. **The Bay Bridge** as a `bridge` connector West Oakland ↔ `sf-downtown` at a mid-crossing point both fields hold
   (`bm-wo-bay-bridge-west` / `sf-dt-bay-bridge-east`, one connector line added to the Downtown module).
5. **World ways** to Bay World (`WebXR/shared/bm-ways.js`, GOLDEN-B's `sg-ways.js` pattern), appended by
   `npResolveConnectors`.
6. **Checks** — additions only: `check_parishes` (the region, the three maps in `NP_ENGINE_STRICT`, kinds, water,
   hills, connectors and ways), `check_parish_data` (the region list, the pairs).
7. **Surfaces** as time allows: bundler list, home card count by region, SEO entry, Guide KB chunk, treasures.

## Seams

- `bmWaysFor(parishId)` in `WebXR/shared/bm-ways.js` → `[{ id, kind: "world", name, from: { parish, position: null },
  to: { world, site, name, href }, lonlat, approximate }]`, appended by `npResolveConnectors` after `sgWaysFor`.
- Region `oakland` in `NP_REGIONS`; the page's selector and title follow `npRegionGroups` unchanged.
