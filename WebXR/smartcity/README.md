# SmartCiti.X

AR/VR training simulators across fifteen SmartCiti.X trade-union categories. 145 stations
exist today — 144 walkable AR/VR procedures and one flat briefing station — each a
real ordered procedure with real hazards, its own gamified rank ladder, and the real
union and certification a worker in that role would actually need — not a generic "safety
training" wrapper, a specific one per trade. Trade Skills Simulator, `WebXR/trades/`'s own nine
rooms, makes a thirteenth category on the shared catalog; see that app's own README.

## The thirteen categories

| Category | SmartCiti.X app | Stations today |
|---|---|---|
| Energy & Power | smartcity | 8 |
| Mobility & Transit | smartcity | 6 |
| Water & Environmental | smartcity | 10 |
| Connectivity & Telecom | smartcity | 6 |
| Emergency Services | smartcity | 6 |
| Manufacturing & Automation | smartcity | 6 |
| Building Systems & Facilities | smartcity | 7 |
| Construction & Structural Trades | smartcity | 7 |
| Entertainment & Live Events | smartcity | 7 |
| Maritime & Ports | smartcity | 7 |
| Environmental Monitoring | smartcity | 8 |
| Surface Prep & Coatings | smartcity + trades | 4 (Bridge Blast and Tank Lining, plus the Trade Skills rooms Wash-Down Yard and Coatings Bay) |
| Trade Skills Simulator | trades | 7 (the rest of `WebXR/trades/`'s rooms) |

`catalog.json` is the merged roster for both apps and is the place to read the current
station list per category; this table counts it rather than naming all eighty.

This is a growth taxonomy, not a fixed roster: the plan is 33 stations per category — enough
for every category to eventually cover a whole family of real, distinct trades rather than one
representative example. The stations above were categorized by consolidating the 13 ad-hoc
`domain` values each sim already carried (Energy, Mobility, Water, Connectivity, Aviation,
Emergency Services, Manufacturing, Building Systems, Telecom, Construction, Facilities,
Environmental, Entertainment, Maritime) down into the first 10; Environmental Monitoring was
added as the eleventh for sites that need a documentary rather than a walkable treatment;
Surface Prep & Coatings followed as the twelfth, shared from the start with the Trade Skills
rooms sited there; and Trade Skills Simulator itself is the thirteenth, entirely
`WebXR/trades/`'s own app. A new sim declares both `domain` (its specific field) and
`category` (which of the thirteen it belongs to) in its own module — see `js/sims/*.js` and
`tools/gen_sims_meta.mjs`.

## Environmental Monitoring and flat briefing stations

Some real places should not be rendered as a pleasant scene to stroll through. Hunters Point
Naval Shipyard — the first station in Environmental Monitoring — is an active EPA Superfund
site with a federal False Claims Act settlement over falsified radiological soil data
(approved August 2026), a federal lawsuit by neighborhood residents over the adequacy of the
Navy's cleanup, and a community that measures its own air. So `js/sims/hunters-point.js` is a
**flat station** (`flat: true`): no walkable 3D scene, the same treatment a map or an aerial
lookup gets. It renders as a dossier — site status, the data-integrity case, the community
and the litigation, and which union trades the actual work calls on (LIUNA hazmat laborers
under HAZWOPER, IUOE operating engineers, Teamsters on regulated hauling, radiation control
technicians, industrial hygienists) — every paragraph carrying its source (EPA, DOJ, OSHA,
Greenaction). Below it is a scored knowledge check that runs on the ordinary procedure
engine: each option is an invisible interactable, wrong answers are corrections, and
unsafe conclusions (treating a parcel as open ground, swapping a clean sample, silencing a
dust monitor, dismissing the community's monitors) are hazards that fail the record exactly
as an unsafe action does in a 3D station. It records, ranks, badges and exports like every
other station and appears in the guided tour; in AR/VR it declines to open and says why.

The community air monitoring the dossier points to is the real one — installed by Bayview
Hunters Point residents in Marie Harrison's memory and run by Greenaction with the Marie
Harrison Community Foundation. It is not a program of ours, and this station does not
render, simulate or speak for it. The settlement and the lawsuit are live matters; whoever
maintains the dossier re-checks its sources when the record changes.

Add another flat station by declaring `flat: true`, a `dossier` array and `options` on each
step; `tools/check_smartcity.mjs` validates it like any other sim.

## Real union and certification requirements

Every sim's header carries a `certification` field naming a real national/international
union and a real, verifiable certification or regulatory standard for that trade — e.g.
Charge Point: `"IBEW — NFPA 70E arc-flash qualified, EVITP-certified EV infrastructure
technician"`; Crane Yard: `"IUOE — NCCCO Mobile Crane Operator certified"`. These are
deliberately real organizations and real standards (OSHA CFR citations, NABCEP, BICSI, FAA
Part 107, NREMT, EPA Section 608, NATE, NAESA, ETCP, and more), never invented specifics like
a fabricated local number — the point is to ground the training in what the job actually
requires, on top of (not instead of) each sim's own fictional in-game rank system. The intro
screen groups all stations by category and shows both: the in-game system name (e.g. "Grid
Certification") for gamification, and the real certification line for grounding. See
`js/sims-meta.js` (generated — do not hand-edit; run `node tools/gen_sims_meta.mjs`).

## Platform integration — embedding SmartCiti.X in a platform or metaverse fabric

Everything a hosting platform needs is static and origin-bound; there is no server to
stand up. `WebXR/shared/platform.js` defines protocol 1:

| Direction | Message | Meaning |
|---|---|---|
| app → any parent | `smartcitix:ready { app, protocol }` | announced on load when embedded; carries nothing else |
| host → app | `smartcitix:identity { learner, learner_id, learner_home }` | establishes trust: `learner_home` must equal the host's real origin (identity.js) |
| host → app | `smartcitix:lrs { endpoint, auth }` | optional live LRS (lrs.js) |
| host → app | `smartcitix:open { sim \| room, skipBrief? }` | open a station on screen (from the intro or mid-run) |
| host → app | `smartcitix:hub` / `smartcitix:status` / `smartcitix:catalog` | return to the hub / ask for state / ask for the roster |
| app → host | `smartcitix:state {…}` | room, step index/count, score, level, learner, record count, LRS state |
| app → host | `smartcitix:progress { sim, step, index, count, score }` | every completed step — a live HUD's heartbeat |
| app → host | `smartcitix:record { record }` / `smartcitix:credential { assertion }` | every finished attempt / every pass with a real certification |

Commands are accepted, and events sent, only to the `learner_home` origin — a frame that
has not identified the learner from its own origin gets nothing and can do nothing. The
same channel is wired in Trade Skills Simulator (`room` instead of `sim`).

`WebXR/smartcity/catalog.json` (generated by `node tools/gen_catalog.mjs`, checked for
freshness in CI) is the roster a platform indexes without loading anything: every station
and room with category, trade, union, certification, badge, rank ladder, step kinds, hazard
count, deep link and the launch parameters above. A metaverse world places a station as a
portal with that link plus the learner's launch context, listens for `progress` and
`record`, and reads credentials from the Open Badges hand-off — the whole apprentice
record (33-level ladder, badges, certifications) travels with the learner because all three
apps share one profile and one records log.

## Practitioner review packet

`WebXR/smartcity/REVIEW.md` (generated by `node tools/gen_review_packet.mjs`) is the document the
subject-matter review happens on: one section per station and room with the trade, the union
and certification claimed, every step with the rationale the learner sees, every seeded hazard
with its consequence text, the dossier sources for flat stations, and a sign-off block for a
qualified practitioner in that trade — reviewer, qualification, date, verdict, required
changes. Until a station's section is signed "approved as evidence of readiness", records from
it are training records, not evidence for the named certification. Regenerate the packet after
content changes and transcribe verdicts to the tracking system; it is deliberately not in the CI
freshness check so filled-in verdicts are never overwritten by a build.

Every section carries two signatures. The first is automated and already present: a **preview**
verdict the generator signs after running the checks a machine can make — category, trade and
certification named; a rationale on every step; a judgeable consequence (40+ characters) on
every hazard; late notes on real targets; the scene builds inside the 320-mesh headset budget;
every dossier statement sourced. The generator exits non-zero if any section fails, and writes
the same verdicts to `review-preview.json` so a portal can show "preview passed, sign-off
pending" per station. All 89 sections pass preview today. The second signature is the
practitioner's, blank until a named person signs it; a preview pass is the entry ticket to
review, not a stand-in for it. Every Trade Skills room now names its union and the real
certification or standard it maps to (NFPA 70E, ServSafe, CLSI GP41, AWS D1.1, ASSE 5110 and
so on), which the preview requires.

## Training programmes

A station teaches one procedure. What a training director runs is a **programme**: an ordered
block with a reason for each station being in it and a completion rule they can show a
regulator. `js/curricula.js` holds seventeen, each naming a real union and the standard the block
maps to — Inside Wireman first period (IBEW), Confined Space entry and rescue, Working at
Height, Hazmat and Environmental Response, Rigging and Lifting, Stationary Engineer, Port and
Terminal Operations, Transit and Ramp Operations, Energy Transition Systems, Live Events
Production, Hunters Point Clean-up and Bay Restoration, Ports, Maritime and Bay Ecology, Air
Quality Monitoring and Control, Culinary — The Working Kitchen (UNITE HERE Local 2), Dental
Hygiene — Unspoken Smiles, Bartending — Behind the Bar, and Situational Awareness —
Interruption Drill. [`docs/wiki/SmartCitiX-Training-Series.md`](../../docs/wiki/SmartCitiX-Training-Series.md)
is the generated series page: every programme with its stations, conditions, eval score and a
spawn screenshot (`node tools/gen_wiki.mjs` regenerates it). Programmes cross both apps, the way an apprenticeship does: the electrical
block opens on the Trade Skills panel bay and ends in a grid battery yard.

Hunters Point Clean-up and Bay Restoration is the one built on a single real site, worked in
the order a cleanup actually runs. It opens with the flat, sourced Hunters Point briefing
station and runs eleven stations in cleanup order: the record itself, the radiological survey,
fence-line air monitoring, excavation and haul-out, the decon corridor, groundwater sampling,
the pump-and-treat system left running behind it, the wet-weather outfall grab, sediment
dredged from the bay, the tide let back through a rebuilt gate, and the shoreline replanted
last. The real site is not rendered as a walkable scene — the briefing is a flat dossier
because turning an active Superfund shoreline into a stroll would misrepresent the place and
the people who live next to it — and the trade stations that follow it are sited generically
rather than claiming to be the shipyard itself. The programme names the unions that would
actually do this work: LIUNA Local 261 hazmat and environmental laborers, IUOE Local 3
operating engineers, Teamsters regulated-soil drivers, Pile Drivers Local 34 (Carpenters), UA
Local 38 plumbers and pipefitters, and the Inlandboatmen's Union of the Pacific.

A station counts toward a programme when the shared training record says it was **passed** —
two or more stars with no unsafe action — which is the same bar the certificate claim rests
on, so a programme can never show complete on stations that were only played. **Training
programmes** in the intro menu (or saying "programmes") opens the card: progress per block in
the programme's own accent, every station with its reason for being there, and a button that
opens the next unfinished one, in this app or by handing off to Trade Skills. The card
refreshes after every completed run.

`catalog.json` publishes the programmes with their completion rule so a platform or LMS can
index them without loading the app, and `tools/check_smartcity.mjs` fails the build if a
programme names a station that does not exist, omits a union, a certification or a summary, or
leaves a station without a reason — a block a learner can never finish is a build error, not a
content bug.

## Life on the site

The apron gave every station a gate, a laydown, a crew truck and a muster point, and it was
completely deserted. An empty site does not read as a site — it reads as a model of one, and a
learner being taught to work around other people was being shown a world with no other people in
it.

`js/ambient.js` puts a crew on it: a supervisor by the gate with a clipboard watching you come
in, two working stock on the laydown, a banksman on the plant route with his wands down. They
shift their weight and glance about rather than standing like mannequins. A yard truck runs a
slow loop outside the fence with its beacon turning, and a vent on the boundary breathes a
plume. Nobody here is a step target or a hazard; the procedure is unchanged.

It is affordable because of a second mode on `mergeStatic()`. Baking into **local** space instead
of world space lets a subtree keep its own transform, so a figure or a truck collapses to two or
three meshes *and still moves as a unit* — the whole ambient layer costs **eight draw calls** for
seventy-five authored meshes. Without that it would have cost eighty and undone the optimisation
pass that came before it.

## The site around the work

Every station was authored as a 2-to-2.6 metre work area, and the learner was clamped to a
circle of `footprint + 2.4m` around the middle of it — about four and a half metres on a
fifteen-metre plaza. You could turn on the spot and reach everything, you could not walk
anywhere, and the other ten metres of ground were empty pavement you were not allowed on.

`js/apron.js` fills that ground with what is actually between a gate and a job: the site entry
with its induction board and its today-on-site board, a marked walkway in with cones down it, a
**materials laydown** with painted bays, pallets, pipe stock and drums on a bund, the **crew
truck and welfare cabin**, a **muster point** with the headcount board, and the **waste, spill
kit and eyewash** station. The learner spawns outside the gate facing the work and walks in past
all of it, which is how a shift starts. Roam went from about 4.5m to 10.1m.

The apron is **scenery only**. Nothing on it is a step target or a hazard, so no station's
assessment changed by a single point — what changed is the distance, and therefore whether the
place reads as somewhere you are standing. It costs 179 meshes for an entire job site: the
perimeter fence is four meshes a segment (two posts, two rails and one mesh decal) rather than
the eleven an honestly-drawn Heras panel takes, because at the six metres you ever see it from
they are the same picture.

Indoor stations get none of it — they get their own room's walls as the roam limit and start at
the door instead of mid-floor. AR gets none of it either: the learner's own room is the site,
and a fence line through their furniture helps nobody.

## The layout, budget and parse checkers

`tools/check_layout.mjs` asks the question the content checkers never did: not *does this
control exist*, but *can the learner get to it*. It builds all 89 stations and rooms, resolves a
real world position for every object through the group transforms, and fails on a step target
outside the walkable circle, anything below -2.4m, anything within 1.4m of where the learner
arrives, and any coordinate past 60m or non-finite anywhere in the scene.

That last one is the generic form of a real bug: a dropped positional argument slides a colour
into a position slot, so `0xb9bec4` becomes 12,172,996 metres. It found two — a required target
in Confined Rescue's sequence step and a D-ring in Microwave Backhaul — both of which had
registered correctly and passed every other check for months.

It also asks whether the people in the scene are standing anywhere real. That rule was written
for the trades bays and, for a long time, only ever ran there: it looked for figures among
`root.children`, and a SmartCiti.X station builds everything inside one group, so it found none
and passed all fifty stations without testing one of them. Walking the tree instead found
nineteen figures standing inside equipment — a dock-crane signaller 0.04m from a mesh, a
scaffold erector at 0.14m.

The threshold differs by app, because the two are not asking the same thing. A metre of
clearance in an eight-metre bay is a crowding check. A SmartCiti.X station is a two-metre
working area where standing beside the cabinet is the job, so there the only question is whether
the figure is intersecting something, which for a body about 0.3m across is anything inside
0.45m. Two of the nineteen were right as built — a casualty down the hole in Confined Rescue, a
coworker riding the forks in Forklift Dock — so `standingFigure` takes an `atStation` opt-out for
a figure whose position against the equipment *is* the content.

`tools/check_parse.mjs` asks the one question the rest of the suite is structurally unable to
ask: does every shipped module parse. Every other checker loads a simulator by stripping its
import statements and concatenating what is left, so a malformed import — the one part they
delete — is invisible to all of them. Two simulators shipped with a doubled comma in their
import list, threw `SyntaxError` the moment the app lazy-loaded them, and could not be entered
at all while all sixteen checkers passed. It covers the `dist/` copies too, since those are what
the browser fetches and a stale copy of a fixed file is a live fault.

`tools/check_budget.mjs` enforces the mesh ceiling that `catalog.json` had only ever reported.

## Interiors: a room for the stations that are indoors

A chlorine room, a machining cell and a theatre loft do not stand on a plaza under a city
skyline, and putting them there was the last obvious lie in the environment. A station declares
`indoor: "<style>"` and `js/interiors.js` builds a room around it instead: a floor with painted
walkways and a hazard-edge stripe, walls with a trim stripe in the station's accent, a ceiling
with real structure, light fittings that each carry a light, and a way out — a roller shutter, a
personnel door or a dock opening.

Six styles cover the roster. **Plant** and **service** rooms get overhead pipe runs on hangers;
**shop** and **garage** get roof trusses and deck-plate floors; **theatre** gets a black-walled
fly tower with a catwalk. **Datahall**, the sixth, shares the shop and garage's deck-plate
floor but trades the trusses for overhead cable trays, has no rooflights at all — daylight is a
heat load and a security problem in a hall, so the only light in it is the light somebody
installed — and runs four rows of ceiling fittings instead of three for the even light a row of
racks needs. Twenty-one stations are tagged today: six plant, five theatre, four shop, three
service, two garage, one datahall.

The weather does not stop existing indoors — it is what the rooflights are showing. Their
brightness follows the hour (`?time=`), and in rain or storm they go grey and flicker. The
station still reports its conditions in the brief, because a technician in a plant room still
has to know it is blowing outside. The theatre style has no rooflights, which is also true.

An interior is cheaper than the plaza it replaces: 84 meshes and 8 lights for a machine shop,
38 and 6 for a stage house, against 239 and 16 for the outdoor plaza with its district and
skyline. `catalog.json` and `sims-meta` carry each station's `indoor` style and the checker
rejects a style outside the six.

## Weather: the conditions each procedure is written for

Every station declares the weather its procedure actually assumes, and the stage builds it
(`shared/weather.js`): the stormwater grab happens in rain because it is a wet-weather sample,
the scaffold lift and the aerial set happen in wind because wind is what derates them, the
decon corridor and the fence-line monitor happen in wind because both are laid out by it, and
track access happens in fog because fog is what stops hand signals working. Six kinds — clear,
overcast, rain, fog, wind, storm — each with falling or wind-borne particles, a wet-deck sheen,
scaled fog and light, and, on a storm, lightning. `?weather=<kind>` overrides for a hall that
wants to drill a crew in conditions a station does not default to.

The point of the layer is the note, not the particles. Each kind carries one line about what
the weather means for the work ("footing is slick, anything on the deck is going somewhere,
and paper gets useless fast"), and that line is shown with the station's tagline when the
learner arrives. `catalog.json` carries each station's `weather` so a platform can index it,
and the checker rejects any value outside the six. Indoor stations stay clear. AR mode gets
none of it: the learner's own room is the weather there.

## Headset-pass instrument

Add `?perf=1` to any SmartCiti.X URL and the app keeps the last three seconds of real frame
times, samples the renderer's draw calls and triangles twice a second, shows them in a corner
readout on screen and on a line of the in-headset HUD, and writes one summary per completed run
(station, mode, in-headset or not, average, 95th-percentile and worst frame time, calls,
triangles, user agent) to a local log. Clicking the readout downloads the log as JSON. This is
the data the Quest pass records, heaviest stations first per `catalog.json`; nothing runs
without the flag and nothing leaves the device unless the log is exported. The shared module is
`shared/perf.js`; `tools/check_verify.mjs` checks it stays inert without the flag and computes
sane statistics with it.

## Accessibility

The whole procedure is operable from the keyboard in flat mode, and everything the app says
aloud is also written to an ARIA live region whether or not the voice is on. `Tab` walks the
controls this step can act on, in the order the procedure names them; `Enter` takes the one in
focus; `Space` held is a hold; the arrows work a gauge, a valve or a drifting reading. The
focused control is highlighted in the scene and read out as a sentence that says what it is,
where it sits in the list and which key works it. Hazards go to an assertive region because a
hazard is an interruption. When the system asks for reduced motion the plaza holds still — the
weather, the district, the beacons and the celebration effects stop — while the station itself
keeps moving, because a valve that does not turn when you turn it is not a simulator.

`WebXR/ACCESSIBILITY.md` is the conformance statement, written to be read by a procurement
officer: what conforms against WCAG 2.1 AA and Section 508, the full key map, and a plain list
of what does **not** conform. The headset modes are not keyboard-operable and are not claimed to
be; the accessible path is the flat mode, which runs the same procedure, applies the same
hazards, scores with the same engine and writes the same record, so a learner who cannot use a
headset is not on a lesser course. No third-party audit has been done and the statement says so.

`tools/check_a11y.mjs` runs on every commit. It checks the plumbing — the live region is a real
clipped status region, the cursor walks a step's controls in procedure order, every step kind
names the key that works it — and the content contract across all 89 procedures: every step has
a title, a cue and a rationale in words; every item in a multi-target step is named in words;
every graded control prints its value as text rather than relying on a coloured band; and every
hazard explains itself in a full sentence.

## Instructor mode

`WebXR/instructor/` is the console for the person running the class: a live view of the
sessions open in other tabs and windows **on this machine**. It shows where each learner is in
the procedure, their score, corrections and unsafe actions, every hazard as it happens with the
consequence text the learner saw, and the verdict when they finish. Select a session and you
can put a line in front of that learner (it lands on their rail and is spoken) or hold their
clock until you release it. Both simulators publish to it, so one console watches a class
working across SmartCiti.X and Trade Skills at once.

The transport is a browser `BroadcastChannel` (`shared/observer.js`), which is same-origin and
same-device by definition. That covers what a hall actually has — a row of laptops, or headsets
mirrored to one screen — and it is the honest boundary: an instructor watching from another
machine needs the relay, which is a roadmap item and is not pretended at here. When a simulator
is embedded in a learning platform the same events already go to the host page through
`Identity.emit`, which is the other path. Nothing on the console is stored; it shows what is
happening right now, and the durable record of an attempt is the learner's training record.

`tools/check_observer.mjs` exercises the protocol against a BroadcastChannel stand-in: events
reach the console with their protocol version, a roll call makes an already-running session
announce itself, a command addressed to one session is ignored by the others, instructor text
and hazard notes are clipped so a long message cannot flood a console, state snapshots are
throttled, the roster reducer folds a stream into what the console renders, and every call is a
no-op in a browser without BroadcastChannel.

## Credential verifier

`WebXR/verify/index.html` is the page a training director or employer checks an exported
credential on, without the issuing hall's cooperation: paste or drop an Open Badges 2.0
assertion (one, a list, or the export wrapper) and it checks the context, type, id, recipient,
dates, verification type, badge class, criteria, issuer, image and evidence on the page,
flags the `smartciti.example` placeholder home that means the hall never hosted the
assertion, and, on request, fetches the hosted copy at the assertion's own id and compares.
The verdict is honest about what it knows: a structural pass without a hosted match is
"self-asserted", a hosted match is "the issuing hall stands behind it", a mismatch is
"altered". The logic is a plain module (`verify/verify.js`) checked by `tools/check_verify.mjs`
against a real exported assertion and eleven ways of breaking one.

## Districts: a horizon per trade category

In VR and on a flat screen every station sits on the same plaza with the same marquee and
skyline, and since the 2026 expansion, a **district** for its trade category on the horizon
between the two (`js/districts.js`): transmission pylons with catenary lines behind an Energy &
Power station; a container terminal, ship-to-shore gantries and a ship at anchor behind
Maritime & Ports; a tower crane that slews behind Construction & Structural Trades; a truss
arch with sweeping moving-head lights behind Entertainment & Live Events; a monorail guideway
with a passing train and signal heads for Mobility & Transit; clarifier tanks over still water
for Water & Environmental; a lattice tower with dishes for Connectivity & Telecom; a fire
engine and an ambulance with light bars for Emergency Services; saw-tooth sheds and stacks for
Manufacturing & Automation; a rooftop plant with a turning cooling-tower fan for Building
Systems & Facilities; a containment shroud with an abrasive silo, a coatings store and a
dehumidifier skid for Surface Prep & Coatings; and low hills over the bay with monitoring
masts and a windsock for Environmental Monitoring. Each district also sets the sky, fog,
hemisphere and light-mast
tint, so a substation reads sodium-warm and a company switch reads violet without any station
code changing. The districts are authored for night, and night is lit to read: a lifted sky and fog, a
strong hemisphere and key, an ambient fill so no face of a station goes to black, and a
brighter station wash. `?time=dusk` or `?time=day` lifts the sky, fog, hemisphere and key
light further for a hall running a day shift and turns the masts down. Districts are twenty to sixty kit meshes placed in the ring between the plaza
edge and the skyline, lit by one directional flood plus a faint self-glow (a point light under
physically-based falloff is black twenty metres out), and animated by property tweaks on
already-built materials. The hub keeps the default sky. AR mode is unchanged: passthrough is
the environment there.

A station stands in front of its own category's district by default, but can name a different
one: `district: "<name>"` on the sim's header sends it to another district's horizon instead,
for a station whose category is administrative but whose real backdrop is somewhere else.
Living Shoreline and Tide Gate are both filed under Water & Environmental for their trade, but
stand in front of the Environmental Monitoring district because the work happens on the bay,
not at a treatment works. `tools/check_smartcity.mjs` rejects a `district` that names anything
other than one of the districts actually built in `js/districts.js`.

A district can also open a gap in the skyline ring behind it: `skylineGap: [from, to]`
(radians) removes the city skyline across that arc instead of ringing a shoreline with towers
that have no business there. Environmental Monitoring is the one that uses it — no skyline on
the water side, replaced with far-shore hills, a tidal flat with cordgrass coming back along
it, a perimeter fence carrying the site's own dust monitors, and a clamshell dredge working a
bucket cycle offshore, so a learner standing at the bay sees a shoreline instead of a city
across the water.

## Headset budget

`catalog.json` carries a `meshes` and `lights` count for every station, from a headless build,
and flags `overBudget` past 320 meshes — the working ceiling for a Quest-class headset on top
of the shared stage. The headset pass starts with the heaviest stations.

That ceiling is enforced, not just reported: `tools/check_budget.mjs` builds all 89 stations
and rooms against the headless harness and fails on anything past its budget — 320 meshes for a
SmartCiti.X station, which sits on the shared stage, and 430 for a Trade Skills room, which *is*
the whole scene.

**Draw calls are the number that actually matters, and they were measured, not assumed.** An
outdoor station was drawing **518 calls** from 652 visible meshes: frustum culling only takes
about a fifth off, because most of an outdoor scene is the ground and the horizon and those are
always in shot. Almost all of it is scenery that never moves and is never clicked, and every
mesh of it already shares a cached material with its neighbours, so `mergeStatic()` bakes each
material's worth into a single buffer at the end of the build.

| scene | before | after |
|---|---|---|
| Solar Deck (outdoor station) | 518 calls, 652 meshes | **403 calls**, 437 meshes |
| Weld Bay (Trade Skills room) | ~300 calls, 366 meshes | **167 calls**, 288 meshes |

The station's own geometry is never merged — it is the part the procedure touches, and a merged
mesh has no separate parts to rotate, open or light up. Nor is anything carrying its own
material: the rooftop beacons and the marquee trim animate `emissiveIntensity`, so they clone
their material and the merge steps over them.

Finding that turned up a latent bug worth naming. `mat()` returns a material **shared by value**,
so `mesh.material.emissiveIntensity = x` in an animate loop writes to every other mesh of the
same colour and finish. The skyline beacons had cloned for exactly this reason; the marquee trim
and the site gate's beacon had not. `ownMaterial()` is now the named way to do it.

Note that `check_budget` counts what the build *asks for*, before merging — the merge no-ops
under the headless stub. That is deliberate: merging is not a licence to author without limit,
because every merged mesh still costs vertices and every unique material still costs a call.

## Robot trainees and synthetic training data

`WebXR/shared/robot.js` is a software learner. It sees exactly what the procedure engine
exposes (step kind and targets, gauge/track/turn state, score, streak, errors) and emits one
action at a time — select, commit a gauge, press, release, rotate, drop — parameterised by a
single **skill** in [0, 1]: an expert never misses; a novice lapses, commits gauges off
centre, lets holds go early, and sometimes reaches for a seeded hazard. Everything is seeded
and reproducible.

Two ways to run it:

- **Headless, at scale** — `node tools/robot_train.mjs` plays every SmartCiti.X station and
  Trade Skills room and writes `tools/out/robot/`: `manifest.json` (per station, the
  **optimal skill** — the level at which the success rate lands in a target band, 60–80% by
  default, found by bisection — plus the whole difficulty curve behind it), `episodes.jsonl`
  (one line per episode: score, stars, corrections, unsafe actions, pass/fail, awards) and
  `trajectories.jsonl` (one line per decision: observation, action, reward, feedback) —
  synthetic training data across all the trades, regenerable from the seed. Flags: `--apps`,
  `--only`, `--skills`, `--episodes`, `--band`, `--seed`, `--out`, `--no-trajectories`.
  A default run (30 stations, 900 episodes, ~22k decisions) takes about two seconds.
- **Live, in the browser** — open any station with `?robot=<skill>` (e.g.
  `index.html?sim=charge-point&robot=0.85`) and the agent runs it through the same click,
  press, rotate and drop paths a learner uses, so the scene, HUD, records and ladder react
  as they would to a person; its decisions are on `window.__smartcityRobot.log`. A robot
  run records to the training log like any other attempt — clear or filter it before
  exporting a learner's record.

The optimal-skill number is the honest use of this: it tells you how hard a station is
relative to its siblings, which stations an expert still fails (over-tuned) or a random
agent already passes (under-tuned), and where a learner's cohort should be pitched. The
trajectories are what a model would train on to imitate or grade procedure execution;
they are engine-level (ids, states, rewards), not pixels. `tools/check_robot.mjs` gates
the layer in CI.

## Situational Awareness — a programme built on the new dimension

Ten programmes become eleven, and the new one is the first that is not organised around a
trade. **Situational Awareness — Interruption Drill** is the twenty-two procedures that interrupt you,
run as a cross-craft refresher block: the Isolation Bay, Weld Bay and Draw Bay from Trade Skills,
and the Trench, Crane Yard, Chlorine Room, Confined Rescue, Substation Switching, Airport Ramp,
Fire Pump, Tower Climb, Elevator Pit, Boiler Room, Forklift Dock, Transformer Vault, Wind Nacelle,
Digester Gas, Data Hall, Steel Erector, Triage Point, Dock Crane and Press Brake from SmartCiti.X.

Every station in it is one a learner may already know the order of. The block is not testing the
order. It is testing whether they notice the alarm, the person in the wrong place, or the thing
that moved while their hands and eyes were somewhere else.

So it is reported on separately. `curriculumProgress()` returns an `attention` figure alongside
the usual station count — interruptions caught against interruptions dropped, across every run
of that programme's stations — and the programme card shows it. Passing the procedure and
noticing the alarm are two different competencies, and a training director wants both on the
page.

## Interruptions — the part of the job that is not the procedure

Every step kind in this engine asks the same question: **do you know what comes next.** That is
worth assessing and it is not what gets people hurt. What gets people hurt is the thing that
happens *while they are busy* — somebody walks into the exclusion zone, a reading drifts out of
band, a lock comes off a hasp, a tug clips a chock — and the crew is too task-loaded to notice
for thirty seconds.

So an interruption is not a step. It arrives unannounced partway through a step the learner is
already working, it runs on its own clock, and the learner has to break off, deal with it and
come back. The procedure underneath is untouched: the same steps in the same order, scored the
same way. What changes is whether you were paying attention.

```js
interrupts: [{
  id: "extraction-trips", kind: "Plant alarm",
  after: "amps", delay: 5, seconds: 14,
  alert: "The fume extraction has tripped out. The hood is dead and the fan noise has stopped.",
  target: "fume-arm",
  why: "Extraction goes back on before the arc does...",
  missNote: "You set the machine and welded with dead extraction...",
}]
```

**Scoring is deliberately asymmetric.** Catching one is worth more than a step (120, plus up to
60 for answering fast) because noticing is the harder thing and the one nobody practises.
Missing it, or reaching for the wrong control, counts as an **unsafe action** rather than an
ordinary mistake — in every authored case the thing that went unanswered was a safety condition,
and that means it lands on `hazardHits`, which is what the pass rule and the badges key off. A
run can be procedurally perfect and still fail on the alarm it slept through, which is the
point.

139 are authored across 70 procedures, of which these are representative: the Weld Bay (extraction trips mid-setup,
fire blanket slips mid-bead), the Isolation Bay (your lock comes off the hasp while you are
testing dead), the Draw Bay (the patient goes vasovagal while your eyes are on the tube rack,
somebody offers you a pre-labelled tube set to save time), Confined Rescue (the meter alarms
while you rig, the attendant leaves the hole during the haul), Substation Switching (an
unescorted visitor in the yard, control calling with a verbal change to the order), the Airport
Ramp (a catering truck inbound past an unset equipment line, a tug kicks the nose chock before
the bridge docks), the Trench (spoil creeping back toward the lip above an entrant, the spotter
walking off mid-programming), the Crane Yard (somebody cutting through the swing radius, an
outrigger pad settling with the load up), the Chlorine Room (the room monitor alarming during a
changeout, the attendant standing in an open door during a leak test), the Fire Pump (hot work
opened while the sprinklers are impaired for your test, the packing gland going from a drip to a
stream), the Tower Climb (an untethered wrench creeping to the platform edge above your ground
crew, the crew themselves walking into the drop zone), the Elevator Pit (a hall call registering
while you stand in the runby, somebody working your lock off the hasp while you are on the car
top), the Boiler Room (the block valve passing after you proved the isolation, the building
management system calling for steam while you are inside the firebox) and the Forklift Dock (the
trailer walking off the plate while you are in the box, a picker stepping into the aisle on the
side the load hides).

**Every one of them visibly changes the world.** The fan stops turning and its lamp goes red;
the lock is simply gone off the hasp; the spoil is closer to the edge than it was; the swing
radius marker goes hot; the level bubble is off centre; the chock is sitting clear of the tyre.
A station declares `onInterrupt(it)` and `onInterruptEnd(it)` alongside its `onStepComplete`, and
puts it back only when `it.resolved === "answered"`. This is not decoration — the skill being
assessed is *noticing something*, and an alarm you can only read is a caption.

Everything downstream already knows about them. They get their own rows in the step debrief with
how long each took to catch; `toXAPI` exports `interrupts-caught`, `interrupts-missed` and the
full `interrupt-log`; the instructor console sees them come through as hazards; and the **robot
trainee** answers them, with noticing-at-all scaling on skill rather than knowing which control
to reach for — so a novice policy stalls and runs the clock out, which is exactly how it goes on
a real job.

`tools/check_interrupts.mjs` validates every field and then drives the engine: that an armed
interruption fires after its delay, times out if unanswered, counts the miss as an unsafe
action, scores a correct answer, and is **disarmed when the learner leaves its step**. It also
rejects an interruption whose response is the control the learner is already holding — that is
not an interruption, it is a nudge — and, via `tools/interrupt_react.mjs`, one that fires
without changing anything in the scene.

The disarm rule came out of that probe finding a real bug. An interruption armed on a step the
learner finished faster than the fuse stayed armed and fired several steps later, where its
alert made no sense *and* reaching for the control the current step actually wanted was scored
as a wrong response to an alarm nobody could have expected. An interruption is an event during a
particular task: get through the task faster than the fuse and there was no window.

## Per-step debrief

A score at the end of a run says a learner passed. It does not say where they hesitated, which
step they had to correct twice, or which one they got through only by luck. The engine now times
every step as it is worked and keeps a record of it: seconds on the step, corrections made,
unsafe actions taken, points earned, and whether the step was clean.

The results screen shows that record as a collapsed **Step debrief** panel. Each row is one step
with a bar scaled to the longest step in the run, so a step that took four times as long as the
rest is visible at a glance rather than buried in an average. Rows are toned three ways: clean,
corrected, and unsafe. Under the list, two lines name the step that took longest and the step
that gave the most trouble, which are usually not the same step and are the two an instructor
asks about first.

The debrief is what makes a repeat attempt worth something. A learner who passes at 71% learns
nothing from the number; a learner who can see that eleven of twelve steps were clean and the
twelfth cost them four corrections knows exactly what to run again.

It persists. The attempt record carries the whole step log, and `toXAPI` maps it into result
extensions — `clean-steps`, `median-step-seconds`, `slowest-step` and the full `step-log` — so a
learning record store receives the per-step detail, not just the verdict. Trade Skills carries
the same panel and the same record shape; the engine is shared, so there is one implementation.

## Gamification 2.0 — flipped classroom and portable credentials

The first run of any walkable station on screen is preceded by a **pre-brief**: the
station's real procedure as study material — every step and the reason behind it, the real
union and certification it maps to, and how many hazards are seeded (never which). Reading
it stamps the shared profile (`Progress.markBriefed`), and the run that follows starts
*prepared*: the engine-wide **Prepared** award and a 10% score bonus on that run. Skipping is
allowed and costs only that. The idea is the flipped classroom — learn the procedure first,
then prove it in the simulator — and because the mechanic lives in `shared/game.js` it works
identically in Trade Skills Simulator; Holodeck's generated procedures have no fixed brief
and are exempt. Flat briefing stations are their own brief.

Every passing run on a station with a real certification is also a **portable credential**:
the Training Records overlay lists the certifications earned and exports them as **Open
Badges 2.0** assertions (`toOpenBadges` in `shared/records.js` — BadgeClass, issuer profile,
recipient from the launch identity when there is one, evidence pointing at the same xAPI
statement the LRS receives). A host page that launched the learner also receives each new
assertion live as `{ type: "smartcitix:credential", assertion }`, so badges and
certifications carry across the whole SmartCiti.X network and into any external ecosystem
that ingests Open Badges or listens on the launch channel (Cognition.X or any other host —
none is special-cased here). These are self-asserted by a static page: hosting the
BadgeClass and Assertion URLs under an issuer is what makes them verifiable, and the ids are
laid out for that. Passing a simulator evidences readiness for the named certification; it
is not the certification.

## Gamification

- **Per-sim rank ladder**: each station has its own 5-tier ladder (Apprentice → Certified by
  default, some sims override the names/thresholds) tracked by its own XP, independent of
  every other station — a learner can be a Fault Lead at the charge point and still an
  apprentice in the vault.
- **Global level**: one account-wide 1–33 level, shared with Trade Skills Simulator and
  Holodeck (`shared/game.js`'s `Progress` object — see that file's comments for the full
  design). It's named in trade-apprenticeship tiers (Trainee → Apprentice → Journeyworker →
  Technician → Specialist → Foreman → Master → Certified Master → Legend at 33) and shown in
  the hub HUD and on a level-up in the results card.
- **Local leaderboards**: per-station, this-device-only, arcade-cabinet style.

## Training records (the enterprise layer)

The gamified profile above exists to motivate; the training record exists to prove. Every
finished run also appends one immutable entry to `WebXR/shared/records.js`'s local attempt log:
station, category, the real union/certification it maps to, score, stars, corrections, unsafe
actions, hold breaks, time vs par, the learner's crew tag and level, and a pass verdict. The
pass rule is stated once in code and used everywhere: **two or more stars with no unsafe
action** (which is the engine's own 2-star gate — at most one correction, inside 1.5× par).

The **Training records** overlay (intro screen, or say "records") is the instructor view:
a per-category roll-up of stations passed / attempts, the attempt table with PASS/FAIL, and
two exports —

- **CSV** (RFC 4180) for a spreadsheet, HR system or a union hall's training register;
- **xAPI 1.0.3 statements** (JSON) for a Learning Record Store — `passed`/`failed` verbs,
  the station as a `simulation` activity, score/success/duration in `result`, and the
  category, certification, stars and unsafe-action count as extensions. `homePage` is the
  page's own origin, so activity and actor ids are stable per deployment.

Records never leave the browser on their own; export is the hand-off. No biometric or
inferred-emotional signal is recorded — see `WebXR/shared/orbis-stable.js` for the wider
safety posture that any future adaptive-content integration has to respect.

## Learner identity and LMS embedding

A static page can't authenticate anyone, so identity is a **launch context** the host
supplies, and the docs never call it more than that. Two routes, both under the host's
control, both handled by `WebXR/shared/identity.js`:

1. **Launch URL** — `index.html?learner=Ada%20Lovelace&learner_id=al-1815&learner_home=https://lms.example.org`.
   Read once, kept per tab, then scrubbed from the address bar so bookmarks and screenshots
   never carry it.
2. **Embedding page** (iframe) — `iframe.contentWindow.postMessage({ type: "smartcitix:identity",
   learner, learner_id, learner_home }, "https://<smartciti origin>")`. Accepted only when
   `learner_home` equals the sender's real origin, so a frame can't claim a home it isn't.

With an identity present the crew-tag field is locked and derived from the name, every
record carries `learnerName` / `learnerId` / `homePage`, xAPI statements use that account as
the actor (so an LRS can join it to the LMS user), and each finished attempt is also posted
back to the host page as `{ type: "smartcitix:record", record }` — only when embedded, and only
to `learner_home`, never broadcast. A hosting LMS can therefore capture attempts live with no
LRS at all. Real authentication (LTI 1.3 / SSO) needs a server and remains the next step.

## LTI 1.3 launch — the reference relay

A static page cannot verify a signed launch, so `tools/lti_relay.mjs` is the one small server
in this repository: an LTI 1.3 / OIDC third-party-initiated login relay. The platform sends
the learner to `/lti/login`; the relay redirects to the platform's auth endpoint with a
single-use state and nonce; the platform posts the `id_token` to `/lti/launch`; the relay
verifies the RS256 signature against the platform's JWKS, the issuer, the audience (client
id), expiry, the nonce (single use, never replayed), and that it is an `LtiResourceLinkRequest`
on LTI 1.3.0 — then 302s the browser into the app with the launch context the apps already
read: `?sim=<custom.sim>&learner=<name>&learner_id=<sub>&learner_home=<relay origin>` (a
`custom.room` maps to `?room=` for Trade Skills; `custom.lrs_endpoint` passes through). From
there everything downstream — records, LRS statements, Open Badges, the platform channel — is
attributable to `sub` at `iss`. Configure with `LTI_ISSUER`, `LTI_CLIENT_ID`, `LTI_AUTH_URL`,
`LTI_JWKS_URL`, `APP_URL`, `RELAY_ORIGIN` (and `PORT`), deploy behind TLS, and register
`<RELAY_ORIGIN>/lti/login` and `/lti/launch` with the platform. `tools/check_lti.mjs` stands
in a platform with its own RSA key and proves a good launch redirects correctly and a bad
signature, wrong audience, expired token, replayed nonce or unknown state is refused.

## Live Learning Record Store

`WebXR/shared/lrs.js` is the step after the file export: connect an xAPI endpoint and every
finished attempt in any of the three apps is POSTed to `<endpoint>/statements` (xAPI 1.0.3,
batched, `X-Experience-API-Version` set) the moment it happens. A statement that cannot be
delivered — kiosk offline, LRS down, wrong credential — waits in a local queue and is retried
on the next attempt, the next page load, or **Send all records now** on the records overlay;
statements carry the record's own id, so a retry or a "send all" never double-counts at an LRS
that de-duplicates on statement id (they all do). The overlay's status line shows the host,
whether a credential is set, how many statements are waiting and how the last send went.

Three ways to configure it, all under the deployer's control:

- **Records overlay** — endpoint plus an optional credential (`user:secret` becomes Basic, a
  bare token becomes Bearer, a full `Basic …`/`Bearer …` value is used as-is). Kept per tab in
  sessionStorage; a credential is never written to localStorage.
- **Launch URL** — `?lrs_endpoint=https://lrs.example.org/xapi` (endpoint only, never a
  credential; scrubbed from the address bar like the identity params) for an LRS that accepts
  statements from a kiosk network without auth.
- **Embedding page** — `postMessage({ type: "smartcitix:lrs", endpoint, auth })`, accepted only
  from the learner's home origin established by the identity message above.

Endpoints must be https (http is allowed on localhost only). Nothing is queued while no LRS
is connected — connecting later and pressing **Send all** delivers the local history.

## Quality gate

`.github/workflows/webxr-checks.yml` runs on every push/PR touching `WebXR/` or `tools/`:
`node tools/check_all.mjs` (all twenty-three headless checkers — parse, imports, smartcity,
trades, holodeck, records, identity, lrs, robot, platform, lti, orbis-stable, verify, observer,
a11y, budget, layout, interrupts, lessons, hands, variants, incidents, crew — one line each) and a freshness check that regenerates `sims-meta.js`
and every `dist/` bundle and fails if the committed copies differ — a stale bundle is a
silent deploy of old code. Run the same command locally before pushing.

## Enterprise readiness — what is and isn't here

Done: deterministic assessment engine, real certification mapping per station, auditable
per-attempt records with standard exports written by all three apps, learner identity as a
launch context (URL or embedding page, origin-bound, with live record hand-back to the
host), accessibility basics (dialog semantics, live region, focus rings, reduced motion),
input escaping, a CI gate, and single-file/static deployment with no server dependency.

Done as well: live xAPI delivery to a Learning Record Store with an offline queue and retry; a
flipped-classroom pre-brief with a Prepared award; Open Badges 2.0 credential export and live hand-off.

Done as well: an LTI 1.3 launch relay (the one server), verified against a stand-in platform.

Not yet done, in the order it should happen: (1) deploy the relay behind TLS and register it
with a real platform (Canvas, Moodle, Blackboard) — the code is here, the registration is a
platform-side act; (2) subject-matter review of every station by a qualified practitioner in
that trade, on `REVIEW.md`, before any record is treated as certification evidence — the
automated preview signature is on all 45 sections; the practitioner signature is on none; (3) a headset
pass on Meta Quest for frame rate, comfort and in-headset legibility, heaviest stations first per
`catalog.json` — the instrument to record that pass now exists (`?perf=1`, see above), the
numbers do not; (4) the remaining stations toward 33 per category. Every one of the thirteen
categories is at least four stations deep today. Environmental Monitoring is eight (one flat
briefing, seven walkable procedures) now that the Hunters Point Clean-up and Bay Restoration
programme has landed the survey, excavation, groundwater and shoreline-restoration stations an
earlier version of this note said were still missing. (5) A hall that hosts its Open Badges
assertions, so the credential verifier can report a hosted match instead of "self-asserted".

## Running it

- **Modular source** (what you edit): open `index.html` from any static server —
  `python3 -m http.server` from this directory, or from the repo root to also reach sibling
  apps via the intro screen's cross-links. ES modules need HTTP, not `file://`.
- **Single file** (what you deploy): `dist/smartcity-x.html`, generated by
  `python3 tools/bundle_webxr.py smartcity` from the repository root — actually a folder
  (the HTML plus `sims/`, `citykit.js`, `gamify.js` alongside it), since sims are lazy-loaded;
  see that script's own comments.

## Checking it

`node tools/check_smartcity.mjs` builds every sim against a stubbed three.js and plays a
scripted perfect run through the real engine — same guarantees as `tools/check_trades.mjs`.
`node tools/gen_sims_meta.mjs` regenerates `js/sims-meta.js` from the real sim modules
whenever a sim's header fields (name, tagline, category, certification, badge, ranks, etc.)
change; the intro screen's roster renders directly from that file, so it can't drift from the
real content the way a hand-copied list could.

`node tools/add_station.mjs <station-id>` registers a new SmartCiti.X station everywhere the
tooling has to be told about it — the module list and harness array in both
`check_smartcity.mjs` and `gen_sims_meta.mjs`, and the id list in `lib/headless.mjs` — instead
of five hand-edits that fail in five different, unhelpful ways if one is missed.

`node tools/eval_content.mjs` is a graded ranking of every authored procedure across seven
weighted dimensions (variety, decisions, explanation, grounding, feedback, scene, originality),
worst-first, so authoring effort goes where it is worth most. It is deliberately not part of
`check_all.mjs`: the checkers answer whether a station is broken, and a score wired into a build
is a score people start writing content to satisfy. It prints and ranks; a person decides.
