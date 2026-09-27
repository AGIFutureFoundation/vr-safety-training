# The training game — Bay World, Fairway Park, the Deep and the Regatta as one free-roam game over a union-trade curriculum

Prepared 2026-09-27 from the working tree of this repository after merging
`origin/claude/vr-ar-safety-training-wkwmve` (branch head `c701b5f` at the
time of the count, after the Deep and the Unity content bridge landed; see `docs/game-whitepaper-facts.json` for every figure below with
the command or file that produced it). This paper is the companion to
[`WHITEPAPER.md`](WHITEPAPER.md), which describes the platform as a whole; this
one describes the *game* that has grown over the platform's stations — the
open worlds, the quests, the scoring, the trades that populate them — and how
the game hands a player back to a graded procedure and an auditable record.

Two rules govern the text. Every number was produced by a named command or
read from a named file in this tree; nothing is estimated. And no fact about a
real place, person or organisation appears here beyond what the repository's
own sourced briefs state: the worlds are stylised, they say so in their own
module headers, and the paper follows them. Where the game brief names a
component "if present" and that component is not yet in the tree, this paper
says so rather than describing it.

---

## 1. Thesis — why a free-roam training game

The platform's stations were built as graded procedures: a learner opens one,
performs twelve to fifteen scored steps, and the engine records the run. That
model produces an honest record but a thin habit — a station is a thing to be
done once, for the badge. Four pieces of the repository, read together, state
the case for wrapping those stations in a world.

**Engagement.** `WebXR/bayworld/js/app.js` describes Bay World as "menus, the
phone-style HUD, keyboard/touch/gamepad input for on-foot and vehicle play,
the map, the car radio and the render loop" over a set of pure rule modules.
A player walks or drives a 2400 × 1600 m city (`BAY_BOUNDS` in
`WebXR/shared/bayworld-data.js`), the clock turns day to night, traffic keeps
to its lanes, and the job board at a site is met on the way somewhere rather
than picked from a list. The reason to come back is the world, and the
stations sit in it.

**Spaced practice.** `WebXR/shared/tracking.js` defines `refreshersDue()`: a
station's last clean run against a per-programme interval that "defaults to
90 days when nothing declares one — always labelled a platform default, never
a union rule". A world that a player revisits is the mechanism that makes a
refresher something that happens rather than something that is owed. The
quest layer adds the second half: every programme's opener runs its first
three stations and its capstone runs its last three (`docs/bayworld-quests.md`
§2), so a programme is met at least twice, at different points of a career.

**The job board as the bridge.** The game never scores a procedure itself. A
`station` quest step, per `WebXR/bayworld/js/quest-engine.js`, "completes not
from position but from a mission return": the job board deep-links into the
real SmartCiti.X station, the learner runs it under the same engine every
other launch uses, and `career.js`'s `bwCollectMissionReturns()` reads the
fresh entry back out of `WebXR/shared/records.js`. Play leads to a graded
procedure; the procedure's result flows back into the game. Nothing in the
game can advance a quest step of that kind by any other route.

**Accountability.** The career ledger (`career.js`) is explicit about what it
is: "shift credits are a plain score, kept for the same reason a mini-game's
leaderboard is, and every unlock is earned by finishing a real mission, never
spent". Underneath it sit the two layers the rest of the platform already
answers to. `records.js` appends "one immutable entry" per finished run — the
station, its category, the real certification it maps to, score, stars,
corrections, unsafe actions, time against par, and pass or fail against a
stated rule — and exports CSV and xAPI 1.0.3. `competency.js` states the
mastery rule once: "two or more stars, zero unsafe actions, every
interruption answered, finished within 1.5 times the station's par time",
and "no other rule earns a competency". The game's reputation and credits
are a motivator; the record and the competency are the truth, and the game
cannot write to either.

## 2. The worlds

### 2.1 Bay World

`WebXR/shared/bayworld-data.js` is the ground truth — "layout data and the
zone/height/road lookup functions a game, a quest layer or a headless checker
can call without touching three.js" — and its header states the stylisation
rule the whole game inherits: "every place is named only by a plain, generic
public-facing name … never a real organisation, brand or address, and no fact
about a real place — a date, a height, a count, an owner or an event — is ever
asserted. The world is *inspired by* a shoreline city with a bay, a port and
inland hills".

