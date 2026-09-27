# SmartCiti.X ~ Holodeck — overview for investors and partners

*A working prototype, described from its own data. Every figure is produced by the repository's generators and checkers (`tools/gen_investor.mjs`, `tools/eval_content.mjs`, `tools/check_all.mjs`) and can be re-run. The companion workbook `SmartCitiX-Investor-Pack.xlsx` holds the row-level data; `docs/investor/` holds the same data as CSV and JSON with a source for every value. No revenue, price, market or user figure is stated, because none exists yet.*

## The idea in one paragraph

Union trades train people for work that can hurt them, on equipment and in places a classroom cannot reach. SmartCiti.X ~ Holodeck puts that training in a game people want to open: a free-roam Bay Area city, a harbour with a racing fleet, a dive world under the bay and a golf and sports park. Every job board in those worlds opens a graded procedure, written to the standards the trades' own training bodies publish, scored on what the learner did and whether they did anything unsafe. The same build runs in a phone browser, on a laptop and in a headset, and exports to Unity.

## Where the prototype stands

| Measure | Now |
|---|---|
| Graded procedures | 630 (621 city stations and 9 trade-skills rooms) |
| Training programmes | 54, each a twenty-level ladder |
| Content eval mean | 95.7 of 100 · 511 procedures at 95 or more, 114 at 90–94, 5 below 90 |
| Unions in the registry | 111, with their training bodies |
| Standards cited in registry form | 509 entries across 95 bodies |
| Automated checkers on every change | 58, all passing |
| Open worlds | 4 (Bay World, the Deep, Bay Regatta, Fairway Park) plus 7 scenic districts |
| 3D builders | 131 (37 equipment rigs, 33 props, 21 tools, 20 vehicles, 12 boats, 7 wildlife kinds, 1 sky) |
| App pages and interfaces | 66 |
| Unity export | every procedure, programme and world as JSON, a C# runtime, 90 models |

## The open worlds

- **Bay World** — a 2400 × 1600 m stylised city: 16 zones, 50 job sites, 28 public landmarks, 15 connected roads. Walk or drive; day turns to night; weather drifts and moves wind and fog into play; gulls, pelicans, shorebirds and seals along the shore. 113 quests, 34 easter eggs and 6 scored activities, including a harbour cruise, pier fishing with catch and release, and a delivery run scored on the same driving checks as the Class A stations.
- **The Deep** — a 2000 × 1400 m seabed: 14 zones, 32 dive sites, 25 landmarks, 17 dive lines. Swim or pilot a tethered ROV with a buddy line, an ascent line at every site, and a reserve shown as a bar and a word, never a number. 36 dives, 24 lantern eggs and 4 scored activities.
- **Bay Regatta** — twelve individually named motor yachts berthed at four marinas, three race courses and five hosted events. Every cast-off starts with a safety briefing; every run is scored on marks rounded, no-wake speed, right of way and a clean docking. Nothing is staked or bought.
- **Fairway Park** — an original nine-hole course, par 36, and an outdoor sports facility, with a grounds-crew programme that turns the course into landscaping work.
- **Bay Atlas** — every site and landmark with its programmes and deep links, over a built-in map or a real Bay Area map when a viewer supplies a Mapbox token.

Two things are absent on purpose, and checkers enforce both: violence and gambling.

## Assets, tools, vehicles and boats

Every asset is built in code from primitives and procedural textures, so the platform ships no third-party model it lacks a licence for, and every asset has named working parts a procedure can reach (a door that opens, a boom that luffs, a valve that turns).

- **Equipment (37):** excavators, cranes, lifts, compactors, pile drivers, a regional jet with its ground-support fleet, warehouse automation, a rolling-mill stand, a ladle crane and a continuous miner, among others.
- **Vehicles (20):** a Class 8 tractor with sleeper, five trailers (dry van, flatbed, reefer, tanker, pup), a coupled tractor-trailer, box truck, pickup, sedan, cargo van, a walk-in delivery van, ambulance, pumper, insulated bucket truck, transit bus, school bus, a counterbalance forklift and a yard hustler.
- **Boats and underwater vehicles (12):** workboat, a 24 m motor yacht and its tender, skiff, deck barge and hopper, salvage crane barge, skimmer catamaran, a marine deck crane, a derelict sailboat, a spud barge and an observation-class ROV.
- **Props (33) and tools (21):** from jersey barriers and marina berths to settlement-tile racks, quadrat frames and a diving stage; the radio alone appears in 30 procedures.
- **Mobile look:** a procedural pattern library (deck teak, hull stripes, harbour water, caustic seabed, glass curtain walls, lane asphalt and crosswalks, among others) painted at three resolution tiers so a phone stays inside a fixed pixel budget.

## Interfaces

The learner-facing surfaces are the home page with every programme, the SmartCiti.X city stage (flat, VR, AR, keyboard, touch, gamepad and hand tracking), the Trade Skills rooms, the Holodeck, where a simulation is spoken into existence, Bay World, the Deep, the Regatta, Fairway Park, the Bay Atlas, a break-room arcade and a night-highway racer as easter eggs, and a track page for each of the 54 programmes. The instructor console shows live sessions, attempts, stars, unsafe actions and interruptions handled; training records export as CSV and xAPI.

## How quality is held

Every station meets a written brief: 12–15 steps, at least six kinds of interaction, four hazards, two interruptions that visibly change the scene, a reason for every step, and at least five citations that resolve in the standards registry. No clause number, pressure, load, depth, gas limit or duty-hour figure is ever invented; limits read "per the permit", "per the dive plan", "per the label". Facts about real organisations and places are limited to sourced text. Fifty-eight automated checkers run on every change, and the content eval scores every station on variety, decision density, explanation depth, grounding and standards.

## How it was built

The platform is built by teams of AI agents, each at a named console that logs every step into a file in the repository, coordinated through a merge desk that gates every change on the full checker suite. That process is itself part of what a partner gets: a new union pack, world or feature arrives with its own checker and its own log.

## Programmes

Each programme has a generated overview in `docs/programmes/` with its stations, union and training bodies, competency rule, ladder, the Bay World and Deep sites that anchor it, and the standards it cites. The Pathway Edition and the Job Readiness Edition, built around wojrc.org's published description of its programmes, are covered in depth in `docs/pitch/pathway-edition-feature.md`.

## What we are looking for

Pilot partners among workforce programmes, reviewers from union training bodies, employers to shape hiring scenes, and funders for a first pilot. The introduction letter in `docs/pitch/introduction-letter.md` sets out the four roles.
