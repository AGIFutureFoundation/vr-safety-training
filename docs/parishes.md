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
| St. Tammany Parish | `st-tammany` | `np-data-st-tammany.js` | `NP_ST_TAMMANY` | 10 m | 10 | 12 | 2 |

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
- `gated[]` follow the gate contract and also carry `world: "parishes"` with `parish` (the parish id), `siteName` and
  `summary`, ready for the shared lock UI (ASSAYER moved them from `world: "<parish id>"` onto the engine's contract). They are *not* exported as a top-level `*GATED*` array, so `check_gates.mjs` does not discover them
  twice; PARISH's engine can aggregate `NP_*.gated` into one `NP_GATED` export when it mounts the lock UI.
- `connectors[]` carry two extra optional fields, `lonlat` (the agreed crossing point, approximate) and
  `approximate: true`. See below.

## The stylised scale — a recorded decision (console ASSAYER, the Bayou run)

The engine's rule holds a parish between one half and six real metres per map metre, the scale at which Orleans's
streets, pads and massing read at walking pace. DELTA's four parishes are drawn smaller than that on purpose: a whole
parish in one 4096 m field means one map metre stands for several on the ground. That is a decision, not a fault, so
each module declares it in a top-level `scale` (real metres per map metre) and `check_parishes.mjs` holds the fit to the
declared figure within 15 % (and the declared figure between one half and twenty-five) instead of the half-to-six rule:

- `jefferson` (Jefferson Parish): 8 real metres per map metre — both banks from the lake to the West Bank canals.
- `st-bernard` (St. Bernard Parish): 8 real metres per map metre — the river road to the marsh and Shell Beach.
- `plaquemines` (Plaquemines Parish): 20 real metres per map metre — the long river parish from Belle Chasse to Venice;
  at this scale the river is a forty-metre ribbon, so each bank is drawn as levee at 45 m and river road at 78 m from the
  river's centre line (the roads were re-derived from the river so they no longer cross it).
- `st-tammany` (St. Tammany Parish): 10 real metres per map metre — the north shore from Madisonville to Slidell.
- `orleans` declares none and stays under the half-to-six rule.

What the scale costs: walking distances are compressed (a site five hundred map metres away is kilometres on the
ground), building massing reads as district texture rather than blocks, and narrow rivers (the Tchefuncte, the Bogue
Falaya, Bayou Lacombe) are a few metres wide, so a site pad beside one is kept far enough back that the bed stays under
the water line. A new map (the San Francisco districts) declares `scale` the same way when it departs from the rule.

The engine geometry that was deferred at the Crescent gate and fixed here: roads that sampled a river or lake
(Westbank Expressway, Williams Boulevard, St. Bernard Highway, St. Claude Avenue, the Plaquemines river roads and
Woodland Highway, Highway 190, Highway 22, Lakeshore Drive, the Tammany Trace) now run on land; landmarks of kind
`bridge` or `river` stand at a bank or landing (the Huey P. Long Bridge, Caernarvon's bend, the Belle Chasse tunnel, the
twin spans); St. Tammany keeps ten anchors (Big Branch Marsh dropped — the marsh has no single point); the gated items
carry `world: "parishes"`. All five parishes are now in `NP_ENGINE_STRICT`.

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
| Downtown & Embarcadero | `sf-downtown` | `np-data-sf-downtown.js` | `NP_SF_DOWNTOWN` | 9 | Nob Hill, Russian Hill, Telegraph Hill, Twin Peaks, Potrero Hill, Lone Mountain | 5 |
| Mission & SoMa | `sf-mission` | `np-data-sf-mission.js` | `NP_SF_MISSION` | 9 | Potrero Hill, Bernal Heights, Twin Peaks, Nob Hill, Russian Hill, Telegraph Hill, Mount Davidson, Lone Mountain, Mount Sutro | 5 |
| Golden Gate Park, the Richmond & the Sunset | `sf-golden-gate-park` | `np-data-sf-golden-gate-park.js` | `NP_SF_GOLDEN_GATE_PARK` | 9 | Twin Peaks, Mount Davidson, Lone Mountain, Mount Sutro | 3 |

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
| Van Ness Avenue north | road | sf-downtown ↔ sf-marina | -122.424, 37.795 | `sf-dt-van-ness-north`, `sf-ma-van-ness-north` |
| The Embarcadero north | road | sf-downtown ↔ sf-marina | -122.415, 37.806 | `sf-dt-embarcadero-north`, `sf-ma-embarcadero-north` |
| Park Presidio Boulevard | road | sf-golden-gate-park ↔ sf-marina | -122.472, 37.782 | `sf-gp-park-presidio`, `sf-ma-park-presidio` |
| Third Street south | road | sf-mission ↔ sf-bayview | -122.389, 37.755 | `sf-mi-third-street-south`, `sf-bv-third-street-south` |
| The Bayshore Freeway south | road | sf-mission ↔ sf-bayview | -122.404, 37.735 | `sf-mi-bayshore-south`, `sf-bv-bayshore-south` |
| The Bay Bridge to Bay World | world (GOLDEN-B) | sf-downtown → Bay World | -122.387, 37.790 | `sf-bay-bridge` |
| Market Street | road | sf-downtown ↔ sf-mission | -122.419, 37.775 | `sf-dt-market-street`, `sf-mi-market-street` |
| The Embarcadero at King Street | road | sf-downtown ↔ sf-mission | -122.391, 37.777 | `sf-dt-king-street`, `sf-mi-king-street` |
| Geary Boulevard | road | sf-downtown ↔ sf-golden-gate-park | -122.446, 37.782 | `sf-dt-geary-boulevard`, `sf-gp-geary-boulevard` |
| Oak Street at the Panhandle | road | sf-mission ↔ sf-golden-gate-park | -122.447, 37.772 | `sf-mi-oak-street`, `sf-gp-oak-street` |

The Bay Bridge point sits on dry land at the anchorage in the Downtown map, so a learner can walk to GOLDEN-B's way out.

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
| Van Ness Avenue | road | sf-marina ↔ sf-downtown | -122.424, 37.795 | `sf-ma-van-ness-north` |
| Bay Street to the Embarcadero | road | sf-marina ↔ sf-downtown | -122.415, 37.806 | `sf-ma-embarcadero-north` |
| Park Presidio Boulevard | road | sf-marina ↔ sf-golden-gate-park | -122.472, 37.782 | `sf-ma-park-presidio` |
| The Golden Gate Bridge | bridge | sf-marina → marin-headlands (no map yet) | -122.478, 37.829 | `sf-golden-gate-bridge` |
| Third Street | road | sf-bayview ↔ sf-mission | -122.389, 37.755 | `sf-bv-third-street-south` |
| Bayshore Boulevard | road | sf-bayview ↔ sf-mission | -122.404, 37.735 | `sf-bv-bayshore-south` |
| The Bay Bridge | world | sf-downtown → Bay World (West Oakland) | -122.387, 37.790 | `sf-bay-bridge` |

**A `world` connector** leaves a district for another world's page: `to: { world, site, name, href }` with
`href` the other world's page and `?site=` in the source layout (`../bayworld/index.html?site=west-oakland-union-hall`,
flattened by the bundler to `./bayworld.html?site=…`). World ways live in `shared/sg-ways.js` keyed by the district
they leave; `npResolveConnectors` appends them and projects the `from` end through that district's fit, so a district's
module is never edited to carry one. The parishes app draws a world way as a way out (a tall gold post and a map
label) and crosses with `lkWorldLink` (`&from=parishes&return=<page>#site=<district>/<site>`, encoded); the passport
lives in the origin's storage and crosses with the learner. Bay World's Atlas and its map carry the way back,
`../parishes/parishes.html?parish=sf-downtown`.

