# The parishes — how the five connect

Five New Orleans-area parishes on one shared data schema (the crescent brief's *Shared data contract*): Orleans
(console PARISH, `WebXR/shared/np-data-orleans.js`, with the engine `WebXR/parishes/`), and Jefferson, St. Bernard,
Plaquemines and St. Tammany (console DELTA, this document). Each is one 4096 × 4096 m streamed world, a stylised map of
the parish, not a survey: real places appear only by their public names *as places*, every coordinate is approximate
(three decimals, `approximate: true`) and exists only to place a map. Nothing here is a fact about the place beyond
"this kind of public place is roughly here".

## The modules

| parish | id | module | export | one map metre on the ground | anchors | sites | connectors |
|---|---|---|---|---|---|---|---|
| Orleans Parish | `orleans` | `np-data-orleans.js` (PARISH) | `NP_ORLEANS` | PARISH's choice | — | 10+ | — |
| Jefferson Parish | `jefferson` | `np-data-jefferson.js` | `NP_JEFFERSON` | 8 m | 10 | 12 | 4 |
| St. Bernard Parish | `st-bernard` | `np-data-st-bernard.js` | `NP_ST_BERNARD` | 8 m | 10 | 11 | 3 |
| Plaquemines Parish | `plaquemines` | `np-data-plaquemines.js` | `NP_PLAQUEMINES` | 20 m | 10 | 12 | 3 |
| St. Tammany Parish | `st-tammany` | `np-data-st-tammany.js` | `NP_ST_TAMMANY` | 10 m | 11 | 12 | 2 |

DELTA's four modules are pure literals (no imports, no helpers, nothing for the bundler to erase) written once by a
generator from approximate public lon/lat through one north-up uniform scale per parish (x east, +z south, like Bay
World); the modules are the source of truth afterwards. Because every feature was placed through the same projection
its anchors fit `np-geo.js`'s affine to within a few metres, and any two parishes agree on where a shared crossing is.

Schema notes beyond the brief's printout:
- `water[]` with a `width` is a **ribbon** along its points (a river, a canal, a bayou); without one it is a **polygon**
  (a lake, the gulf, a wetland). Sites never sit inside a lake or gulf polygon.
- `sites[].trades` are `tools/unions.json` ids; `sites[].programmes` are catalog curriculum ids; `sites[].stations`
  are existing catalog stations only (DELTA added no station).
- `fieldLessons[]` follow `RW_FIELD_LESSONS` (`id` with `-fl-`, `title`, `site`, optional `landmark`, `k12`, `trade`,
  `tradeLine`, `minutes` 2–4, `steps[3]`, `check { q, options, answer, why }`) with no digits in the text.
- `gated[]` follow the gate contract and also carry `world` (the parish id), `siteName` and `summary`, ready for the
  shared lock UI. They are *not* exported as a top-level `*GATED*` array, so `check_gates.mjs` does not discover them
  twice; PARISH's engine can aggregate `NP_*.gated` into one `NP_GATED` export when it mounts the lock UI.
- `connectors[]` carry two extra optional fields, `lonlat` (the agreed crossing point, approximate) and
  `approximate: true`. See below.

## Connectors — the rule and how a long crossing meets it

A connector's two ends must project within 1 km of each other in lon/lat. A road at a parish line does that on its
own; a 38 km causeway does not — so a long crossing is a **point both maps contain**: the Causeway meets mid-lake at
(-90.128, 30.170), the interstate twin spans mid-lake at (-89.820, 30.175), the Chalmette ferry mid-river at
(-89.978, 29.950). Each parish's map extends far enough over the water to hold that point (Jefferson's north half is
Lake Pontchartrain; St. Tammany's south quarter is too).

Each parish lists its **own outgoing** crossings (`from.parish` is itself); the neighbour lists the same crossing back
under its own id (same kind, same `lonlat`), which `tools/check_parish_data.mjs` verifies. An end into Orleans ships
`to.position: null` until PARISH fills it: `to.position = npGeoToXz("orleans", connector.lonlat)`. Orleans's own
module should then list the mirror crossing (from Orleans) at the same `lonlat`.

| crossing | kind | between | agreed point (lon, lat) | ids |
|---|---|---|---|---|
| Lake Pontchartrain Causeway | causeway | jefferson ↔ st-tammany | -90.128, 30.170 (mid-lake) | `jf-causeway`, `st-causeway` |
| The interstate at the Seventeenth Street Canal | road | jefferson ↔ orleans | -90.118, 30.000 | `jf-interstate-orleans` |
| Westbank Expressway at the Orleans line | road | jefferson ↔ orleans | -90.045, 29.925 | `jf-westbank-expressway-orleans` |
| Belle Chasse Highway at the parish line | road | jefferson ↔ plaquemines | -90.020, 29.885 | `jf-belle-chasse-highway`, `pq-belle-chasse-highway` |
| St. Claude Avenue at the Orleans line | road | st-bernard ↔ orleans | -89.997, 29.962 | `sb-st-claude-orleans` |
| Chalmette ferry across the river | ferry | st-bernard ↔ orleans | -89.978, 29.950 (mid-river) | `sb-chalmette-ferry` |
| The east bank river road at Caernarvon | road | st-bernard ↔ plaquemines | -89.905, 29.855 | `sb-river-road-plaquemines`, `pq-river-road-st-bernard` |
| Woodland Highway at the Orleans line | road | plaquemines ↔ orleans | -89.975, 29.888 | `pq-woodland-highway-orleans` |
| The interstate twin spans over the lake | bridge | st-tammany ↔ orleans | -89.820, 30.175 (mid-lake) | `st-twin-spans-orleans` |

For Orleans this means its map should contain the six agreed points above: the Seventeenth Street Canal line and the
Westbank Expressway line on the Jefferson side, St. Claude Avenue and the mid-river ferry point on the St. Bernard
side, Woodland Highway on the Plaquemines side, and the twin spans' mid-lake point to the north-east. With a
uniform-scale, north-up fit that is roughly a 16 m-per-map-metre world centred near (-89.97, 30.03); a smaller-scale
Orleans map can leave the twin spans to the Rigolets/US-11 side and connect St. Tammany through Orleans East instead.

## What each parish holds

**Jefferson** — Metairie and the airport side of Kenner, Elmwood, the lakefront at Bucktown, the Causeway toll plaza,
the Huey P. Long Bridge, Old Gretna, the west bank waterfront (Harvey Canal, Westwego, Avondale side), Bayou Segnette.
Sites: airport ramp, lakefront levee and floodwall, a drainage pumping station, the causeway yard, the river bridge
ironworkers and painters, Elmwood freight row, the Harvey Canal marine yard, the Gretna landing, a hospital district,
Lafreniere Park grounds, a west bank transit yard, the Kenner rail corridor.

**St. Bernard** — Arabi and Chalmette, the Chalmette Battlefield grounds, the refinery corridor at Meraux, Violet and
Poydras, the central wetlands behind the back levee, the outlet canal and its floodwall, the eastern marsh out to
Shell Beach and Yscloskey, Lake Borgne. Sites: the river road levee crew, a refinery turnaround, the battlefield park
ranger station, central wetlands restoration, the Violet Canal floodgate, Shell Beach oyster and shrimp harbour, the
Chalmette ferry landing, a parish hospital and EMS station, a fire station, the surge barrier crew, a school campus.

**Plaquemines** — the river road south from Belle Chasse to Venice, the last road: the Intracoastal lock and tunnel,
the Belle Chasse and Pointe à la Hache ferries, Myrtle Grove's diversion and marsh creation, the refinery bend, Port
Sulphur's river terminal, Empire's harbour, Buras's substation and line crew, Fort Jackson, Venice marina, a pipeline
and marine fabrication yard, Belle Chasse fire and EMS; Barataria Bay west, Breton Sound east, the birdfoot at the end.

**St. Tammany** — the north shore across the Causeway: the causeway's north yard at the toll plaza, Old Mandeville and
its harbour, Fontainebleau State Park, Lacombe's bayou and substation, Big Branch Marsh, Slidell (a storm staging area,
a rail yard, the twin spans), Covington's old town, a hospital district and a college campus, Abita Springs and the
Tammany Trace trailhead, Madisonville's boatyard on the Tchefuncte, the piney woods to the north.