| Measure | Value | Source |
|---|---|---|
| Field | 2400 × 1600 m, x:[−1200, 1200] z:[−800, 800] | `BAY_BOUNDS` |
| Height field | 0–140 m, two domes, flat on the island, both shorelines and the outer bay | `BAY_HEIGHT_RANGE`; `node tools/check_bayworld.mjs` |
| Zones | **16**, tiled by nearest centre | `BAY_ZONES.length` |
| Public landmarks | **28** (5 parks, 3 transit, 2 each of infrastructure, market, lookout, civic, industrial and marina, and one each of tower, theatre, port, plaza, stadium, arena, education and healthcare) | `BAY_LANDMARKS`, grouped by `kind` |
| Training sites | **50**, every one of the 52 programmes anchored at least once | `BAY_SITES`; `check_bayworld.mjs` "every curriculum programme anchored" |
| Roads | **15**, one connected network, lanes per road | `BAY_ROADS.length`; `check_bayworld.mjs` |
| Mesh budget | 100 low / 3600 high; the scenic-district slice builds at 83 of 120 | `BAY_MESH_BUDGET`; `node tools/check_districts.mjs` |

The sixteen zones are the original ten (downtown, uptown, the lake, the
estuary waterfront, the port, an industrial west flank, a market district, a
stadium district, the hills and a bridge approach) and the six the expansion
added (an island harbour, a north shoreline, Emery Crossing, a south
shoreline, the upper hills and the outer bay), none of the originals moved
(`docs/bayworld-quests.md` §7). Sites are unevenly spread on purpose — six on
the industrial flank, five in the stadium district, one at the outer bay's
buoy-tender pier — because a site is where a programme's work actually
happens.

