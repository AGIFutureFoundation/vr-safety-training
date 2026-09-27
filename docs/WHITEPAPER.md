# SmartCiti.X and the WebXR training network — a whitepaper from the repository

Prepared 2026-09-27, from the working tree of this repository after merging
`origin/claude/vr-ar-safety-training-wkwmve`. Every number in this paper was
produced by running a command against that tree or by reading a named file
in it; the command or path sits next to the number. Where a page under
`docs/` states a different, older number, that page is a stale snapshot from
an earlier wave — this paper says so and uses the live figure, computed
again for this paper (`docs/whitepaper-facts.json` holds every figure below
in one machine-readable file, for the next person to refresh).

This paper does not name any AI model, AI vendor, or AI provider. Where the
platform uses a language model at all (a coach's chat panel in the separate
Unity prototype described in Section 3), this paper describes what it is
permitted to do and what it is not, not which model runs behind it.

---

## 1. Executive summary

This repository holds two related products.

The first is a Unity 6 / OpenXR prototype (`README.md`, repository root):
six workplace zones — construction, warehouse, fire response, chemical
processing, electrical maintenance, and an immersive-lab module on XR
headset safety itself — inspected by a learner who identifies two real
hazards and two controlled look-alikes per site. A deterministic assessment
engine owns hazards, scoring, and completion; an NPC coach, driven by a
locally configured chat endpoint, explains and encourages but cannot change
a score or an answer.

The second, far larger product is a family of static WebXR web applications
under `WebXR/`, of which **SmartCiti.X** is the largest. As of this paper:

| Measure | Count | Source |
|---|---|---|
| Procedures in the catalog | **525** — 516 SmartCiti.X stations, 9 Trade Skills Simulator rooms | `WebXR/smartcity/catalog.json` (`node tools/gen_catalog.mjs`) |
| Trade-union categories | **19** | same file, `categories` |
| Training programmes | **41**, each a twenty-level ladder | `WebXR/smartcity/js/curricula.js`, `CURRICULA.length` |
| Automated checkers, all passing | **45** | `tools/check_all.mjs`; `node tools/check_all.mjs 2>&1 \| tail -1` prints "All 45 checkers pass." |
| Content-quality corpus mean | **96 / 100** over 525 procedures | `node tools/eval_content.mjs --json` |
| Standards registry | **431** entries across **113** bodies | `node tools/check_standards.mjs` |
| Competencies (proof-of-training layer) | **51** (41 programme, 10 cross-programme) over 513 distinct stations and 95 standards | `node tools/check_competency.mjs` |
| Head-worn device profiles | **33** in 6 run profiles | `node tools/check_devices.mjs` |

Every station is a real union procedure, sited on a generic set rather than
a named real place, built on a shared procedure engine that scores nine
kinds of interaction, carries four scored hazards and roughly two
interruptions on average, and cites the real standards its steps answer to.
Nothing here issues a licence or a certification; every export the platform
produces says so in its own text (Sections 6 and 13).

Beyond the training corpus itself, this repository also documents: a
robot- and model-training layer that turns any station into poses, grasps
and force ceilings for a robot policy (Section 9); an opt-in, revocable
mechanism for a learner to share anonymised practice data with
agent-protocol platforms (Section 10); an accountability layer of
transcripts, refreshers and instructor attestation that is explicit about
never being a credential (Section 6); and four kinds of Easter egg that
never touch a station's steps or its score (Section 7).

## 2. Mission and the problem in union-trade training

The platform's own framing, read across `docs/README.md`,
`docs/proof-of-training.md`, and the station modules themselves, is
consistent: a worker training for a union trade needs to practise a real
procedure, under the standards a body actually publishes, before doing it
for the first time on a live circuit, a confined space, a moving crane load,
or a patient. Two constraints repeat across every document read for this
paper:

1. **A clause number is never invented.** The standards registry
   (`tools/standards.json`, Section 5) marks a citation "verified" only
   where the exact form is certain, and "unverified" — carried as a body and
   a title only — everywhere else. 137 of 431 entries are unverified for
   this reason today (`node tools/check_standards.mjs`).