## Checking

`node tools/check_parish_data.mjs` (pure Node, no browser) validates every `np-data-*.js` under `WebXR/shared`: the
shape, anchors and their affine, geometry on the field, sites with resolvable unions / programmes / stations, landmarks,
connectors (both ends within 1 km, mirrored by the neighbour, the Orleans ends against the agreed `lonlat`), field
lessons, gated items, the facts rule, and this document's table. PARISH's `tools/check_parishes.mjs` (in `check_all`)
is meant to absorb it — the checker reads the modules directly and needs nothing from the engine.


## Orleans-side connector ids (console PARISH)

The Orleans module lists every crossing back under its own ids: `conn-i10-17th-street-canal` and `conn-lakefront-17th-street-canal` (Jefferson, paired with `jf-interstate-orleans` and `jf-lakefront-orleans`), `conn-westbank-expressway` (`jf-westbank-expressway-orleans`), `conn-st-claude-avenue-east` (`sb-st-claude-orleans`), `conn-chalmette-ferry` (`sb-chalmette-ferry`), `conn-twin-spans-east` (`st-twin-spans-orleans`). The Woodland Highway crossing into Plaquemines lies south of the Orleans box and is not a connector; Plaquemines instead carries its own river ferry, `pq-pointe-a-la-hache-crossing`. The Canal Street ferry to Algiers Point stays inside Orleans and is drawn as a ferry road, not a connector.