## Oakland & the East Bay — the third region (console BAYMAP)

Region `oakland` ("Oakland & East Bay Districts", a map is a *district*) in `NP_REGIONS` and in check_parish_data's
`ND_REGIONS`. Three 4096 m districts on the same schema (with `hills`), written once by a scratch generator from
approximate public lon/lat through one north-up uniform scale of about 2.1 real metres per map metre, with one shared
East Bay shoreline, the Oakland Estuary (a ribbon), Lake Merritt and the creeks clipped to each field, so the districts
agree on the shore; the boxes overlap. Site names and crews are procedural training places; real places are named only.

| district | id | module | export | sites | hills | connectors |
|---|---|---|---|---|---|---|
| West Oakland & the Port | `oak-west-oakland` | `np-data-oak-west-oakland.js` | `NP_OAK_WEST_OAKLAND` | 13 | — (the shore walls give relief) | 4 |
| Downtown Oakland & Lake Merritt | `oak-downtown-lake` | `np-data-oak-downtown-lake.js` | `NP_OAK_DOWNTOWN_LAKE` | 12 | Adams Point, the Piedmont hills, the Oakland hills (the field's east edge) | 4 |
| Fruitvale & the Estuary | `oak-fruitvale-estuary` | `np-data-oak-fruitvale-estuary.js` | `NP_OAK_FRUITVALE_ESTUARY` | 12 | the Oakland hills, Lincoln Highlands | 3 |

**West Oakland & the Port** — the Outer Harbor and Seventh Street container terminals, the port's crane shop and truck
staging yard, the rail yard, the Mandela Parkway union hall and warehouse row, a school campus, the deFremery recreation
centre, the transit station, an air monitoring station, a substation by the Emeryville shore and the Bay Bridge toll
plaza crew yard. **Downtown Oakland & Lake Merritt** — the civic centre on Frank Ogawa Plaza, a downtown high-rise site,
the Uptown theatre stage crew (the Fox Theater and the Paramount Theatre stand as places), the Pill Hill hospital
campus, the Laney College campus by the channel, the Lakeside Park grounds crew and the boating dock on Lake Merritt, a
bus yard, Chinatown's kitchens, Jack London's hotel row, a downtown fire station and a tower plant room. **Fruitvale &
the Estuary** — the Fruitvale public market and transit station, Brooklyn Basin's marina, the Alameda estuary boatyard,
a school campus, a metal workshop on the Embarcadero, the San Leandro Bay shoreline crew, a fire station, the High
Street warehouse yard, the Sausal Creek storm drain crew, the Fruitvale Bridge crew and a community clinic.

### Oakland connectors

Each side lists the crossing under its own district-prefixed id at the same `lonlat`; the far end is projected from
that shared lon/lat through the other district's fit.

| crossing | kind | between | point (lon, lat) | ids |
|---|---|---|---|---|
| West Grand Avenue | road | oak-west-oakland ↔ oak-downtown-lake | -122.281, 37.815 | `bm-wo-west-grand`, `bm-dl-west-grand` |
| Broadway at Jack London Square | road | oak-west-oakland ↔ oak-downtown-lake | -122.276, 37.797 | `bm-wo-jack-london`, `bm-dl-jack-london` |
| International Boulevard | road | oak-downtown-lake ↔ oak-fruitvale-estuary | -122.250, 37.793 | `bm-dl-international`, `bm-fe-international` |
| The Embarcadero along the estuary | road | oak-downtown-lake ↔ oak-fruitvale-estuary | -122.258, 37.789 | `bm-dl-embarcadero`, `bm-fe-embarcadero` |
| Webster Street through the tube (Alameda) | road | oak-west-oakland ↔ oak-fruitvale-estuary | -122.2764, 37.787 | `bm-wo-webster-tube`, `bm-fe-webster-tube` |
| The Bay Bridge (mid-crossing, by Yerba Buena Island) | bridge | oak-west-oakland ↔ sf-downtown | -122.358, 37.812 | `bm-wo-bay-bridge-west`, `sf-dt-bay-bridge-east` |
| Into Bay World's West Oakland | world (`bm-ways.js`) | oak-west-oakland → Bay World | -122.290, 37.809 | `bm-wo-bay-world` |
| Into Bay World's Lake Loop | world (`bm-ways.js`) | oak-downtown-lake → Bay World | -122.247, 37.805 | `bm-dl-bay-world` |
| Into Bay World's estuary waterfront | world (`bm-ways.js`) | oak-fruitvale-estuary → Bay World | -122.245, 37.786 | `bm-fe-bay-world` |

The Bay Bridge is now a walkable bridge between the regions as well as GOLDEN-B's world way: `sf-dt-bay-bridge-east`
leaves Downtown from the anchorage, `bm-wo-bay-bridge-west` leaves West Oakland from the toll plaza, and both name the
mid-crossing point both fields hold. The world ways live in `shared/bm-ways.js` (GOLDEN-B's pattern) and are appended by
`npResolveConnectors`, so the district modules never carry a `world` connector.

## More of the Bay Area — Emeryville & Berkeley, San Pablo & Richmond, Downtown San Jose (console EASTBAY)

Three more 4096 m districts on the same schema (with `hills`), written once by a scratch generator (BAYMAP's projection
and clipping) from approximate public lon/lat through one north-up uniform scale of about two real metres per map metre,
with one shared shore north of Oakland clipped to each East Bay field. Two new regions follow Oakland in `NP_REGIONS`
and in check_parish_data's `ND_REGIONS`: `north-east-bay` ("North East Bay Districts") and `south-bay` ("South Bay
Districts"). `bay-san-pablo` is in `north-east-bay`, not `oakland`: San Pablo and Richmond are Contra Costa cities on San
Pablo Bay, the `oakland` region's convention is `oak-` ids with BAYMAP's `bm-` ways into Bay World, and the region leaves
room for the rest of that shore. The incoming Bay Program maps (`bp-strip-marsh-east` on San Pablo Bay along Highway 37,
`bp-san-leandro-bay`) lie outside all three boxes. Hills sit at their approximate public lon/lat projected through each
map's own fit; heights are schematic. The two EPA San Francisco Bay Program projects named for these cities (the City
of San Jose's green stormwater infrastructure implementation plan; the City of San Pablo's green stormwater
infrastructure to capture and treat stormwater runoff) are told once each, as worded in the program's facts, in a
procedural stormwater crew's blurb.

| district | id | module | export | region | sites | hills | connectors |
|---|---|---|---|---|---|---|---|
| Emeryville & Berkeley's Waterfront | `oak-emeryville-berkeley` | `np-data-oak-emeryville-berkeley.js` | `NP_OAK_EMERYVILLE_BERKELEY` | `oakland` | 13 | the Berkeley Hills, Albany Hill | 3 |
| San Pablo & Richmond's Shore | `bay-san-pablo` | `np-data-bay-san-pablo.js` | `NP_BAY_SAN_PABLO` | `north-east-bay` | 13 | the Point Richmond hills, the El Cerrito hills | 2 |
| Downtown San Jose | `bay-san-jose` | `np-data-bay-san-jose.js` | `NP_BAY_SAN_JOSE` | `south-bay` | 13 | — (flat; the Guadalupe River's flood walls give relief) | 2 |

**Emeryville & Berkeley's Waterfront** — Emeryville's rail station, warehouse studios and a lab building site, the
Aquatic Park storm drain crew, the Berkeley Marina harbour, the Eastshore shoreline crew, a maker workshop in West
Berkeley, the downtown transit station and civic centre, the university campus plant under the Berkeley Hills, a school,
a fire station and a hospital campus; the Berkeley Pier, Sather Tower, Aquatic Park, Albany Hill and Eastshore State
Park stand as places. **San Pablo & Richmond's Shore** — the Richmond transit station and civic centre on Macdonald
Avenue, the Marina Bay harbour, a shipyard crew and the harbour terminal on the inner harbour, a refinery turnaround
yard, the San Pablo stormwater crew by Wildcat and San Pablo creeks, a school, a hospital campus, a fire station, the
rail yard, a substation and the Point Isabel shoreline crew; the Rosie the Riveter Memorial and Point Richmond stand as
places. **Downtown San Jose** — the Diridon transit hub, the university campus plant, the civic centre, the downtown
stormwater crew yard, the Guadalupe River Park grounds yard, a high-rise site, the convention centre stage crew, a
hospital campus, the airport ramp at the north edge, the North First Street rail barn, a fire station, a school and a
union hall; the Guadalupe River (a channel), Los Gatos Creek and Coyote Creek are its water.

### EASTBAY connectors

| crossing | kind | between | point (lon, lat) | ids |
|---|---|---|---|---|
| San Pablo Avenue at the Oakland–Emeryville line | road | oak-west-oakland ↔ oak-emeryville-berkeley | -122.287, 37.836 | `eb-wo-san-pablo-avenue-north`, `eb-em-san-pablo-avenue-south` |
| San Pablo Avenue at the Albany–El Cerrito line | road | oak-emeryville-berkeley ↔ bay-san-pablo | -122.300, 37.899 | `eb-em-san-pablo-avenue-north`, `eb-sp-san-pablo-avenue-south` |
| The Eastshore Freeway at Albany | road | oak-emeryville-berkeley ↔ bay-san-pablo | -122.311, 37.899 | `eb-em-eastshore-north`, `eb-sp-eastshore-south` |
| The Alameda toward Santa Clara | road | bay-san-jose → bay-santa-clara (no map yet) | -121.930, 37.342 | `eb-sj-alameda-north` |
| The Bayshore Freeway toward the Peninsula | road | bay-san-jose → bay-peninsula (no map yet) | -121.933, 37.371 | `eb-sj-bayshore-north` |

## San Francisco, walkable — three more districts (console NEIGHBORHOODS)

Three districts on the same schema in region `san-francisco`, drawn at a walkable scale so the 4096 m field is the
walk (docs/consoles/NEIGHBORHOODS.md). Each declares its `scale` (real metres per map metre), which check_parishes
holds the fit to within 15 % and check_parish_data uses for the field's ground width:

- `sf-north-beach` (North Beach, Chinatown & Fisherman's Wharf): 1 real metres per map metre — one to one.
- `sf-haight-castro` (Haight, Castro & Twin Peaks): 1 real metres per map metre — one to one.
- `sf-sunset-south` (the Sunset & Ocean Beach south): 1.2 real metres per map metre — so Ocean Beach and the
  university campus fit one field.

Hills are placed where they are in the city: each `center` is the named hill's approximate lon/lat projected through
the district's own fit, the radius follows the hill's footprint, the height is schematic (a map number). Written once
by `tools/gen_sn_districts.mjs`; the modules are the source afterwards.

| district | id | module | export | sites | hills | connectors |
|---|---|---|---|---|---|---|
| North Beach, Chinatown & Fisherman's Wharf | `sf-north-beach` | `np-data-sf-north-beach.js` | `NP_SF_NORTH_BEACH` | 14 | Telegraph Hill, Russian Hill, Nob Hill | 3 |
| Haight, Castro & Twin Peaks | `sf-haight-castro` | `np-data-sf-haight-castro.js` | `NP_SF_HAIGHT_CASTRO` | 14 | Twin Peaks, Mount Sutro, Corona Heights, Buena Vista, Tank Hill, Alamo Square | 4 |
| the Sunset & Ocean Beach South | `sf-sunset-south` | `np-data-sf-sunset-south.js` | `NP_SF_SUNSET_SOUTH` | 14 | Merced Heights | 3 |

**Why not SoMa & Mission Bay.** `npBounds(sf-mission)` is lon −122.459 … −122.357, lat 37.722 … 37.804: SoMa and
Mission Bay lie inside it (sf-mission already holds the King Street rail yard, a Mission Bay construction site and the
China Basin stadium district), so the third district is the Sunset & Ocean Beach south instead — south of the coarse
fields' 37.722° edge on the ocean side and west of the incoming `sf-outer-mission` (south of sf-mission's 37.722° edge).

**Overlap.** The five coarse SF fields already cover the whole city north of 37.722° and overlap each other, so a
walkable North Beach or Haight/Castro lies inside them by construction. The rule held by check_parishes: the walkable
fields never overlap each other; none reaches into the sf-outer-mission area (south of 37.722°, east of −122.459°)
beyond a connector margin; and no walkable site duplicates a coarse site on the ground.

**Landmarks** are named places whose `kind` is LANDMARKS' registry name where one exists — Coit Tower
(`coit-tower`), the Transamerica Pyramid (`transamerica-pyramid`), the cable car turntables at Hyde Street and Powell
Street (`cable-car-turntable`), Pier Thirty-Nine (`wharf-pier-shed`), the Ferry Building (`ferry-building`), the
Painted Ladies (`painted-ladies`), a Victorian house in the Haight (`victorian-house`) — plus Lombard Street's
switchbacks, the Castro's theatre marquee, Sutro Tower, Twin Peaks, Lake Merced, Fort Funston and Ocean Beach. Until
`lm-landmarks.js` merges the engine draws its generic landmark.

| crossing | kind | between | point (lon, lat) | ids |
|---|---|---|---|---|
| The Embarcadero at the Ferry Building | road | sf-north-beach ↔ sf-downtown | -122.391, 37.788 | `sf-nb-embarcadero-south`, `sf-dt-north-beach-embarcadero` |
| Powell Street at Union Square | road | sf-north-beach ↔ sf-downtown | -122.408, 37.785 | `sf-nb-powell-south`, `sf-dt-north-beach-powell` |
| Bay Street at Fort Mason | road | sf-north-beach ↔ sf-marina | -122.432, 37.805 | `sf-nb-bay-street-west`, `sf-ma-north-beach-bay-street` |
| Fell Street at Golden Gate Park | road | sf-haight-castro ↔ sf-golden-gate-park | -122.454, 37.772 | `sf-hc-fell-street-west`, `sf-gp-haight-castro-fell` |
| Market Street toward Church Street | road | sf-haight-castro ↔ sf-mission | -122.422, 37.772 | `sf-hc-market-street-east`, `sf-mi-haight-castro-market` |
| Seventeenth Street | road | sf-haight-castro ↔ sf-mission | -122.421, 37.763 | `sf-hc-seventeenth-street-east`, `sf-mi-haight-castro-seventeenth` |
| Divisadero Street at Geary | road | sf-haight-castro ↔ sf-downtown | -122.439, 37.781 | `sf-hc-divisadero-north`, `sf-dt-haight-castro-divisadero` |
| The Great Highway along Ocean Beach | road | sf-sunset-south ↔ sf-golden-gate-park | -122.505, 37.743 | `sf-ss-great-highway-north`, `sf-gp-sunset-great-highway` |
| Nineteenth Avenue | road | sf-sunset-south ↔ sf-golden-gate-park | -122.475, 37.743 | `sf-ss-nineteenth-avenue-north`, `sf-gp-sunset-nineteenth` |
| Ocean Avenue at the Sunset–Outer Mission line | road | sf-sunset-south ↔ sf-outer-mission | -122.458, 37.721 | `sf-ss-ocean-avenue-east`, `sf-om-ocean-avenue-west` |

## Hills — approximate positions (console RELIEF)

Every named hill on the San Francisco and Oakland maps sits at the **approximate position** of the public hill it names:
the hill's approximate longitude and latitude (rounded to three decimals, public geography) is pushed through that map's
own fit (`npGeoToXz` in `shared/np-geo.js`) and the hill's `center` is placed there, or left where it was when it already
lay within its own radius. Heights stay schematic map numbers, relative to one another (Twin Peaks and Mount Davidson the
tallest mounds, Lone Mountain and Adams Point small ones); they are not measurements, the mounds are raised cosines, and
nothing here claims survey accuracy. The audit re-runs from `docs/consoles/RELIEF.md`'s cycle 1.

| map | moved (was off by more than its radius) | added (inside the field) | left out |
|---|---|---|---|
| `sf-downtown` | — | Potrero Hill, Lone Mountain | Pacific Heights (not on the owner's list) |
| `sf-mission` | — | Nob Hill, Russian Hill, Telegraph Hill, Mount Davidson, Lone Mountain, Mount Sutro | — |
| `sf-golden-gate-park` | — | Mount Davidson, Lone Mountain (its crown on the campus pad, a terrace), Mount Sutro | — |
| `sf-marina` | — | Nob Hill (a school campus pad terraced on it), Telegraph Hill, Lone Mountain | — |
| `sf-bayview` | Bayview Hill | Potrero Hill | Hunters Point hill kept where it was: its position is not certain enough to move |
| `oak-west-oakland` | — | — | none inside the field (the hills' edge and Adams Point lie east of it) |
| `oak-downtown-lake` | Adams Point (the Lakeside Park pad now terraced on it) | the Oakland hills (the field's east edge) | — |
| `oak-fruitvale-estuary` | Lincoln Highlands | — | — |

A site near a hill is either clear of the mound or stands on a terrace at the hill's height (`check_parishes`'s hill
checks). Maps added later place their own hills the same way.

With a viewer's Mapbox token, the relief under any map can also follow the real ground: see "Relief from Mapbox
Terrain-RGB" in [mapbox.md](mapbox.md). Without one, the hills above are the only relief.


## Bay Program project areas (region `bay-program`, console TIDELANDS)
The 2026 EPA San Francisco Bay Program awards name eight projects (the facts file, `epa-2026-facts.md`, is the only source);
three of their places are walkable here, each a strict-engine 4096 m map at about 2.2 real metres per map metre. Every map is
laid out from the place's approximate lon/lat frame, the shoreline's general orientation, the named water, highways and creeks,
and the land-use character — **procedural in detail**, never a survey, and no place is described with a figure. The region's
noun is "site area". sf-mission's field ends at about 37.722 N (from its fit); the Outer Mission lies south of that, so it is its
own district in the San Francisco region (every `sf-` map names that region).
| map | id | module | export | region | sites | connectors |
| Strip Marsh East | `bp-strip-marsh-east` | `np-data-bp-strip-marsh-east.js` | `NP_BP_STRIP_MARSH_EAST` | bay-program | 10 | 2 |
| San Leandro Bay & San Leandro Creek | `bp-san-leandro-bay` | `np-data-bp-san-leandro-bay.js` | `NP_BP_SAN_LEANDRO_BAY` | bay-program | 10 | 2 |
| Outer Mission & Excelsior | `sf-outer-mission` | `np-data-sf-outer-mission.js` | `NP_SF_OUTER_MISSION` | san-francisco | 10 | 2 |
**Strip Marsh East** (ABAG's project: sediment reused from excavating new tidal channels and lowering berms) — San Pablo Bay,
the strip marsh and the Napa-Sonoma Marshes as wetland, Sonoma Creek and Dutchman Slough, two procedural new tidal channels,
the highway levee and the bay-front berm; sites for tidal channel excavation, berm lowering, sediment reuse placement, a
monitoring station, a staging yard, a levee patrol point, a slough culvert crew, a planting crew, a nesting-season watch and a
sediment sampling station. **San Leandro Bay** (the City of San Leandro's two large trash capture devices) — San Leandro Bay,
San Francisco Bay, Arrowhead Marsh, San Leandro Creek and a procedural storm drain channel; the two trash capture device
sites, the storm drain crew, the creek mouth restoration, the shoreline park, industrial frontage, outfall monitoring, a tide
line clean-up point, the shoreline levee and the corporation yard. **Outer Mission** (the SFPUC's green stormwater
infrastructure) — planted sidewalk filtration, a rain garden block, the underground infiltration site, a school campus, the
Mission Street transit corridor, a sewer crew yard, a locate crew, a soil yard, a planting crew and a maintenance crew.
| Mission Street | road | sf-outer-mission ↔ sf-mission | -122.426, 37.730 | `sf-om-mission-street`, `sf-mi-outer-mission-street` |
| Alemany Boulevard at the Bayshore Freeway | road | sf-outer-mission ↔ sf-mission | -122.405, 37.725 | `sf-om-alemany`, `sf-mi-outer-alemany` |
| Ocean Avenue at the Sunset–Outer Mission line | road | sf-outer-mission ↔ sf-sunset-south | -122.458, 37.721 | `sf-om-ocean-avenue-west`, `sf-ss-ocean-avenue-east` |
| The Nimitz Freeway | road | bp-san-leandro-bay ↔ oak-fruitvale-estuary | -122.195, 37.750 | `bp-sl-nimitz-fruitvale`, `bm-fe-nimitz-san-leandro` |
| International Boulevard | road | bp-san-leandro-bay ↔ oak-fruitvale-estuary | -122.182, 37.751 | `bp-sl-international-fruitvale`, `bm-fe-international-san-leandro` |
| Highway Thirty-Seven west | road | bp-strip-marsh-east → Sears Point (no map yet) | -122.397, 38.149 | `bp-sm-highway-37-west` |
| Highway Thirty-Seven east | road | bp-strip-marsh-east → Vallejo (no map yet) | -122.294, 38.140 | `bp-sm-highway-37-east` |
The Fruitvale crossings: Fruitvale's field reaches San Leandro Bay (its Nimitz Freeway ends at about -122.195, 37.750), so
BAYMAP's `oak-fruitvale-estuary` should list both crossings back under its own ids at the same `lonlat` when the Oakland region
merges; until then the far end ships `to.position: null` and `npResolveConnectors` fills it.

## Every announced project, walkable (console PROJECTLANDS)
Console PROJECTLANDS (docs/consoles/PROJECTLANDS.md) gives each project named in the facts file (`epa-2026-facts.md`) and the
Port of Oakland's Clean Ports award a walkable place on the parish engine. Two new strict-engine 4096 m maps in region
`bay-program` at about 2.2 real metres per map metre, and **project precincts** (sites marked `"precinct": true`) on the maps
that already hold a project. Before either map was written its lon/lat box was checked against all 22 existing maps' `npBounds`:
neither overlaps any (the nearest, sf-outer-mission, ends at 37.676 N; bay-san-pablo at 37.972 N; bp-strip-marsh-east begins at
38.095 N). **Representative** maps carry `representative: true`, say so in their name, blurb, header and on a sign landmark, and
never imply that a real plant, property or facility is part of a project.

| map | id | module | export | region | sites | connectors |
| San Mateo County Bayside (representative) | `bp-san-mateo-shoreline` | `np-data-bp-san-mateo-shoreline.js` | `NP_BP_SAN_MATEO_SHORELINE` | bay-program | 13 | 2 |
| A Nutrient Pilot Plant on San Pablo Bay (procedural, representative) | `bp-nutrient-pilot` | `np-data-bp-nutrient-pilot.js` | `NP_BP_NUTRIENT_PILOT` | bay-program | 13 | 2 |

**San Mateo County Bayside** (C/CAG: monitor and control PCB sources; the project's sites are not named) — a representative
bayside industrial area on the county's shore of San Francisco Bay: the bay to the north-east, the Bayshore Freeway, a procedural
tidal slough and flood control channel, the bayfront levee and marsh edge, and the Peninsula hills at the field's south-west
corner. Sites: a soil sampling grid, the decontamination line, storm drain sediment sampling, regulated soil load-out, old
electrical equipment removal, a drum staging yard, the channel mouth monitoring point, a marsh edge sediment survey, a street
drain clean-out crew, the sample intake desk, the levee patrol, perimeter air monitoring and an excavation cell.
**The nutrient pilot plant** (BACWA: five pilot projects aimed at reducing nutrient inputs to San Francisco Bay; where they run
is not stated) — a procedural wastewater treatment plant on a stretch of San Pablo Bay's southern shore that no map covers; only
the water body is named. Sites: operator rounds, the chemical feed building, the aeration basin deck, a pilot process skid, the
digester complex, the plant laboratory, the outfall monitoring landing, the chemical delivery dock, the plant substation, the
pump and blower shop, the shoreline marsh crew, the solids load-out and the shoreline levee walk; hills rise behind the shore.

**The Port of Oakland: a precinct, not a new map.** `npBounds(oak-west-oakland)` is lon −122.361 … −122.263, lat 37.773 … 37.851:
the Outer Harbor, the Middle Harbor and the Seventh Street terminals all lie inside it, so the seaport gets a project precinct
there — two trash capture device sites (the release says four devices on port property but not where; the placement is
procedural and the sites say so), the seaport charging yard, the battery energy storage site, zero-emission drayage staging and
the zero-emission cargo equipment yard (the Clean Ports activities, as the facts file states them).

**Precincts on the other project maps.** `bay-san-jose` — the street survey crew, a site assessment and the planning studio (the
kinds of work a green stormwater infrastructure implementation plan rests on; the City's project is still told once, at the
stormwater crew yard). `bay-san-pablo` — a bioretention build site, a stormwater monitoring point and an underdrain and piping
crew (building and monitoring green stormwater infrastructure). `bp-strip-marsh-east` — a small-boat crew landing, a
water-control structure crew and a swamp mat crossing. `bp-san-leandro-bay` — vacuum truck staging and a debris haul transfer
point. `sf-outer-mission` — an underdrain piping crew and a green infrastructure monitoring crew. The precincts are written once
by `tools/gen_pj_precincts.py`; the modules are the source afterwards. UNIONSIMS' `us-` stations and simulations are listed per
precinct in `shared/pj-precincts.js` behind a guard (an id counts only once it is in the catalog).

| crossing | kind | between | point (lon, lat) | ids |
|---|---|---|---|---|
| The Bayshore Freeway north-west | road | bp-san-mateo-shoreline → bay-peninsula (no map yet) | -122.295, 37.527 | `bp-smc-bayshore-north-west` |
| The Bayshore Freeway south-east | road | bp-san-mateo-shoreline → bay-peninsula-south (no map yet) | -122.209, 37.481 | `bp-smc-bayshore-south-east` |
| The shoreline road west | road | bp-nutrient-pilot → bay-north-shore-west (no map yet) | -122.320, 38.035 | `bp-npp-shoreline-west` |
| The shoreline road east | road | bp-nutrient-pilot → bay-north-shore-east (no map yet) | -122.220, 38.027 | `bp-npp-shoreline-east` |
Neither new map meets another map, so both carry pending ways out only (no pair to write).

## Programme Worlds (region `programmes`, console SMILES)

A programme world is a **procedural** district built for one programme — **not a real place**. It sits on the parish engine
(strict, same budgets, chunks and schema) so the site boards, field lessons, gated items and side games all work as on a parish.

- `sm-unspoken-smiles` — **Unspoken Smiles District** (`WebXR/shared/np-data-sm-unspoken-smiles.js`), for
  `dental-hygiene-unspoken-smiles` and `dental-careers-unspoken-smiles`. Fifteen procedural sites carrying the real dental
  stations: the community dental clinic, its sterilisation centre, surgical suite, front office and service yard (adult
  training only), the school tooth-brushing station, the mobile dental van stop, the community centre, the healthy-food
  market, the water fountain plaza, Smile Park, the dental-careers training centre, the dental laboratory workshop, the health
  fair screening tent and the senior centre. Five K-12 field lessons (`sm-fl-*`), two gated side quests (`sm-gated-*`).
- **The geo frame is nominal.** The engine needs anchors, so this world's anchors sit on a nominal frame at zero longitude and
  zero latitude (open ocean): they assert no place. Declared scale: **1.1 real metres** per map metre (a walkable 4 km
  district). No satellite ground is loaded for it.
- Connectors `sm-way-west` and `sm-way-south` are ways out toward future programme worlds (`programme-worlds-west`,
  `programme-worlds-south`); they stay pending until such a world is registered.
- Games and treasures on this map: `WebXR/shared/sm-smiles.js` (console SMILES, `docs/consoles/SMILES.md`); checker
  `tools/check_smiles.mjs`.

## Lake Charles and Calcasieu Parish (console SOUTHWEST)

Three strict-engine 4096 m maps (docs/consoles/SOUTHWEST.md), written once by `tools/gen_sw_districts.mjs` from approximate public
lon/lat through one north-up uniform scale per map (2.2 real metres per map metre for the two Lake Charles maps, 2.0 for Vinton).
The lake, the Calcasieu River, the ship channel, the Intracoastal Waterway, Prien Lake, Contraband Bayou, the interstates and the
towns follow their real position — water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified
Copernicus Sentinel data 2026); every other feature and every site is procedural. **The project layout is illustrative; the
parish, waterways and towns are real** — said in each blurb, module header and on a sign landmark. Project facts come only from
the Louisiana facts file (Woodside Louisiana LNG: $17.5 billion final investment decision in Calcasieu Parish; FastSites: $5.9
million at the Port of Vinton for a 600 ft × 50 ft barge berth); no partnership with any company, agency or union is claimed, and
no city growth figure is stated. Before the maps were written each box was checked against every map's `npBounds`: none overlaps.

| map | id | module | export | region | sites | connectors |
|---|---|---|---|---|---|---|
| Lake Charles Lakefront & Downtown | `lc-lakefront-downtown` | `np-data-lc-lakefront-downtown.js` | `NP_LC_LAKEFRONT_DOWNTOWN` | louisiana-cities | 20 | 3 |
| the Calcasieu Ship Channel | `lc-calcasieu-channel` | `np-data-lc-calcasieu-channel.js` | `NP_LC_CALCASIEU_CHANNEL` | louisiana-sites | 19 | 2 |
| the Port of Vinton | `lc-port-of-vinton` | `np-data-lc-port-of-vinton.js` | `NP_LC_PORT_OF_VINTON` | louisiana-sites | 18 | 2 |

**Lake Charles Lakefront & Downtown** — the lake with the interstate along its north shore and its high bridge over the river,
Westlake across the river, the city docks below the lake, Prien Lake and the Interstate Two-Ten bridge at the south-west corner,
Contraband Bayou and the university campus. Sites: the workforce centre (start), the bridge crew, the promenade grounds crew, the
civic centre stage crew, a downtown high-rise, the Ryan Street streetscape crew, the locate crew, the storm drain crew, the south
shore bulkhead crew, a hospital campus, a fire station, a school, the bus yard, the boat launch, the Westlake river yard, a
substation, a trades hall, a storm roof crew, the university grounds crew and the Prien Lake park crew.
**The Calcasieu Ship Channel** — the channel on the field's west side with open water beside it, the Gulf Intracoastal Waterway
along the south, marsh on the east bank, farm roads and fields; the project site area (illustrative) on the east bank: module
sets, the marine offload berth, the pipe rack, heavy-haul road, tank foundation, piling, laydown, the crane pad, hydrotest,
insulation, the site substation, the control building, the flare area, the berth dredge, a marsh mat road, the gate and fire
water (every project site `precinct: true`), plus a waterway crew landing. No facility visible on the ground is part of a lesson.
**The Port of Vinton** — Vinton on Interstate Ten and US Highway Ninety, the port's barge waterway and turning basin (procedural),
the new berth's bulkhead, rice fields and marsh; the berth build, site preparation, rail and road, the sheet-pile wall, dredging,
mooring dolphins, the crane pad, culverts, the environmental survey, laydown, utilities, the port office (start), the truck gate,
a warehouse, Vinton's main street, a fire station, a school and a rice field drainage crew.

| crossing | kind | between | point (lon, lat) | ids |
|---|---|---|---|---|
| The road south toward the ship channel | road | lc-lakefront-downtown ↔ lc-calcasieu-channel | -93.260, 30.174 | `sw-ld-big-lake-road-south`, `sw-cc-big-lake-road-north` |
| Interstate Ten west | road | lc-lakefront-downtown → lc-sulphur (no map yet) | -93.272, 30.240 | `sw-ld-i10-west` |
| Interstate Ten east | road | lc-lakefront-downtown → lc-east-calcasieu (no map yet) | -93.178, 30.234 | `sw-ld-i10-east` |
| The farm road east | road | lc-calcasieu-channel → lc-east-calcasieu-south (no map yet) | -93.253, 30.139 | `sw-cc-farm-road-east` |
| Interstate Ten west toward Texas | road | lc-port-of-vinton → sabine-texas-line (no map yet) | -93.622, 30.202 | `sw-pv-i10-west` |
| Interstate Ten east toward Sulphur | road | lc-port-of-vinton → lc-sulphur (no map yet) | -93.538, 30.199 | `sw-pv-i10-east` |
