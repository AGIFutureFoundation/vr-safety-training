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

## San Francisco — the second region (console GOLDEN-A)

The engine carries regions: `np-parishes.js` lists `NP_REGIONS` (`new-orleans` "New Orleans Parishes", a map is a
*parish*; `san-francisco` "San Francisco Districts", a map is a *district*), and each map may name its `region` (a map
without one is a New Orleans parish, so the five parish modules are unchanged). The selector draws each region, then its
maps; the page title is `<map> — <region title>`. The same 4096 m schema holds, plus two additions:

- `hills: [{ id, name, center: [x, z], radius, height }]` — a gentle procedural mound (a raised cosine) that
  `npHeightAt` adds over the flat field before the water cut; a site on a hill flattens to a terrace at the hill's height.
  Hills carry public names only (Twin Peaks, Nob Hill, Russian Hill, Telegraph Hill, Bernal Heights, Potrero Hill); a
  `height` is a map number, never an elevation.
- Water kinds `bay` and `ocean` (open water: no site inside), and the district character `park` (trees, no buildings).

Each SF map was written once by a scratch generator from approximate public lon/lat through one north-up uniform scale of
about 2.2 real metres per map metre (a 9 km box), with one shared coastline clipped to each field, so the districts agree
on the shore; the three boxes overlap, as the parishes do.

| district | id | module | export | sites | hills | connectors |
|---|---|---|---|---|---|---|
| Downtown & Embarcadero | `sf-downtown` | `np-data-sf-downtown.js` | `NP_SF_DOWNTOWN` | 9 | Nob Hill, Russian Hill, Telegraph Hill, Twin Peaks | 5 |
| Mission & SoMa | `sf-mission` | `np-data-sf-mission.js` | `NP_SF_MISSION` | 9 | Potrero Hill, Bernal Heights, Twin Peaks | 5 |
| Golden Gate Park, the Richmond & the Sunset | `sf-golden-gate-park` | `np-data-sf-golden-gate-park.js` | `NP_SF_GOLDEN_GATE_PARK` | 9 | Twin Peaks | 3 |

**Downtown & Embarcadero** — the Embarcadero piers, the Ferry Building landing, the Transbay transit hub, a hospital
campus on Cathedral Hill, a union hall off Market Street, the cable car barn on Nob Hill, a Financial District high-rise,
the Bay Bridge crew yard, the Fisherman's Wharf kitchens. **Mission & SoMa** — the King Street rail yard, a Mission Bay
construction site, a Mission school campus, the China Basin stadium district, a South of Market maker workshop, the
Potrero Avenue hospital, the Potrero bus yard, the Dogpatch shipyard, the Islais Creek pump station. **Golden Gate Park**
— the park's grounds crew yard and nursery, the Ocean Beach lifeguard station and streetcar terminal, the Parnassus
hospital campus, the university on Lone Mountain, the Sunset Reservoir pump house, a Sunset school, a Richmond firehouse;
the Dutch and Murphy windmills, Stow Lake, Spreckels Lake and Lake Merced.

### SF connectors

The ids and points agreed with GOLDEN-B (Marina & Presidio, Bayview & Hunters Point) are fixed; the far end ships
`to.position: null` with the `lonlat` until that district is in the tree. Between GOLDEN-A's own districts each side lists
the crossing under its own id at the same `lonlat`.

| crossing | kind | between | point (lon, lat) | ids |
|---|---|---|---|---|
| Van Ness Avenue north | road | sf-downtown ↔ sf-marina | -122.424, 37.795 | `sf-van-ness-north` |
| The Embarcadero north | road | sf-downtown ↔ sf-marina | -122.415, 37.806 | `sf-embarcadero-north` |
| Park Presidio Boulevard | road | sf-golden-gate-park ↔ sf-marina | -122.472, 37.782 | `sf-park-presidio` |
| Third Street south | road | sf-mission ↔ sf-bayview | -122.389, 37.755 | `sf-third-street-south` |
| The Bayshore Freeway south | road | sf-mission ↔ sf-bayview | -122.404, 37.735 | `sf-bayshore-south` |
| The Bay Bridge to Bay World | world (GOLDEN-B) | sf-downtown → Bay World | -122.387, 37.790 | `sf-bay-bridge` |
| Market Street | road | sf-downtown ↔ sf-mission | -122.419, 37.775 | `sf-dt-market-street`, `sf-mi-market-street` |
| The Embarcadero at King Street | road | sf-downtown ↔ sf-mission | -122.391, 37.777 | `sf-dt-king-street`, `sf-mi-king-street` |
| Geary Boulevard | road | sf-downtown ↔ sf-golden-gate-park | -122.446, 37.782 | `sf-dt-geary-boulevard`, `sf-gp-geary-boulevard` |
| Oak Street at the Panhandle | road | sf-mission ↔ sf-golden-gate-park | -122.447, 37.772 | `sf-mi-oak-street`, `sf-gp-oak-street` |

The Bay Bridge point sits on dry land at the anchorage in the Downtown map, so a learner can walk to GOLDEN-B's way out.