2. **A simulator does not certify.** `docs/proof-of-training.md` and
   `docs/course-tracking.md` both state, in their closing sections, that
   nothing the platform exports — a badge, a transcript, an instructor's
   attestation — is a licence or a certification issued by OSHA, NFPA,
   ANSI, a state board, or a union. `tools/check_records.mjs` gates on this
   directly: it counts every occurrence of `certificat\w*` in the
   transcript's own text and asserts each one sits inside a `not …
   certificat…` phrase.

The trades represented are wide rather than narrow: electrical (IBEW),
confined-space and hazmat (LIUNA, UA, IAFF), fall protection (Ironworkers,
Carpenters), maritime and port operations (ILWU, MEBA, SIU), dental hygiene
and dental careers (SEIU, UFCW, ADHA, ADAA, DANB), culinary and hospitality
(UNITE HERE), sewing and garment trades (Workers United/SEIU), first
response (IAFF, NASW, AFSCME), railroad crafts (BLET, SMART-TD, BMWED),
elevator construction (IUEC/NEIEP), and more (Appendix A lists all 41
programmes with their unions). A handful of programmes are civic or
educational rather than union-apprenticeship in the traditional sense —
Basketball Fundamentals is taught against USA Basketball's youth
guidelines rather than a trade apprenticeship, and two Hunters Point
programmes stand a real, ongoing Superfund cleanup as their subject rather
than a single trade.

## 3. Architecture

### 3.1 Four independent static applications

`WebXR/` holds four independent web applications, linked from
`WebXR/portal/index.html`:

- **SmartCiti.X** (`WebXR/smartcity/`) — the main training network, 516
  stations across 19 categories and 41 programmes.
- **Trade Skills Simulator** (`WebXR/trades/`) — a nine-room vocational
  demo (Isolation Bay, Colour Studio, Hot Line, Draw Station, Weld Bay,
  Deploy Bay, Rough-In Bay, Wash-Down Yard, Coatings Bay) that shares its
  apprentice profile with SmartCiti.X.
- **Holodeck** (`WebXR/holodeck/`) — a prompt-driven generator that builds
  a scored procedure from a spoken or typed description, or loads any real
  SmartCiti.X station by name.
- **Safety Campus** (`WebXR/campus/`) — a single static page carrying the
  Unity prototype's own six-site inspection curriculum, with the same
  deterministic scoring, for the Meta Quest Browser and a desktop
  fallback.

A fifth page, `WebXR/index.html`, is a generated homepage listing every
station with a deep link (`tools/gen_home.mjs`), and
`WebXR/instructor/index.html` is a separate console (Section 11) with no
simulation code of its own.

### 3.2 The shared procedure engine

`WebXR/shared/game.js` (1,267 lines) is the assessment engine every app
above imports. Its own header states the contract: "A room supplies an
ordered list of steps. The engine owns correctness: it decides whether an
interaction advances the procedure, applies score, and produces the
coaching line the HUD shows. Rooms never score themselves, so the
assessment stays deterministic and auditable." The engine recognises nine
step kinds:

| Step kind | What it asks of the learner's hands |
|---|---|
| `select` | Choose the one correct target among several |
| `sequence` | Choose several targets, in the required order |
| `find` | Choose several targets, order not required |
| `gauge` | Bring a dial or reading into a green band, then commit |
| `hold` | Hold a control for a declared number of seconds |
| `track` | Follow a moving target continuously for a duration |
| `turn` | Rotate a control a declared number of turns |
| `drag` | Pick up a target and place it at a declared drop point |
| `drive` | Operate a vehicle through a scripted driving task |

(`WebXR/shared/game.js`, the `step.kind ===` branches; `tools/eval_content.mjs`'s
own `KINDS` constant lists the same nine.) Scoring is fixed and stated in
the engine's own constants: 100 points per correct step, a 25-point penalty
for a wrong control, a 50-point penalty for touching a registered hazard
(recorded as an unsafe action), a combo multiplier up to 2.0x for
consecutive correct steps, and 120 base points plus up to 60 more for
answering an interruption quickly. Stars are decided by corrections and
time against par, not by raw score — the rubric explains, in its own text,
"why a high score can still fail": a fast run with one unsafe action scores
well and still fails the mastery rule (Section 6).

### 3.3 Interruptions

Every declared interruption fires mid-procedure, arms a control the
learner must find while still holding the task, and times out if ignored.
Across the corpus today there are **1,036 interruptions across 518
procedures** (`node tools/check_interrupts.mjs`) — an average of two per
procedure that carries any, consistent with the design template every
category README describes ("four scored hazards and two interruptions").
`WebXR/shared/interrupt_react.mjs`'s companion checker proves each
interruption's reaction actually changes the scene, not only the banner
text.

### 3.4 Districts, environments and generators

Four scenic districts — `golden-gate-deck`, `bay-underwater`, `gym-court`,
and `open-range` — hold outdoor and specialised stations under a shared
120-mesh-per-district budget (`node tools/check_districts.mjs`: 69, 25, 35
and 89 meshes respectively, roam radii from 7.0 m to 13.2 m). A station can
instead declare a licensed, redistributable `.glb` environment
(`WebXR/shared/environment.js`) in place of the generated skyline;
`WebXR/assets/env/ATTRIBUTION.md` lists every model that ships this way
with its licence (today: a CC0 placeholder street and one CC-BY-4.0 scanned
guide-worker figure, decimated to about 3% of its original triangle count).
Everything else — the plaza, the props, the fleet, the crew figures, the
weather — is generated procedurally at runtime from a shared kit
(`WebXR/shared/kit.js`, `textures.js`, `props.js`, `fleet.js`,
`equipment.js`, `toolkit.js`), so no external model download is needed to
render a station at all: `node tools/check_fleet.mjs` reports 68 kit
builders (fleet.js 27, equipment.js 20, toolkit.js 21), `node
tools/check_all.mjs`'s `check_props.mjs` line reports 25 site-dressing
props under a 14-mesh authored ceiling, and its `check_textures.mjs` line
reports 16 procedural face painters and 9 trade colour palettes.

### 3.5 Bundling and publishing under a file cap

The modular source under `WebXR/<app>/js` is what a contributor edits.
`tools/bundle_webxr.py` inlines it into a distributable file per app: for
Trade Skills Simulator and Holodeck that output is genuinely
self-contained; for SmartCiti.X, whose 516 stations are lazy-loaded through
dynamic `import()` (`app.js`'s `loadSim()`), the "bundle" is a real folder
— the shell HTML plus `sims/`, `citykit.js` and `gamify.js` copied
alongside it (`ls WebXR/smartcity/dist/sims/*.js` counts 516 files) — and
needs a real HTTP(S) server rather than a `file://` open, because browsers
block dynamic `import()` from a file origin.

A hosted, published copy of the app is a separate constraint again: a
hosting surface with a per-publish file-count cap cannot receive 516
individual station files in one pass. `docs/STATUS.md`'s Wave 100 entry
records the fix actually shipped: "the published copy now ships its
stations as 25 chunked modules so it fits the host's file cap" — grouping
the per-station files into 25 larger modules rather than publishing one
file per station. That regrouping is a publishing-time concern, not a
change to the source layout described above.

## 4. Content corpus

### 4.1 Procedures, categories, programmes

525 procedures exist today: 516 SmartCiti.X stations and 9 Trade Skills
Simulator rooms, spanning 19 catalog categories (`WebXR/smartcity/catalog.json`).
The categories are a growth taxonomy consolidated from the ad-hoc `domain`
values individual station modules once carried
(`WebXR/smartcity/README.md`): Building Systems & Facilities, Community
Environmental Justice, Connectivity & Telecom, Construction & Structural
Trades, Culinary & Hospitality, Dental & Oral Health, Emergency Services,
Energy & Power, Entertainment & Live Events, Environmental Monitoring,
Healthcare Support, Manufacturing & Automation, Maritime & Ports, Mobility &
Transit, Sewing & Garment Trades, Surface Prep & Coatings, Trade Skills
Simulator, Water & Environmental, and Youth Sports & Coaching. Two of
these — Healthcare Support and Youth Sports & Coaching — are recent
additions, per `docs/STATUS.md`'s note on the current wave.

Across the whole corpus (computed from `tools/eval-content.json`, produced
by `node tools/eval_content.mjs --json`): **7,029 total steps**, **2,118
total scored hazards** (a mean of about 4 per procedure), and — from
`node tools/check_interrupts.mjs` — **1,036 interruptions**. 520 of the 525
procedures carry a real 3D scene (the rest are flat, sourced briefings —
Section 4.5); the mean mesh count among those 520 is about 199.

### 4.2 How a station is authored and registered

`tools/add_station.mjs` registers a new SmartCiti.X station everywhere it
must be known in one pass. `tools/briefs/station-brief.md` is the authoring
brief the content teams work from (not read in full for this paper, but
referenced by nearly every wave entry in `docs/STATUS.md`). A station
module declares its own steps, hazards, interruptions, standards
citations, union and certification text, and (where applicable) an
`environment` block; `tools/gen_sims_meta.mjs` and `tools/gen_catalog.mjs`
then derive the lightweight metadata and the full machine-readable catalog
from the real modules, using the same headless harness
(`tools/lib/headless.mjs`) the checkers use — so neither can drift from the
actual station code.

### 4.3 Twenty-level ladders of 75-lesson levels

Every one of the 41 programmes is also a twenty-level ladder, generated by
`tools/gen_ladders.mjs` from `curricula.js` and the real station modules
(`docs/ladders.md`). A **lesson** is one station step run under one
**condition** (base, a time-of-day, a weather kind, hazard-assessed mode,
an armed interruption, or an assessment/pressure variant); a level's lesson
total is the sum of its tasks' step counts. As of `node
tools/check_ladders.mjs`: **820 levels total** (41 programmes × 20), **819
at or over the 75-lesson target**, **1 partial** (level 1 of Inside Wireman
— First Period, 58 lessons, 17 short — the content-gap table in
`docs/ladders.md` computes that zero additional 13-step stations would be
needed to close it, because the shortfall is concentrated in a level whose
own band the generator's rules constrain), and **164 milestone quotes**
(41 programmes × 4 milestone levels — 5, 10, 15, 20). Every milestone quote
is a verbatim prefix of that level's own first task's own first step's own
`why` text — never composed for the occasion — which `check_ladders.mjs`
verifies directly against the source.

### 4.4 The wave-100 packs

`docs/STATUS.md`'s "Wave 100" entry (2026-09-26) is the most recent
recorded batch: eleven of thirteen planned union packs landed in that pass
(railroad crafts, heavy equipment operators, plumbers and pipefitters,
elevator constructors, glaziers and architectural metal, insulators and
boilermakers, cement masons and plasterers, healthcare support, roofers
and waterproofers, the open-range outdoor district, and the Bay
underwater edition), alongside the course-tracking/accountability layer,
the episode recorder and dataset exporter, wallet/opt-in sharing, and six
field-note Easter eggs. Two more packs — water and gas utility crews, and
(per this worktree's own commit log) further additions — have since landed
on top of that wave, which is why this paper's live counts (525 procedures,
41 programmes) run ahead of the wave-100 entry's own snapshot (517
procedures, 40 programmes).

### 4.5 Flat, sourced briefings

Not every "procedure" is a walkable 3D scene. `docs/STATUS.md` and
`docs/compliance/README.md` both note that a small number of stations
render as a flat dossier — a page of sourced facts rather than a scene to
walk through — because the underlying subject (an active federal Superfund
site with a False Claims Act settlement, in the Hunters Point stations'
case) is not something the platform will render as a pleasant diorama.
Five procedures score below 90 on the content eval for exactly this
reason: `hunters-point` (73), `can-we-live-story` (73),
`civic-principles-briefing` (81), `trades-lineage-briefing` (84), and
`apprenticeship-standards-reading` (88) — `docs/STATUS.md` explains that
the eval's scene and variety dimensions do not meaningfully apply to a flat
briefing, and the rest of the score is renormalised over what does.

## 5. Evidence and evaluation

### 5.1 The checker suite as heartbeat

`tools/check_all.mjs` runs 45 checkers in a fixed order (parse and imports
first, because every other checker reads the same files after assuming
they parse) and prints "All 45 checkers pass." on success — confirmed for
this paper by `node tools/check_all.mjs 2>&1 | tail -1`. Appendix B lists
all 45 with a one-line description each, drawn from each checker's own
header comment. In outline, the suite covers: whether the code parses and
resolves its own imports; whether each app's content plays correctly
end-to-end in a headless browser; the records, identity, LRS, sharing,
episode, dataset, robot, platform, LTI, and credential-verification layers;
layout and mesh-budget audits; interruptions, random events, lessons,
hand-gesture and assessment-variant logic; incident replay and crew-role
splitting; device profiles and input; the standards registry, instructor
console, competency layer, and shipped 3D models; FlowHub, the homepage,
scenic districts, ladders, and training-track pages; union/safety signage,
the shared fleet; the two Easter-egg games (Night Highway Circuit, Break
Room Arcade) and the smaller in-app eggs; and the shared props and texture
libraries.

### 5.2 The content evaluation

`tools/eval_content.mjs` is explicitly not a gate — its own header states
"It deliberately does NOT fail a build" — because wiring a content-quality
score into the build would let authors write to the metric rather than to
the trade. It grades every procedure on eight dimensions, renormalised over
whichever apply to a given station:

| Dimension | Weight | What it measures |
|---|---|---|
| variety | 0.18 | distinct step kinds used and the longest run of one kind |
| decisions | 0.20 | hazards and interruptions per procedure |
| explanation | 0.18 | median length of a step's own `why` text, penalising thin explanations |
| grounding | 0.14 | number of named authorities a station's text cites |
| standards | 0.14 | the share of cited authorities that resolve to an in-scope registry entry, penalised for out-of-scope citations |
| feedback | 0.15 | coverage of authored feedback notes |
| scene | 0.10 | mesh and interactable count (not scored for a flat station) |
| originality | 0.05 | how much of a station's prose is shared with its nearest match in the corpus |

Run for this paper (`node tools/eval_content.mjs --json`): corpus mean
**96/100** over 525 procedures. The tool's own "weakest by dimension"
output names the current worst example per axis — for instance,
`soil-loadout` and `haul-road-dust` share 39% of their prose (the
closest-matching pair in the corpus on originality), and `rigging-loft`
resolves only 2 of 4 cited authorities in scope on the standards
dimension.

### 5.3 The standards registry and compliance matrix

`tools/standards.json` is, in its own words, "the one place a standard this
platform teaches against is written down" — body, title, the catalog
categories it governs, and whether the citation form is verified. Run for
this paper (`node tools/check_standards.mjs`): **431 entries across 113
bodies**, **294 citation forms verified** and **137 carried as body and
title only**, **every one of 525 stations cites a registered standard in
scope for its category**, and **41 programmes name 422 guides**, every one
resolving to a registry entry. `docs/compliance/compliance-matrix.md`
(generated by `node tools/gen_compliance.mjs`) is the reverse index: every
standard with the procedures that carry it — as rendered on 2026-09-27, it
reported 525 procedures and 239 distinct standards cited; both the
registry page and this matrix are generated snapshots, and the live
`check_standards.mjs` run is the number this paper treats as current.

Neither the registry nor the matrix is a claim of regulatory compliance.
`docs/compliance/compliance-matrix.md`'s own header states: "A citation
appears here only where a station's own text names it; the matrix is a map
of what is taught, not a certification of compliance." No station replaces
an employer's own hazard assessment, permit system, or the training a
standard itself requires be delivered by a qualified person
(`docs/compliance/README.md`).

## 6. Accountability and course tracking

### 6.1 Records

`WebXR/shared/records.js` is the attempt log every layer above it reads.
A run **passes** at two or more stars with zero unsafe actions. Records
export as a CSV, as xAPI statements to a configured Learning Record Store,
and (for a competency) as Open Badges 2.0 assertions; an LTI 1.3 launch
relay (`tools/lti_relay.mjs`) carries a learner's identity from an LMS.
Otherwise, progress lives in the learner's own browser only.

### 6.2 Proof of training: the mastery rule

`WebXR/shared/competency.js` defines **mastery**, stricter than a pass: two
or more stars, zero unsafe actions, every interruption answered, and a
finish inside 1.5× the station's par time. One mastery run on enough of a
competency's stations earns **demonstrated**; mastery runs on three
different days earn **consistent**. Today (`node
tools/check_competency.mjs`): **51 competencies** (41 programme-mirrored,
10 cross-programme) over **513 distinct stations** and **95 standards**.
The Proof tab of the Training Records overlay shows competency cards, a
full evidence transcript, and the scoring rubric read straight from
`game.js`'s own constants (never restated by hand). Exports: a CSV
transcript (RFC 4180), Open Badges 2.0 JSON assertions, and a printed
transcript built from DOM text nodes only — never `innerHTML` — so
learner-, note- and station-supplied text can never execute as markup.

### 6.3 My Training, refreshers, transcripts and sign-off

`WebXR/shared/tracking.js` sits above the mastery rule and answers a
blunter, day-to-day question: is a member training regularly, and is
anything of theirs going stale. The **My Training** card shows, per
programme: levels and lessons completed, measured time on task, the last
station played and the next open level, badges earned, and standards
evidenced. **Refreshers due** flags a station whose last clean run is older
than a refresher interval that defaults to 90 days — always labelled a
**platform default**, never a union rule, unless a programme declares its
own. The **transcript** is headed, in its own text, "This is a record of
simulator activity on this platform, not a certification"; `check_records.mjs`
asserts the word "certified" never appears anywhere in it and that every
occurrence of "certification" sits inside a negation. **Instructor
sign-off**, entered from the instructor console, is shown everywhere as
"instructor attestation" and carries no pass/fail verdict of its own.
Accountability gamification — streak XP, on-time-refresher XP, clean-run
badge tiers, a hazard-free-week badge, and a lessons-completed leaderboard
— is computed as a pure function over the same record, never a separate
mutable ledger.

### 6.4 What none of this is

Both `docs/proof-of-training.md` and `docs/course-tracking.md` close on the
identical point, restated here because it governs every export the
platform produces: a demonstrated competency, a passed level, a streak, a
badge, and an instructor's attestation are all evidence that training
happened — never a licence, and never a certification issued by OSHA,
NFPA, ANSI, a state board, or a union. Those bodies certify people; a
simulator does not.

## 7. Gamification and Easter eggs

The platform's competitive and playful layers are kept structurally
separate from the training record. `docs/easter-egg.md`'s own opening line
states the rule for all of them: "none of them touches a station's steps
or its scoring."

### 7.1 Ladders and capstone liveries

Passing a programme's level-20 capstone — the hardest run of its ladder,
under the mastery rule, with no coaching — unlocks a named, coloured
livery for player 1's car in the hidden racer (Section 7.2). The unlock
rule is a lighter bar than the ladder's own "level passed" rule (any
passing attempt at level 20, rather than every task at mastery in one run),
and `docs/easter-egg.md` says so explicitly rather than overclaiming it.
`tools/gen_capstone_liveries.mjs` generates the livery list from the
ladders themselves, so a programme can never be missing one.

### 7.2 Night Highway Circuit and Battle Arena

A hidden arcade racer: the platform's own procedural vehicles, shrunk to
kart size, across ten original courses (an elevated night freeway, a
container terminal, a fog-bound suspension bridge, a quarry haul road, and
six more) plus an item-based Battle Arena. Every course, vehicle livery,
item, sound and glyph is original to this platform — `docs/easter-egg.md`
states plainly that no other game's names, characters, items, logos,
music or course geometry are used or imitated, and that no real highway,
port, bridge, quarry, or wetland is depicted. It is signalling and
mirror-checking that earns the "safety bonus" scored in the results table
— the joke that still teaches. Multiplayer is local-only: split-screen on
one machine, or two browser tabs linked by `BroadcastChannel`; there is no
server and no online play. `node tools/check_race.mjs` gates course
geometry, item logic, and both unlock rules.

### 7.3 Break Room Arcade

A second hidden page: four original 2D canvas games in the spirit of
generic arcade genres (a climbing platformer, a side-scrolling runner, a
falling-block stacker, a lane-crossing dodger), each ending on a
"what this teaches" line — tying off before a climb, keeping PPE on, a
square stack, right-of-way at a marked aisle crossing. `node
tools/check_arcade.mjs` gates each cabinet's engine and its high-score
table.

### 7.4 Field notes and the egg ledger

Six smaller, in-app eggs (Photo Mode, the Golden Wrench, Crane Claw, the
Holodeck arcade cabinet, Toolbox Talk Bingo, Night Shift) each keep their
own small `localStorage` key, separate from the training record. A further
six **field notes** — Clean Sweep, Radio Check, No Reset Needed, Hot
Streak, First Pass, Cross-Trained — read the real training record and the
live interruption log, but only read: `docs/easter-egg.md` states none of
them ever writes to a record, changes a step, or touches a score. Every
field note found is logged to an **egg ledger**, grouped by the programme
that earned it — explicitly not a training record itself.

### 7.5 Foreman's Radio and Hard Hat Hunt

Foreman's Radio is a ten-question quiz generated entirely from
`tools/standards.json` — no invented fact, no question built on anything
but a standard's own title or its own CFR-style clause. Hard Hat Hunt
hides a small collectible in fourteen stations across programmes,
outdoors and underwater included; finding all fourteen unlocks a "Hard Hat
Gold" livery. `node tools/check_eggs.mjs` gates both, including the
constraint that a hidden collectible sits inside the same reachable,
visible volume `check_layout.mjs` already audits for a station's real
controls.

### 7.6 The rule every egg follows

Across all four kinds — the racer, the arcade, the field notes, and the
smaller in-app eggs — `docs/easter-egg.md` repeats one constraint: an egg
never touches a station's steps, its scoring, or the auditable record in
`shared/records.js`, and every one of them says plainly, wherever it shows
a learner anything, what it is and is not.

## 8. Environments and realism

### 8.1 Weather and random events

`WebXR/shared/weather.js` declares 8 weather kinds — clear, overcast,
rain, fog, wind, storm, smoke, heat-haze — each carrying an operational
note tied to the work, not only a visual effect ("the deck is slick and
the runoff is the sample" rather than only rain particles).
`WebXR/shared/events.js` layers a separate, unscored ambient scheduler on
top: 6 kinds (weather-shift, vehicle-pass, crew-walkthrough, radio-call,
dropped-tool, mast-light) that make a run feel less like a fixed diorama
without ever becoming a step or a hazard, on every SmartCiti.X station for
free, with no station file touched to add it.

### 8.2 First- and third-person, characters, and driving

Every simulator carries both first- and third-person views
(`docs/STATUS.md`, wave 0). Crew figures are built from `WebXR/shared/kit.js`'s
`standingFigure` with 8 named trade outfits — construction, clinical,
marine, kitchen, office, sport, firefighter, diver — each resolving
helmet, vest, glove, mask and boot colours to the trade rather than a
generic default. `WebXR/shared/crew.js` supports splitting a two-person job
(a confined-space attendant and entrant, a crane operator and signaller, a
welder and fire watch) into a role view, where the learner's own steps play
exactly as authored and the other person's steps become watch steps the
learner must confirm rather than perform. Six deep-driving stations use the
`drive` step kind (`docs/STATUS.md`, wave 0) for a scripted vehicle task
scored the same way any other step is.

### 8.3 Underwater and open-range

Two of the four scenic districts extend the platform past a walkable
plaza: `bay-underwater` (25 of a 120-mesh budget) hosts the SF Bay
Restoration & Cleanup programme's dive stations, and `open-range` (89 of
120) hosts four stations that sit inside existing programmes rather than
one of their own — transmission-line right-of-way patrol and solar-farm
tracker maintenance (Energy Transition Systems), wildland fireline
construction (First Responders), and ranch-road grading (Builders). Both
districts satisfy the same reachability rule every other control on the
platform is held to (`tools/check_layout.mjs`), which is what lets a
hidden collectible (Section 7.5) be planted honestly in either one.

## 9. Robot and model training data

### 9.1 Embodiment: pose, grasp, force, keep-out

`WebXR/shared/robot.js` is the **policy** layer: a skill-parameterised
agent (a single number in [0, 1]) that observes, acts, and runs a full
episode against the real procedure engine. `WebXR/shared/robot-embodiment.js`
is the **body**: it derives a target pose for every interactable by
walking the scene's own parent chain (`worldPlacement()`), assigns a grasp
from the step's kind (`touch`, `sustained-contact`, `wrist-rotation`,
`pick-and-place`, `continuous-adjustment`), a force ceiling (`none`,
`light`, `firm`) from either a station's own declaration or the kind's
default, and builds keep-out spheres around every person in the room from
four sources (a built patient figure, an empty patient chair, an
interactable whose id names part of a person, or a crew figure at another
bench). Entering a keep-out volume without a declared `forceClass` is a
violation, and a run with any violation is not a pass whatever it scored.

### 9.2 The dental rule set

The eighteen stations of Dental Hygiene — Unspoken Smiles carry the
platform's most developed embodiment annotation. **51 steps across the
block are marked `noRobot`** — the target is a person: anything inside the
mouth or on the airway, any palpation of tissue, anything that carries a
patient's life, and the purely relational acts (comfort, reassurance,
staying with a sedated patient). Every `noRobot` step carries a `robotNote`
explaining why, and the build fails if one does not
(`docs/robot-training.md`). A `noRobot` step is not skipped in an embodied
episode — it is handed to the clinician, recorded with `operator: "human"`,
no pose, no force, no credit — except a live interruption during that
step, which is exactly the reach-across-the-room task the robot is there
for.

### 9.3 The episode recorder and dataset exporter

`WebXR/shared/episodes.js` attaches to a live SmartCiti.X session and
records each decision (observation, action, reward, outcome) plus a
~4 Hz pose track, capped at 1.5 MB / 400 episodes per browser with
oldest-first eviction, and hashes any crew tag before it ever reaches
storage — no name and no free text are ever recorded.
`tools/export_dataset.mjs` turns deterministic headless rollouts (through
`robot.js`/`robot-embodiment.js`) plus any exported human episodes into
JSON-Lines shards, a manifest, and a dataset card. Synthetic data is
licensed CC0-1.0 in the card itself; human-exported data carries no
licence claim from this repository — the exporting learner's or hall's
permission is the distributor's own responsibility to secure.

### 9.4 Quality report and baseline trainer — the documented real run

`tools/eval_dataset.mjs` reads a dataset folder back and computes a single
0–100 quality score from seven weighted sub-scores. The real run
documented in `docs/robot-datasets.md` (the default two-app sample: 40
SmartCiti.X stations + all 9 Trade Skills rooms, 3 skills, 2 seeds — 294
episodes, 32,895 steps, 49 stations) scored **91/100**:

| Sub-score | Value | Weight | Contribution |
|---|---|---|---|
| schemaValidity | 100% | 30 | 30.0 |
| actionBalance | 70% | 15 | 10.5 |
| hazardCoverage | 100% | 10 | 10.0 |
| interruptionCoverage | 100% | 10 | 10.0 |
| duplicateRate | 100% | 15 | 15.0 |
| stationDiversity | 100% | 10 | 10.0 |
| poseTrackPresence | 52% | 10 | 5.2 |

`docs/robot-datasets.md` explains the one sub-score not near-perfect:
`poseTrackPresence` counts a `release` action (10,378 of 32,895 decisions
in this sample) or a `drive` observation (4,909) as having no pose to
report by construction, so the rate over *all* embodied steps is expected
to land well under 100% even on a clean export.

`tools/train_baseline.mjs` is a plain-JavaScript, dependency-free
behaviour-cloning baseline: a multinomial logistic-regression policy over
nine action classes, trained on the dataset above with a station-level
80/20 split (39 training stations, 10 held out), documented at:

| Held-out metric | Value |
|---|---|
| Top-1 action accuracy | 98.9% |
| Top-3 action accuracy | 100% |

Replayed through the real procedure engine on the 10 held-out stations,
five episodes per policy:

| Policy | Pass rate | Mean score |
|---|---|---|
| learned | 10% | 1,170 |
| expert (skill 1) | 80% | 3,182 |
| novice (skill 0) | 0% | 1,704 |

The documented lesson, stated in the tool's own `MODEL_CARD.md` and
repeated in `docs/robot-datasets.md`: 98.9% top-1 accuracy on isolated
decisions did not carry into a comparable pass rate once the policy ran a
whole station — a compounding-error effect typical of behaviour cloning,
visible only because the tool replays the policy through the real engine
rather than stopping at the classification metric. `MODEL_CARD.md` itself
states plainly that this is a research baseline, not a certification of
anything.

## 10. Wallets, opt-in sharing and agent protocols

### 10.1 The plain statement

`docs/wallets-and-sharing.md` opens with its own governing sentence:
"sharing is off by default, and nothing about a session leaves the browser
until a person explicitly presses Share." There is no background upload
and no default "share anonymously" setting.

### 10.2 The wallet and consent

`WebXR/shared/wallet.js` connects to whatever wallet extension is already
in the learner's browser via EIP-6963 (falling back to the legacy
`window.ethereum` where that is all a browser offers), and signs a
plain-text consent statement with `personal_sign` (EIP-191) — the exact
text the wallet displays is reproduced byte-for-byte in
`integrations/cloudflare/worker.js` so a relay checks a signature against
the same words a person actually read. The module never asks for,
receives, or has any code path that could receive a private key or a seed
phrase; opting in without a wallet at all still works, as a plain,
unsigned local record.

The consent record states, in stated (not implied) fields: what is shared
(`episodeDigests`, `rollupScores`) and what never is (`name`, `crewTag`,
`freeText`, `rawIdentity`).

### 10.3 What is shared, and what never is

Once opted in and once Share is pressed: anonymised episode digests
(station, category, stars, score, unsafe-action count, corrections, time
against par, pass/fail), the per-category roll-up already kept for the
Training Records overlay, and the consent record itself. Never shared,
under any circumstance: a learner's name or self-typed crew tag, any free
text, or any launch identity from `shared/identity.js`.
`recordDigest()` in `share-engagement.js` — the one function that decides
what leaves the browser — has no field for any of the excluded categories,
and `tools/check_share.mjs` asserts this directly against the function's
own output.

### 10.4 The bundle, the relay, and revocation

Pressing Share builds one bundle — the digests, the roll-up, the licence
choice, and a `SHA-256` content hash over the payload's canonical JSON —
and hands it to one configured adapter. A **receipt** (when, which
provider, success or the reason for failure) is kept in the browser;
nothing else about a share persists. **Revoke** deletes the local consent
record; it cannot un-send a bundle already received, and the interface
says so next to the button.

### 10.5 Provider-agnostic adapters, deliberately unfilled

`WebXR/shared/agent-protocols.js` ships four adapters — `virtuals`,
`singularitynet`, `generic-attestation`, `cloudflare-relay` — every one
with every field (endpoint, chain id, contract address, schema id, token,
fee) starting `null`. The module's own governing statement:
"`offer()` and `deliver()` refuse outright, before touching the network,"
with the message `"configure per the provider's current documentation"`,
until every field a deployment needs is filled in from that platform's own
current documentation — never invented or defaulted by this repository.
This paper restates no version of any named platform's actual API, for the
same reason the module's own file gives: this repository has no way to
keep such a restatement current, and a wrong one would be worse than none.

### 10.6 The one relay this repository ships and tests

`integrations/cloudflare/` is a Cloudflare Worker template for the
`cloudflare-relay` adapter — the only adapter above with a working,
tested implementation in this repository. It rejects anything without a
`optIn: true` consent, recovers a wallet-signed consent's address with a
plain-JS Keccak-256/secp256k1 implementation (no WebCrypto algorithm
covers that curve) and rejects a mismatch, recomputes the bundle's content
hash via `crypto.subtle` and rejects a mismatch, and writes a small
receipt to a configured KV or R2 binding — every account-specific value in
`wrangler.toml` ships as an explicit `PLACEHOLDER-…`. It is explicitly not
a wallet, not a payment processor, and not an integration with any named
agent-protocol platform — the README's own "What this is not" section
states each of those three points directly. `node tools/check_share.mjs`
exercises `handleRequest()` directly, with no Cloudflare runtime and no
network call, against consent, tampered-signature, and tampered-hash
cases.

## 11. Enterprise integration

### 11.1 Identity and platform channel

`WebXR/shared/identity.js` accepts a launch context two ways — a launch
URL (`?learner=&learner_id=&learner_home=`, scrubbed from the address bar
once read) or a trusted `postMessage` from an embedding page — and states
plainly that this is provenance, not authentication: nothing here is
cryptographically verified, because there is no server behind a static
page to verify it. `WebXR/shared/platform.js` builds a small command
channel on top: a hosting LMS, portal, or metaverse frame can open a
station, return to the hub, ask for state, or read the roster, and the app
emits its state, its catalog, and every finished record back — only ever
to the origin the identity layer already trusts.

### 11.2 LTI 1.3

`tools/lti_relay.mjs` is, in its own words, "the one server this network
needs, and the smallest one that does the job." A static page cannot
verify a signed LTI launch; the relay does — verifying the platform's
signature, issuer, audience, expiry, and single-use nonce — then redirects
the browser into the app carrying the same `learner`/`learner_id`/
`learner_home` launch context the identity layer already understands. It
also serves an empty `/.well-known/jwks.json`, because the relay only ever
verifies a platform's signature and never signs anything of its own.

### 11.3 Instructor console

`WebXR/instructor/index.html` owns no simulation, no scoring, and no
records of its own — it speaks only the observer protocol
(`WebXR/shared/observer.js`) and reads the static catalog. Its three
views (Live class, Roster, Session log) let an instructor watch a class,
search the whole roster, and read a full command/event log; its per-control
table (roll call, a note, hold/release, open a station or programme, fire
a specific interruption now, set weather or device profile, toggle
coach/assess hazard mode, assign a programme, load a flow) names, for each
control, exactly what a learner sees and exactly what gets written to
their attempt record. It runs across a room over `BroadcastChannel` or
across a network over `tools/relay_server.mjs`, which the documentation
states plainly is not authentication, encryption, or an audit trail.

### 11.4 Static deployment

Every app in `WebXR/` is a static file (or, for SmartCiti.X, a static
folder) with one pinned external dependency — three.js 0.160.0 from
`cdnjs.cloudflare.com` — and deploys to any HTTPS static host. `WebXR/README.md`
documents the one server-dependent piece of the network in detail (the LTI
relay) and is explicit that a hosting domain named in passing
("rb1.com") was never confirmed reachable from the authoring environment,
so nothing in the deployment guide is specific to it.

## 12. Roadmap

**Fairway Park.** The next planned open-world addition, as described to
the team preparing this paper, is a nine-hole course and sports facility
with live scoring, standing as the training ground for grounds-crew and
landscaping trades — a natural extension of the pattern the platform
already uses for Basketball Fundamentals (an 18-station programme built on
the existing `gym-court` scenic district, taught against a governing
body's own published guidelines rather than a union apprenticeship). As of
this repository's current state, **no code, no station modules, no
generated assets, and no counts for Fairway Park exist anywhere in this
tree** — a repository-wide search for the name returns nothing. This
section states the direction and nothing more: no station count, no asset
count, and no completion date is asserted, because none of those numbers
exists yet to read or compute. The eleven-track content-gap methodology in
`docs/ladders.md` (Section 4.3) and the district-budget pattern in Section
8.3 are the tools already in the repository that a Fairway Park build
would extend, rather than replace.

Two smaller, already-visible gaps close out the near-term list: the
open item from Wave 100 (`docs/STATUS.md`) names two packs still in
flight at that entry's own time of writing (warehouse automation and
aviation ground), and the one partial ladder level (Section 4.3) is a
known, quantified content gap rather than a defect.

## The game

The open-world direction this paper's roadmap named has landed and is
described in its own companion paper, [`GAME-WHITEPAPER.md`](GAME-WHITEPAPER.md),
with every figure sourced in `docs/game-whitepaper-facts.json`. The short
version: the platform's stations now sit inside a free-roam training game.
**Bay World** (`WebXR/bayworld/`, `WebXR/shared/bayworld-data.js`) is a
stylised 2400 × 1600 m shoreline city of 16 zones, 28 generic public
landmarks, 50 training sites and 15 roads; every programme is anchored at a
site, and every job board deep-links into a real station whose returned
record — not the game — awards reputation and credits
(`WebXR/bayworld/js/career.js`). **Fairway Park** (`WebXR/fairway/`,
`WebXR/shared/fairway-data.js`) is a nine-hole, par-36 course and sports
facility with three mini-games and a twelve-station grounds-and-landscaping
programme working on it. The **Deep** (`WebXR/shared/underwater-data.js`,
`WebXR/underwater/`) is a 2000 × 1400 m seabed of 14 zones, 32 dive sites and
17 dive lines, with a 60-dive game whose HUD shows a reserve word and never a
depth number. The **Regatta** (`WebXR/regatta/`) races twelve yachts over
three courses and five hosted events paying into the same ledger, under a
shared procedural sky with generic wildlife (`shared/sky.js`, `wildlife.js`).
A generated quest layer (`tools/gen_bay_quests.mjs`) adds a seven-quest main
arc over the Job Readiness Edition, an opener and a capstone side quest per
programme, field-note eggs quoting a real station's step verbatim, and six
scored activities — no violence and no gambling anywhere. The **Bay Atlas**
(`docs/mapbox.md`) lists every site and landmark and draws a real-world map
only with a viewer's own token; the repository ships none. The game's rule is
the platform's: nothing in it touches a station's steps, its score or the
auditable record, and `competency.js`'s mastery rule is the only thing that
earns a competency. Where these counts differ from the tables above, the game
paper is current.

## 13. Governance, licensing and safety posture

### 13.1 No invented facts

Three separate parts of this codebase independently enforce the same
discipline this paper was also asked to follow: `tools/standards.json`
marks a citation "unverified" rather than inventing a clause number
(Section 5.3); `docs/agent-protocols.md` and `docs/wallets-and-sharing.md`
ship every configurable field `null` rather than a plausible-looking
default (Section 10.5); and `docs/ladders.md`'s milestone quotes are
verbatim prefixes of a station's own source text, never composed for the
occasion (Section 4.3).

### 13.2 Trademark wordmarks

`docs/signage.md` states the platform's trademark policy directly: **no
union logo is reproduced anywhere in this repository.** A station's union
sign shows a wordmark — the union's abbreviation, its full name, a local
only where the repository is certain of exactly one, and a training-fund
line drawn from the standards registry — typeset at runtime from
`tools/unions.json`, in the platform's own palette. A licensed deployment
that holds a union's written permission can supply its own logo file
through `WebXR/assets/brand/manifest.json`; the repository itself ships
that manifest with every `file` field `null`, and `tools/check_signage.mjs`
fails the build if that ever changes without a real, licensed asset behind
it.

### 13.3 Asset licences

Only CC0, CC-BY (with an attribution line), or marketplace-licensed models
that permit redistribution in a compiled application may go under
`WebXR/assets/env/`; `WebXR/assets/env/ATTRIBUTION.md` lists every one that
ships today with its title, author, source, and licence, and
`tools/check_models.mjs` fails the build for any `.glb` missing from that
table, over its 2 MB ceiling, or unreferenced by any module. Ripped game
assets, and any model of unknown provenance, are refused outright per the
directory's own README. The Unity prototype separately documents its
Microsoft Rocketbox avatar attribution (`README.md`, repository root) and
its Poly Haven CC0 asset attribution under `Assets/ThirdParty/PolyHaven/`.

### 13.4 Privacy

Training records, badges, and progress live in the learner's own browser
unless a hall connects a Learning Record Store or an embedding LMS
supplies a launch identity (Section 11.1). The episode recorder hashes any
crew tag before storage and never records a name or free text (Section
9.3). The opt-in sharing flow defaults to off, states exactly what is and
is not shared, and is revocable, though revocation cannot recall a bundle
already delivered (Section 10). Any procedure that touches a person's
sample or data teaches informed consent (45 CFR 46) as a scored step and
scores collecting without it as an unsafe action
(`docs/compliance/README.md`).

## 14. Appendices

### Appendix A — the 41 training programmes

id · name · stations · union(s), from `WebXR/smartcity/js/curricula.js`:

| id | Name | Stations | Union(s) |
|---|---|---|---|
| `electrical-first-period` | Inside Wireman — First Period | 8 | IBEW |
| `confined-space` | Confined Space — Entry and Rescue | 8 | LIUNA, UA, IUOE and IAFF technical rescue |
| `fall-protection` | Working at Height — Fall Protection | 7 | Ironworkers, Carpenters, CWA and NATE climbers |
| `hazmat-environmental` | Hazmat and Environmental Response | 10 | LIUNA hazmat/environmental crews, IAFF, environmental technicians |
| `rigging-lifting` | Rigging and Lifting | 6 | Ironworkers, IUOE crane operators, ILWU and IATSE riggers |
| `stationary-engineer` | Stationary Engineer — Building Plant | 7 | IUOE stationary locals |
| `port-operations` | Port and Terminal Operations | 7 | ILWU, MEBA, SIU, IBT |
| `transit-ramp` | Transit and Ramp Operations | 7 | ATU, TWU, IAM, IBEW signal locals |
| `energy-transition` | Energy Transition Systems | 9 | IBEW outside construction and utility locals |
| `live-events` | Live Events Production | 7 | IATSE |
| `hunters-point-bay-restoration` | Hunters Point Clean-up and Bay Restoration | 26 | LIUNA 261, IUOE 3, Teamsters, Pile Drivers 34 (Carpenters), UA 38, Inlandboatmen's Union |
| `culinary-kitchen` | Culinary — The Working Kitchen | 16 | UNITE HERE Local 2, AFSCME/SEIU food service |
| `dental-hygiene-unspoken-smiles` | Dental Hygiene — Unspoken Smiles | 19 | SEIU/UFCW, AFSCME, ADHA |
| `dental-careers-unspoken-smiles` | Dental Careers — Unspoken Smiles | 19 | SEIU/UFCW, AFSCME, ADHA, ADAA, DANB |
| `civic-leadership-and-ei` | Civic Leadership and Emotional Intelligence | 17 | SEIU, AFSCME, apprenticeship coordinators, community organisations |
| `property-management` | Property Management — Twenty Zones | 21 | SEIU 87/USWW, IUOE 39, UNITE HERE, apartment-association credentials |
| `outbreak-response-who` | Outbreak and Disease Response — WHO and UN Practice | 11 | SEIU, AFSCME, NNU, CNA, UN cluster workforce |
| `job-readiness-edition` | Job Readiness Edition — wojrc.org programmes | 32 | Teamsters, ILWU, building trades, SEIU/AFSCME |
| `bay-area-union-edition` | Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine | 42 | SMART, Ironworkers, IUPAT, Pile Drivers, ILWU, PMA, IUOE, Inlandboatmen's Union, MEBA, SIU |
| `bartending-course` | Bartending — Behind the Bar | 16 | UNITE HERE Local 2 |
| `hunters-point-can-we-live` | Hunters Point Edition — Can We Live? | 26 | Community science partners; LIUNA, IUOE, Teamsters, radiation technicians |
| `sewing-garment-trades` | Sewing and Garment Trades | 11 | Workers United (SEIU), UNITE HERE |
| `bridge-and-structural` | Bridge and Structural Trades | 7 | Ironworkers (IW), IUPAT, IUOE, LIUNA |
| `hotel-workers` | Hotel Workers — Back of House | 7 | UNITE HERE |
| `builders-trades` | Builders — Carpenters, Laborers and Masons | 8 | UBC, LIUNA, BAC, IUOE |
| `first-responders` | First Responders — Fire, EMS, Police, Crisis and Relief | 17 | IAFF, NAGE/AFSCME EMS, police associations/FOP, NASW, SEIU 1021, AFSCME/LIUNA, Red Cross volunteers |
| `situational-awareness` | Situational Awareness — Interruption Drill | 22 | Cross-craft: IBEW, UA, LIUNA, Ironworkers, IAFF |
| `ports-maritime-ecology` | Ports, Maritime and Bay Ecology | 11 | ILWU, Inlandboatmen's Union, IBEW port electricians, LIUNA, environmental technicians |
| `air-quality-monitoring` | Air Quality — Monitoring and Control | 6 | AFSCME, LIUNA, IUOE, USW |
| `basketball-fundamentals` | Basketball Fundamentals | 18 | AFSCME/SEIU parks-and-recreation; taught against USA Basketball guidelines |
| `bay-restoration-maritime-underwater` | SF Bay Restoration & Cleanup — Maritime and Underwater | 35 | ILWU, Inlandboatmen's Union, MEBA, SIU, Pile Drivers 34, IUOE 3, LIUNA 261, AFSCME, SEIU |
| `railroad-crafts` | Railroad Crafts — Track, Car and Cab | 8 | BLET, SMART-TD, BMWED |
| `heavy-equipment-operators` | Heavy Equipment Operators — IUOE Local 3 | 8 | IUOE Local 3 |
| `plumbers-and-pipefitters` | Plumbers and Pipefitters — Journeyman Rough-In and Test Block | 8 | UA Local 38 |
| `glaziers-and-architectural-metal` | Glaziers and Architectural Metal | 8 | IUPAT DC 16 |
| `elevator-constructors` | Elevator Constructor — IUEC Core Skills | 8 | IUEC / NEIEP |
| `insulators-and-boilermakers` | Insulators and Boilermakers — Building Systems | 8 | Insulators Local 16, Boilermakers Local 549 |
| `cement-masons-and-plasterers` | Cement Masons and Plasterers | 8 | OPCMIA |
| `healthcare-support` | Healthcare Support | 8 | SEIU-UHW, NUHW |
| `roofers-and-waterproofers` | Roofers and Waterproofers | 8 | Roofers Local 40 (URW) |
| `water-and-gas-utility-crews` | Water and Gas Utility Crews — Distribution Authority | 8 | UWUA, IBEW gas locals |

Source: `node -e` against `WebXR/smartcity/js/curricula.js`'s `CURRICULA`
export, this session, 2026-09-27.

### Appendix B — the 45 checkers

One line each, from every checker's own header comment
(`tools/check_all.mjs`'s `CHECKERS` array, in run order):

| Checker | What it checks |
|---|---|
| `check_parse.mjs` | Every shipped module parses as real JavaScript |
| `check_imports.mjs` | No helper is called in one module and defined only in another |
| `check_smartcity.mjs` | Headless content check: builds and plays every SmartCiti.X station |
| `check_trades.mjs` | Headless content check: builds and plays every Trade Skills room |
| `check_holodeck.mjs` | Headless checks for the Holodeck prompt-to-course generator |
| `check_records.mjs` | The pass rule, append/cap behaviour, per-category summary, CSV/xAPI export shapes |
| `check_identity.mjs` | URL parsing/scrubbing, origin-bound postMessage, emit() never broadcasts |
| `check_lrs.mjs` | LRS endpoint/credential cleaning, queue rules, batched xAPI POSTs, retry |
| `check_share.mjs` | Wallet, opt-in sharing, agent-protocol adapters, and the Cloudflare relay |
| `check_episodes.mjs` | The episode recorder and dataset exporter round-trip a decision correctly |
| `check_dataset_tools.mjs` | The dataset-quality reporter and baseline trainer on a tiny generated dataset |
| `check_robot.mjs` | The robot-trainee layer: reproducibility, expert/novice pass rates, trajectories |
| `check_platform.mjs` | The embedding platform channel: ready signal, origin-scoped commands and replies |
| `check_lti.mjs` | The LTI 1.3 launch relay accepts a good launch and rejects a bad one |
| `check_orbis_stable.mjs` | Self-test for the Orbis-Stable client stub |
| `check_verify.mjs` | The credential verifier and the headset-pass performance instrument |
| `check_observer.mjs` | Learner broadcaster and instructor console speak the same protocol |
| `check_budget.mjs` | The per-station mesh budget is enforced against the catalog |
| `check_layout.mjs` | Every control a procedure asks for is reachable; nothing is placed impossibly |
| `check_interrupts.mjs` | Interruptions fire, time out, score, and visibly change the scene |
| `check_events.mjs` | The seeded ambient-event scheduler and its interrupt-timing jitter |
| `check_lessons.mjs` | The lesson composer against the real station roster |
| `check_hands.mjs` | The hand-gesture classifier against synthetic joint positions |
| `check_variants.mjs` | Assessment variants hold to their one governing rule |
| `check_incidents.mjs` | Incident replay holds to its two governing rules |
| `check_crew.mjs` | The crew-role split holds to its two governing rules |
| `check_devices.mjs` | Every device profile resolves, carries required fields, is not shadowed |
| `check_input.mjs` | Keyboard presets, gamepad poller and voice grammar |
| `check_standards.mjs` | The standards registry: fields, forms, in-scope citation coverage |
| `check_console.mjs` | The instructor console's own gate |
| `check_competency.mjs` | The competency and proof-of-training layer |
| `check_models.mjs` | Every shipped binary model: size, attribution, licence, and reference |
| `check_flowhub.mjs` | FlowHub's own gate (the cross-app flow channel) |
| `check_home.mjs` | The homepage and the sign-in module |
| `check_districts.mjs` | The four scenic stage districts build, fit, and are reachable |
| `check_ladders.mjs` | The twenty-level ladders: structure, lesson totals, milestones, badges |
| `check_tracks.mjs` | The generated training-track page per programme |
| `check_signage.mjs` | Union and safety signage: the trademark and wordmark rules |
| `check_fleet.mjs` | The shared fleet, equipment and tool kits |
| `check_race.mjs` | The Night Highway Circuit Easter egg |
| `check_arcade.mjs` | The Break Room Arcade Easter egg |
| `check_eggs.mjs` | Hard Hat Hunt, Foreman's Radio, Capstone skins |
| `check_eggs_app.mjs` | The smaller in-app Easter eggs |
| `check_props.mjs` | The shared site-dressing prop kit |
| `check_textures.mjs` | The shared procedural texture library |

Source: header comment of each file under `tools/`, read for this paper,
2026-09-27; count and order confirmed by `node tools/check_all.mjs 2>&1 |
tail -1` ("All 45 checkers pass.").

### Appendix C — generator and tool table

Every `gen_*` script writes one generated artifact from source data and is
never hand-edited afterward; other tools listed are one-off analyses,
runtime servers, or the content-eval/dataset pipeline.

| Tool | What it generates or does |
|---|---|
| `gen_catalog.mjs` | `WebXR/smartcity/catalog.json` — the full machine-readable roster |
| `gen_sims_meta.mjs` | `WebXR/smartcity/js/sims-meta.js` — lightweight per-sim metadata |
| `gen_ladders.mjs` | The twenty-level ladder for every programme |
| `gen_ladder_milestones.mjs` | `WebXR/shared/ladder-milestones-data.js` — verbatim milestone quotes |
| `gen_tracks.mjs` | One training-track page per programme |
| `gen_home.mjs` | The homepage, from the catalog |
| `gen_wiki.mjs` | `docs/wiki/SmartCitiX-Training-Series.md` |
| `gen_compliance.mjs` | `docs/compliance/compliance-matrix.md` |
| `gen_unions.mjs` | `WebXR/shared/unions.js`, from `tools/unions.json` and the registry |
| `gen_capstone_liveries.mjs` | `WebXR/race/js/capstone-liveries.js`, from the ladders |
| `gen_radio_quiz.mjs` | `WebXR/shared/radio-quiz-data.js`, from the standards registry |
| `gen_bingo_hazards.mjs` | `WebXR/shared/bingo-hazards-data.js`, from each station's real hazards |
| `gen_competency_programmes.mjs` | The programme tier of `competency.js`, mirrored on `curricula.js` |
| `gen_review_packet.mjs` | `WebXR/smartcity/REVIEW.md`, the practitioner review packet |
| `gen_sample_env.py` | A hand-built CC0 placeholder `.glb` environment |
| `add_station.mjs` | Registers a new SmartCiti.X station everywhere it must be known |
| `bundle_webxr.py` | Inlines an app's ES modules into a distributable file |
| `export_dataset.mjs` | Headless rollouts + human episodes → dataset shards, manifest, card |
| `eval_dataset.mjs` | Reads a dataset folder back and computes the quality score |
| `train_baseline.mjs` | The behaviour-cloning baseline trainer |
| `robot_train.mjs` | Runs embodied robot episodes at chosen skill levels |
| `eval_content.mjs` | The eight-dimension content quality evaluation (Section 5.2) |
| `apron_cost.mjs` | Prints the mesh cost of the site apron, for the headset-budget claim |
| `crew_spots.mjs` | Prints the clearest standing spots for crew figures, per room |
| `near_spawn.mjs` | Prints a candidate learner spawn point, per room |
| `interrupt_react.mjs` | Proves an interruption's reaction changes the scene, not just the banner |
| `lti_relay.mjs` | The LTI 1.3 launch relay server |
| `relay_server.mjs` | The instructor-console network relay (fan-out only) |

Source: header comment of each file under `tools/`, read for this paper,
2026-09-27.

### Appendix D — glossary

| Term | Meaning in this repository |
|---|---|
| **Station / procedure** | One authored, scored simulation of a real union job task |
| **Programme** | An ordered set of stations a training hall buys as one unit; also a twenty-level ladder |
| **Level / lesson / task** | A level is a chain of tasks; a task is one station under one condition; a lesson is one step of a task |
| **Condition** | A query-parameter-driven variation on a station: time of day, weather, hazard mode, an armed interruption, or an assessment variant |
| **Mastery** | Two or more stars, zero unsafe actions, every interruption answered, inside 1.5× par — stricter than a pass |
| **Competency** | A named, standards-evidenced capability demonstrated by mastery runs on a defined set of stations |
| **Standards registry** | `tools/standards.json` — the one place a standard, code, or union programme this platform teaches against is written down |
| **Guide** | A programme's own list of registry ids naming the standards its apprenticeship or training fund runs against |
| **Embodiment** | The layer that turns a station's real 3D scene into a pose, grasp, force ceiling and keep-out account for a robot policy |
| **`noRobot` step** | A step whose target is a person; a robot never performs it, and hands it to the clinician instead |
| **Episode / trajectory** | One recorded or synthetic run of a station, as a sequence of observation/action/reward/done/info steps |
| **District** | A shared, mesh-budgeted outdoor or specialised 3D environment several stations can stand in |
| **Egg / field note** | An optional, structurally separate diversion that never touches a station's steps or score |
| **Wordmark** | The typeset union name/abbreviation used on signage in place of a licensed logo |