The game under `WebXR/bayworld/` keeps every rule in pure modules so
`tools/check_bayworld_game.mjs` can drive it headless: `sim.js` (walking at
4.2 m/s, running at 7.4 m/s, four fleet vehicles — pool car, pickup, box
truck, Class A tractor — under a city-wide cap of 22 m/s with "no drift, boost
or item", collision against the same buildings regardless of draw distance),
`career.js` (reputation, credits, unlocks, visited sites, the last hundred
log lines), `quest-engine.js` (five step types — `goto`, `find`, `talk`,
`drive`, `station`), `map.js` (the in-world map) and `world.js` (the three.js
build, and the one hook that lets the Bay Atlas's satellite ground replace
the grass). The checker's own summary line is the contract: "the real BAY1
map loads and drives, traffic advances and holds at crossings, missions
deep-link correctly, a returned record awards reputation and credits, BAY3's
real quest layer steps and persists (including an egg's anchor fallback), and
the map lists every site."

### 2.2 Fairway Park

`WebXR/shared/fairway-data.js` follows the same pattern one district earlier:
"a nine-hole golf course plus an outdoor sports facility — shared by two
teams working in parallel: GOLF1 (a golf/sports mini-game) plays it, LAND1 (a
grounds-and-landscaping training programme) works on it", with the same
disclaimer — "no real course, club, brand or player is named or modelled".

| Measure | Value | Source |
|---|---|---|
| Field | 600 × 400 m, x:[−300, 300] z:[−50, 350] | `FAIRWAY_BOUNDS` |
| Holes | **9**, par **36** (4-3-5-4-3-4-5-4-4) | `FAIRWAY_HOLES` |
| Facility | running track, pitch, basketball court, tennis courts, bleachers, maintenance yard, weather mast | `FAIRWAY_FACILITY` keys |
| Height field | 0–3.5 m, continuous | `FAIRWAY_HEIGHT_RANGE`; `node tools/check_fairway.mjs` |
| Mesh budget | 130 low / 900 high; the scenic slice builds at 40 of 120 | `FAIRWAY_MESH_BUDGET`; `check_districts.mjs` |
| Mini-games | **3** — free throw, penalty, sprint | `WebXR/fairway/js/minigames.js` exports |
| Programme on it | Grounds & Landscaping, **12** stations | `CURRICULA` `grounds-and-landscaping` |

The golf engine (`WebXR/fairway/js/golf.js`) is "pure and store-injectable,
exactly like `WebXR/race/js/sim.js` and the arcade cabinets' engines": a swing
is a power/timing pair, and distance and drift follow from those two numbers,
the club, the lie and the wind, so `tools/check_fairway_game.mjs` plays "nine
holes … headless with real lies, penalties, slope and course-care scoring".
Course care is the tie to the trade: the same lies the golfer reads are the
turf the grounds crew maintains, and the programme's twelve stations are
anchored on the map at the Redwood Park Grounds Shop and the Island Airfield
Park.

### 2.3 The Deep

`WebXR/shared/underwater-data.js` is the third world, "built to the same
contract as Bay World so the same tools read both worlds" (`docs/underwater.md`):
"a large stylised seabed — a shallow shelf off the shore, an eelgrass meadow,
a kelp forest on rock, a shipping channel, a wreck hollow, pier pilings, an
outfall apron, a tidal-marsh channel mouth, a deep trench and a seamount". Its
facts rule adds one clause to Bay World's: "depth, gas, decompression and
current limits are never stated", and `deepDepthAt()` "is a scenery and
gameplay field … and must never show its number to a learner as a limit".

| Measure | Value | Source |
|---|---|---|
| Field | 2000 × 1400 m, x:[−1000, 1000] z:[−700, 700]; the shore along z = −700 | `DEEP_BOUNDS` |
| Depth field | 1–120 m below the surface, continuous; shelf shallow, channel deeper than the floor beside it, trench deepest, pinnacle rising | `DEEP_DEPTH_RANGE`; `node tools/check_underwater.mjs` |
| Zones | **14**, from the pier pilings and the shallow shelf to the deep trench and the seamount | `DEEP_ZONES.length` |
| Landmarks | **25** — the kelp cathedral, the wreck's bow and stern, the reef ball rows, the tide gauge post, the trench lip and floor cairn among them | `DEEP_LANDMARKS.length` |
| Dive sites | **32**, anchoring **15** programmes and **76** distinct existing stations (`br-`, `mw-`, `uw-`, restoration and port ids) | `DEEP_SITES`; `new Set(programmes).size`, `new Set(stations).size` |
| Dive lines | **17** in one connected network — 8 transects, 6 anchor lines, 2 guidelines, the channel centreline | `DEEP_LINES`, by `kind` |
| Mesh budget | 100 low / 1400 high; measured 89 and 1053 | `DEEP_MESH_BUDGET`; `check_underwater.mjs` |
| Lighting | three bands — shallow, mid, deep — murkier and darker with each, the caustic fading to nothing in the deep band | `deepLighting()`; `docs/underwater.md` |
| District | `the-deep`, 89 of 120 meshes, the seventh scenic district | `node tools/check_districts.mjs` |

Dive lines stand in for roads: the same `deepLineAt()` a game reads for a
buddy line or a transect HUD is what the checker reads to prove the network
is one piece. The checker also proves the negative the facts rule demands —
"any limit figure — a depth, gas, decompression or current word next to a
number with a unit — in either module" fails the build. The `cd-` and `me-`
packs of `tools/briefs/dive-brief.md` are anchored as comments on the sites
they will join; the dive game itself (`WebXR/underwater/`, team REEF) is not
yet in the tree and is listed as open in Section 7.

The **Regatta** (`WebXR/regatta/`) is likewise not in the tree at this head.
What the tree holds of it is the yacht: the `motorYacht`, `yachtTender` and
`marinaBerth` builders, the eight-station Yacht and Charter Crew programme,
the Harbor Cruise activity and two marina field notes (Section 4.2). This
paper describes those and nothing about a regatta a later commit has not yet
landed.

### 2.4 The Bay Atlas and the Mapbox layer

`docs/mapbox.md` opens with the constraint: "this repository ships no Mapbox
token, and nothing in it contacts a Mapbox host until a viewer supplies one."
The Bay Atlas (`WebXR/bayworld/atlas.html`) lists every site and landmark
with the programmes it anchors, a link that starts a Bay World shift beside
it, and a link that launches the site's first station. Without a token the
map is an SVG drawn from the data; with one it is a real-world map fitted to
the world's lon/lat box, and Bay World's ground takes one satellite image.
`WebXR/shared/bay-geo.js` holds **11** anchors, each "rounded to three
decimals, marked `approximate: true`", pairing a Bay World position with the
approximate coordinates of the *kind* of public place that part of the
stylised world is inspired by; a least-squares affine fit joins the two, and
the anchors land within 242 m of themselves through the fit
(`node tools/check_mapbox.mjs`) — "the fit doing its job on a world that is
not to scale". The checker also proves the negative: no token-shaped string
anywhere in the repository, and with no token "not a single request or
insertion".

### 2.5 Sky, weather and wildlife

The brief names `WebXR/shared/sky.js` and `wildlife.js` "if present"; neither
exists at this head (`ls WebXR/shared/`), re-checked after the Deep and the
Unity bridge merged. What the worlds have today is the platform's
shared weather: `WebXR/shared/weather.js`'s 8 weather kinds, each carrying
an operational note tied to the work (`WHITEPAPER.md` §8.1), Bay World's
own `bwWeatherFor()` and `bwAdvanceClock()` in `sim.js`, which pick a weather
and turn the day, and under water the Deep's three lighting bands
(`deepLighting()`, Section 2.3). The Deep's builder animates its own
life — "sways the kelp and the eelgrass, circles the fish schools and drifts
the marine snow" (`docs/underwater.md`) — but names no species. A skybox, live weather and a wildlife layer are the SKY
run the coordinator opened at 18:34 UTC (Section 7).

## 3. Gamification

### 3.1 Quests

`WebXR/bayworld/js/quests-data.js` is generated by `tools/gen_bay_quests.mjs`
from `WebXR/smartcity/js/curricula.js`; `docs/bayworld-quests.md` explains
the rule that makes the generator safe: "every line of dialogue that names a
station's own reasoning is pulled live from that station's `why` field …
rather than retyped … and a station id removed or renamed makes the
generator throw instead of silently shipping a stale quest."

| Layer | Count | What it is | Source |
|---|---|---|---|
| Main arc | **7** quests | The Job Readiness Edition's 32 stations, once each, site by site — "Where the Trades Began" to "Ask for the Door" | `MAIN_QUESTS.length`; `docs/bayworld-quests.md` §1 |
| Side quests | **102** across **51** programmes | An opener (first three stations) and a capstone (last three) per programme | `SIDE_QUESTS.length`; `new Set(programmeId).size` |
| Field-note eggs | **26** — 17 found by walking, 9 by radio | Each teaches one safety or trade habit quoted verbatim from a real station's step | `EGG_QUESTS`, by `method` |
| Registered quests | **135** | `ALL_QUESTS` | `WebXR/bayworld/js/quests.js` |
| Stations cited | **324** distinct | Every `station` step across all quests | `allCitedStationIds().length` |
| Landmarks cited | **25** of 28 | Where eggs hide | `landmarksCited().length` |
| Reward curve | `100 + (tier − 1) × 150`; tier 1 = 100, tier 7 = 1000 | Monotone along `requires`; 0 violations, no cycle | `rewardForTier`, `rewardMonotonicityViolations`, `findCycle` |

The quest giver is always a job title — "the yard trainer", "the financial
coach" — never a name (`docs/bayworld-quests.md` §1). Every landmark note is
a public name plus one generic line, with a denylist of history words and a
flat ban on digits enforced by `tools/check_bay_quests.mjs`. The checker also
reads each egg's cited station file as plain text and asserts the step id and
the lesson string appear in it exactly.

### 3.2 Activities and scoring

Five side activities (`SIDE_ACTIVITIES`) carry their own scoring shapes
rather than the quest step schema: Delivery Run (a box truck between two
sites, scored on time plus the same driving checks the Class A stations
score), Lake Merritt Loop Time Trial (a lap on foot against checkpoints),
Port Yard Spotting (points per correct fault spotted, a penalty per false
call, against the clock), Harbor Cruise (the yacht — guest count read back,
lines and fenders stowed, no-wake speed held in the marina, wake watch on the
estuary, a clean return to the berth) and Skyline Lookout Photo Mode
(coverage of viewpoints, explicitly non-competitive).

### 3.3 Ladders, liveries, bingo, radio, milestones

The game inherits every playful layer the platform already had, and the
platform's rule about them: `docs/easter-egg.md`'s opening line, "none of them
touches a station's steps or its scoring".

- **Ladders.** 52 programmes × 20 levels = **1040** levels, **1** partial,
  **208** milestone quotes that are verbatim prefixes of a station's own text
  (`node tools/check_ladders.mjs`). A level passes only when one run has a
  mastery run on every task (`WebXR/shared/ladder.js`).
- **Capstone liveries.** **52**, one per programme, generated from the
  ladders so none can be missing (`WebXR/race/js/capstone-liveries.js`).
  Bay World's own unlocks (`career.js`) start a player with a pool car and a
  "fleet-standard" livery; the pickup, box truck and tractor unlock at
  reputation 30, 80 and 160 (`sim.js` `BW_VEHICLES`).
- **Toolbox Talk Bingo.** Its label pool is "lifted straight off a station's
  own `hazards: {}` object … never an invented hazard"
  (`WebXR/shared/bingo-hazards-data.js`, generated).
- **Foreman's Radio.** A ten-question quiz "generated verbatim from
  `tools/standards.json`'s body and title … never from an invented fact"
  (`WebXR/shared/radio-quiz.js`); Bay World's car radio imports the same
  `buildQuiz` (`app.js`).
- **The racer and the arcade.** 10 original tracks race three laps headless
  (`node tools/check_race.mjs`); four arcade cabinets run 30 s sessions
  clean (`node tools/check_arcade.mjs`); 14 hard-hat hosts, the honest quiz,
  the capstone unlock rule and the egg ledger (`node tools/check_eggs.mjs`).
- **Milestones and streaks.** `tracking.js`'s streak and on-time-refresher
  XP, a per-programme clean-run badge series and the hazard-free week — all
  computed from the record, never written to it.

### 3.4 What is deliberately absent

The quest layer's own checker asserts "no violence and no gambling anywhere
in the world" (`docs/STATUS.md`, Bay World run), and `career.js` repeats it
for the ledger: "nothing here is bought or gambled". There is no online
multiplayer and no server — the racer's two-player mode is split-screen or
two tabs on one machine over `BroadcastChannel` (`WHITEPAPER.md` §7.2). No
loot, no timers that punish absence, no purchase of any kind; a refresher
that is due is a card on My Training, not a penalty.

## 4. The unions and trades in the game

### 4.1 How 111 unions reach 50 sites

`tools/unions.json` lists **111** unions — "every national or international
union, AFL-CIO trade department, and Bay Area local this platform's signage,
curricula and training-body registry can name by its public name and
affiliation alone" (`docs/unions.md`). **58** of them are named in the
`union` strings of the 52 programmes in `curricula.js` (distinct ids whose
aliases in `WebXR/shared/unions.js` appear there); the rest reach the world
through the standards registry's training bodies and the category tables. No
union logo ships: `node tools/check_signage.mjs` reports "111 unions, no logo
shipped, 605 station pads signed", every sign a wordmark typeset at runtime.

The chain from a union to a place in the game runs: a **union** is named by
a **programme** (`CURRICULA[].union`); a programme belongs to one of **20
categories** (`catalog.json`); a **site** in `BAY_SITES` lists the programmes
it anchors and the station ids its job board offers; and
`tools/check_bayworld.mjs` asserts every one of the 52 programmes is
anchored at least once. The Port Container Terminal, for instance, anchors
the wojrc.org Pathway Edition, Port Operations and Rigging & Lifting, with
mooring-line, bunkering-watch, crane-yard and dock-crane stations on its
board (`BAY_SITES[0]`). When a new programme lands without a site, the gate
goes red — which is exactly what happened on the Pathway Edition's first
merge (`docs/STATUS.md`, "What failed first"), and why the merge chain now
anchors every new programme by category before the gate.

### 4.2 The yacht and charter crew pack

Eight `yc-` stations under the Maritime & Ports category, programme
`yacht-and-charter-crew`, on "a mid-size motor yacht at a marina berth and
under way on the estuary" (`tools/briefs/yacht-brief.md`): the pre-departure
briefing and guest count, line handling and docking in a crosswind, the fuel
dock transfer and spill kit, the engine-room pre-start and bilge check, the
man-overboard recovery drill, the galley fire and fixed system, the tender
launch and guest transfer, and shore-power connection with in-water
electrical safety. The brief's rule for numbers is the platform's: "no fuel
quantity, distance, wind speed, weight, voltage or clause number is ever
stated; thresholds read 'per the vessel's safety management plan', 'per the
captain's standing orders', 'per the tender's plate'." The unions are the
registry's maritime entries only. The pack anchors at the Marina Boatyard
(estuary waterfront) and the Island Yacht Harbor; its eval scores ran 93–98
(`docs/consoles/COORDINATOR.md`, 18:25 UTC). The yacht itself is three kit
builders — `motorYacht`, `yachtTender` (fleet) and `marinaBerth` (props) —
among the **89** builders `node tools/check_fleet.mjs` renders headlessly
inside their budgets.

### 4.3 Diving, ecology and maritime

The 35-station **SF Bay Restoration & Cleanup — Maritime and Underwater**
programme (`bay-restoration-maritime-underwater`) is five packs of seven —
underwater work and dive safety, vessel and marine operations, shoreline and
wetland restoration, contaminated sediment and water quality, and ecology,
monitoring and community science (`tools/briefs/bay-restoration-brief.md`).
Its dive rule binds every later dive station: "depth, gas, bottom time and
decompression are never stated as numbers; they are 'per the dive plan' /
'per the tables the supervisor holds'", with a standby diver, a tender, a
supervisor and a comms check on every dive. It anchors at five shoreline
sites across the estuary, the island, the north and the south shorelines.
The 11-station **Ports, Maritime and Ecology** programme anchors at the
Estuary Research Dock, the North Marina Pier and the Channel Buoy Tender
Pier, the outer bay's one site. The 42-station **Bay Area Union Edition**
(sheet metal, bridge, port maintenance, marine and water) anchors at the
West Oakland Union Hall and three island sites; its facts rule is the one
this paper follows for its bridge scene — the bridge "opened in 1937 and is
painted International Orange; state nothing else" (`tools/briefs/bayarea-brief.md`).

Two further packs are in flight in the Deep run and not yet in the tree: the
commercial diving and scientific scuba pack (`cd-`) and the marine ecology
pack (`me-`), whose brief (`tools/briefs/dive-brief.md`) already names the
sites they will anchor at — the Estuary Research Dock, the North Shoreline
Field Lab and the Channel Buoy Tender Pier — and adds the ecology rule: "no
species fact, count, date or place history is asserted; ecology content
teaches the method, not a claim about the bay."

### 4.4 The wojrc.org editions

The main arc walks the 32-station Job Readiness Edition; the 40-station
Pathway Edition anchors at the Port Container Terminal. Both are composed
under `tools/briefs/wojrc-brief.md`, and this paper states about the
organisation only what that brief sources from its own published text: it
offers training for warehouse and Commercial Class A truck-driver positions,
helps people navigate and enrol in union construction-trades apprenticeship
programmes, and offers financial coaching. The organisation is referred to by
its domain; the edition's sponsor is not named in the quest data, and
`tools/check_bay_quests.mjs` fails the build if either of that sponsor's name
fragments appears.

## 5. Content quality

The game is only as good as the stations behind its job boards, and those are
measured two ways.

**The gate.** `node tools/check_all.mjs` runs **53** checkers and its last
line today reads "All 53 checkers pass." Nine of them are the game's own:
`check_bayworld.mjs` (the map), `check_bayworld_game.mjs` (the app's rules),
`check_bay_quests.mjs` (the quest layer), `check_mapbox.mjs` (the atlas and
the token rule), `check_underwater.mjs` (the Deep and its no-limit-figure
rule), `check_fairway.mjs` and `check_fairway_game.mjs` (the course and the
golf engine), `check_race.mjs` and `check_arcade.mjs`; three more guard the
eggs and the ladders (`check_eggs.mjs`, `check_eggs_app.mjs`,
`check_ladders.mjs`), and `check_unity_export.mjs` holds the Unity bridge to
the tree (Section 6). The rest are the platform's — parse, imports, budget,
layout reachability, interruptions (**1214** across **607** procedures, 17
armed on drive steps and answered from the cab), records, competency,
standards, signage, devices, fleet, models, textures.

**The eval.** `node tools/eval_content.mjs --json` grades every procedure on
eight dimensions — variety, decisions, explanation, grounding, standards,
feedback, scene, originality — and its header is candid about what it is: "it
deliberately does NOT fail a build. A score is a judgement about content and
the thresholds here are ours rather than anybody's standard". Today it scores
**614** procedures at a corpus mean of **96 / 100**, **496** of them at or
above 95; the five below 90 are the flat, sourced briefings and readings
(`hunters-point` 73, `can-we-live-story` 73, `civic-principles-briefing` 81,
`trades-lineage-briefing` 84, `apprenticeship-standards-reading` 88), for
which the scene and variety dimensions do not apply.

**The registry.** `tools/standards.json` holds **509** entries across **95**
bodies; **301** are marked verified and **208** unverified — carried as a
body and a title only, because "a clause number is never invented"
(`WHITEPAPER.md` §2). Every quiz question, every quest citation and every
station's authorities resolve against it; **122** standards are evidenced by
the **62** competencies over **602** distinct stations
(`node tools/check_competency.mjs`).

**The facts rules.** Every content run is bound by a brief under
`tools/briefs/` — the station brief's shape (12–15 steps, at least six kinds,
four hazards, two interruptions, a `why` and a `supportLine`, at least five
registry-form citations), and the facts briefs that fence real names:
`wojrc-brief.md`, `bayarea-brief.md`, `dive-brief.md`, `yacht-brief.md`,
`bay-restoration-brief.md`. The game adds its own: landmark notes with no
digits and no history words, givers who are job titles, dialogue pulled from
`why` fields, and a generator that throws on a stale id.

## 6. Data, robots and the Unity bridge

Every run a player makes from a Bay World job board is a run of the same
engine the robot layer trains against. `WebXR/shared/episodes.js` is "the
recorder: attaches to a live session, captures each decision and a low-rate
pose track, stores locally, hashes anything that could identify a person";
`tools/export_dataset.mjs` is "the exporter: headless rollouts + any exported
human episodes → JSON Lines shards, a manifest, a dataset card"
(`docs/robot-datasets.md`). The recorder wraps the five methods
`smartcity/js/app.js` already calls — `select`, `rotate`, `dropAt`,
`setHolding`, `driveCheck` — so a game-launched station is recorded exactly
as a catalogue-launched one, with no call site changed.
`docs/robot-training.md` covers the policy and the body — a
skill-parameterised agent and the embodiment layer that turns a station's
own scene into poses, grasps, force ceilings and keep-out volumes;
`node tools/check_robot.mjs`, `check_episodes.mjs` and
`check_dataset_tools.mjs` gate all three.

The sharing layer is opt-in and off by default: "nothing about a session
leaves the browser until a person explicitly presses Share"
(`docs/wallets-and-sharing.md`), through provider-agnostic adapters whose
fields ship `null` (`docs/agent-protocols.md`). The game adds no telemetry of
its own; the career ledger is a `localStorage` key
(`bayworld-career-v1`), storage-injectable so the checker can run it with a
plain object.

**The Unity bridge.** `docs/unity.md` landed with this merge: "the
platform's content is authored once, in the WebXR modules.
`tools/export_unity.mjs` exports it so a Unity project can run the same
procedures with the same scoring, and commits the result under
`exports/unity/SmartCitiX/` as a UPM package. Nothing in the export is
written by hand". `node tools/check_unity_export.mjs` re-runs the content
half and diffs; its line today reads "Unity export up to date: 614 stations,
52 programmes, 3 worlds, 89/89 models (7.0 MB), 21.2 MB in all; no token or
model name." The three worlds are `bayworld.json`, `fairway.json` and
`underwater.json` — every exported constant of each pure data module — and a
programme's export carries its anchors, "every Bay World site (and Deep site
…) whose `programmes` names it", so the game's map reaches Unity with the
stations. `Runtime/StationRunner.cs` mirrors `game.js`'s `Session` method for
method with the same scoring constants and pass rule, and
`Runtime/TrainingRecord.cs` writes "the record shape `WebXR/shared/records.js`
writes — same fields, same CSV columns, same xAPI 1.0.3 statement, same
`passed` rule — so a record from Unity reads in the web apps' instructor
console and LRS export unchanged". What the bridge does not carry is stated
as plainly: scenes, textures, gamification beyond names, licensed content,
and the robot layer.

## 7. Roadmap — what the consoles list as open

`docs/consoles/` holds four consoles at this head: `COORDINATOR.md`,
`TRENCH.md` (the Deep's data and builder), `BRIDGE.md` (the Unity bridge) and
this paper's own `SCRIBE.md`. The coordinator's entries record what has
merged and what is open:

- **Merged today:** the Bay World expansion (17:49 UTC), the Bay Atlas
  (18:04), the yacht pack (18:25), the Unity content bridge (18:50,
  `96899f2`) and the Deep (18:53, `d710528`, "gate All 53 checkers pass").
- **The Deep run** (opened 18:20 UTC): still open are the dive game with its
  quests and field-note eggs (REEF, `WebXR/underwater/`, which "switches
  from its seabed stub to `shared/underwater.js`"), the commercial diving and
  scientific scuba pack (TENDER, `cd-`) and the marine ecology pack (KELP,
  `me-`), which "add their programme and station ids to the `DEEP_SITES`
  entries commented for them" (`TRENCH.md` hand-back).
- **The Regatta run** (opened 18:34 UTC): the yacht fleet, hosted events and
  racing (REGATTA); skybox, live weather and wildlife with a pier-fishing
  activity and Field Guide eggs (SKY); a promo of the game and the
  whitepaper update close the run.
- **The bridge's own open item** (`BRIDGE.md`): a bare-colour material on
  one fleet builder, repaired at export and filed as a task; the models step
  needs a real three.js r160, now part of the merge chain's regenerate step.
- **Republish** once the Deep's game lands (18:25 UTC entry).

From `docs/STATUS.md`'s Bay World run, three smaller gaps are quantified
rather than open-ended: the screen and media crafts pack shipped seven of its
eight stations, the postal pack six of eight, and one ladder level of 1040 is
partial. Nothing beyond these is asserted as planned; a component this paper
could not find in the tree is described above as absent, not as coming.

## Appendix — the numbers in one place

| Figure | Value | Source |
|---|---|---|
| Procedures / SmartCiti.X stations / Trade Skills rooms | 614 / 605 / 9 | `WebXR/smartcity/catalog.json` |
| Categories / programmes | 20 / 52 | same |
| Checkers | 53, "All 53 checkers pass." | `node tools/check_all.mjs 2>&1 \| tail -1` |
| Corpus mean / at or above 95 | 96 / 496 of 614 | `node tools/eval_content.mjs --json` |
| Standards entries / bodies / verified / unverified | 509 / 95 / 301 / 208 | `tools/standards.json` |
| Unions in registry / named by programmes | 111 / 58 | `tools/unions.json`; `curricula.js` |
| Competencies (programme + core) / stations / standards | 62 (52 + 10) / 602 / 122 | `node tools/check_competency.mjs` |
| Ladder levels / partial / milestone quotes / liveries | 1040 / 1 / 208 / 52 | `node tools/check_ladders.mjs`; `capstone-liveries.js` |
| Bay World zones / landmarks / sites / roads | 16 / 28 / 50 / 15 | `WebXR/shared/bayworld-data.js` |
| Bay World field / height / mesh budget | 2400 × 1600 m / 0–140 m / 100–3600 | same |
| Bay World vehicles / speed cap | 4 / 22 m/s | `WebXR/bayworld/js/sim.js` |
| Quests: main / side / eggs / activities / registered | 7 / 102 / 26 / 5 / 135 | `WebXR/bayworld/js/quests.js` |
| Stations cited by quests / landmarks cited | 324 / 25 | same |
| Fairway holes / par / mini-games / grounds stations | 9 / 36 / 3 / 12 | `fairway-data.js`; `minigames.js`; `curricula.js` |
| Scenic districts | 7 | `node tools/check_districts.mjs` |
| The Deep zones / landmarks / sites / lines | 14 / 25 / 32 / 17 | `WebXR/shared/underwater-data.js` |
| The Deep field / depth / mesh budget | 2000 × 1400 m / 1–120 m / 100–1400 | same; `node tools/check_underwater.mjs` |
| Unity export: stations / programmes / worlds / models / size | 614 / 52 / 3 / 89 / 21.2 MB | `node tools/check_unity_export.mjs` |
| Atlas anchors / max residual / token shipped | 11 / 242 m / none | `node tools/check_mapbox.mjs` |
| Interruptions / procedures carrying one | 1214 / 607 | `node tools/check_interrupts.mjs` |
| Kit builders | 89 | `node tools/check_fleet.mjs` |
| Device profiles / run profiles | 33 / 6 | `node tools/check_devices.mjs` |
| Not in tree at head | `WebXR/regatta/`, `WebXR/underwater/`, `sky.js`, `wildlife.js` | `ls` |