## San Francisco districts (region `san-francisco`)

The parish engine also carries San Francisco as districts on the same schema, each with `region: "san-francisco"`
and a `hills` array (`{ id, name, center, radius, height }` — gentle procedural mounds, names only). Console GOLDEN-A
owns sf-downtown, sf-mission and sf-golden-gate-park; console GOLDEN-B (docs/consoles/GOLDEN-B.md) owns:

**sf-marina — Marina & Presidio** (`np-data-sf-marina.js`, about two real metres per map metre) — the Marina yacht
harbour, a rescue station at Crissy Field run the coast guard way, the Golden Gate Bridge maintenance yard, the
Presidio's park crew yard and forestry crew, the Crissy Field marsh crew, the Fort Mason piers, the Marina seawall and
storm drain crew, a Chestnut Street building site and a trolley bus yard. The Golden Gate Bridge is a bridge landmark,
a bridge deck and a way out north with no map beyond it yet.

**sf-bayview — Bayview & Hunters Point** (`np-data-sf-bayview.js`, about two real metres per map metre) — the port's
southern terminals, the Islais Creek rail yard, the Third Street light-rail barn, the Hunters Point shipyard and the
C.L.E.A.R. clean-up programme's sites (the soil excavation cell, the groundwater treatment yard, the shoreline and
sediment crew — every station of `hunters-point-bay-restoration` is worked at one of them), the Heron's Head and
Yosemite Slough wetland restoration sites, the Bayview recreation centre and the India Basin park crew.

| Crossing | kind | joins | approx. lon, lat | id (both ends) |
|---|---|---|---|---|
| Van Ness Avenue | road | sf-marina ↔ sf-downtown | -122.424, 37.795 | `sf-van-ness-north` |
| Bay Street to the Embarcadero | road | sf-marina ↔ sf-downtown | -122.415, 37.806 | `sf-embarcadero-north` |
| Park Presidio Boulevard | road | sf-marina ↔ sf-golden-gate-park | -122.472, 37.782 | `sf-park-presidio` |
| The Golden Gate Bridge | bridge | sf-marina → marin-headlands (no map yet) | -122.478, 37.829 | `sf-golden-gate-bridge` |
| Third Street | road | sf-bayview ↔ sf-mission | -122.389, 37.755 | `sf-third-street-south` |
| Bayshore Boulevard | road | sf-bayview ↔ sf-mission | -122.404, 37.735 | `sf-bayshore-south` |
| The Bay Bridge | world | sf-downtown → Bay World (West Oakland) | -122.387, 37.790 | `sf-bay-bridge` |

**A `world` connector** leaves a district for another world's page: `to: { world, site, name, href }` with
`href` the other world's page and `?site=` in the source layout (`../bayworld/index.html?site=west-oakland-union-hall`,
flattened by the bundler to `./bayworld.html?site=…`). World ways live in `shared/sg-ways.js` keyed by the district
they leave; `npResolveConnectors` appends them and projects the `from` end through that district's fit, so a district's
module is never edited to carry one. The parishes app draws a world way as a way out (a tall gold post and a map
label) and crosses with `lkWorldLink` (`&from=parishes&return=<page>#site=<district>/<site>`, encoded); the passport
lives in the origin's storage and crosses with the learner. Bay World's Atlas and its map carry the way back,
`../parishes/parishes.html?parish=sf-downtown`.
