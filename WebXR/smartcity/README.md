# SmartCiti.X

AR/VR training simulators across eleven trade-union categories. Thirty-six stations exist
today — thirty-five walkable AR/VR procedures and one flat briefing station — each a real ordered
procedure with real hazards, its own gamified rank ladder, and the real
union and certification a worker in that role would actually need — not a generic "safety
training" wrapper, a specific one per trade.

## The eleven categories

| Category | Stations today |
|---|---|
| Energy & Power | Charge Point, Solar Deck, Line Truck, Substation Switching |
| Mobility & Transit | Signal Cabinet, Flight Deck, Track Access, Bus Depot Lift |
| Water & Environmental | Valve Vault, Abatement Chamber, Lift Station |
| Connectivity & Telecom | Splice Node, Tower Climb, Cell Site Battery |
| Building Systems & Facilities | Chiller Plant, Boiler Room, Elevator Pit, Fire Pump |
| Construction & Structural Trades | Steel Erector, Crane Yard, Trench Box, Scaffold Erection |
| Manufacturing & Automation | Robot Cell, Press Brake, Conveyor Guard |
| Emergency Services | Triage Point, Decon Line |
| Maritime & Ports | Dock Crane, Container Lashing, Mooring Line |
| Entertainment & Live Events | Rigging Loft, Stage Power, Chain Hoist |
| Environmental Monitoring | Hunters Point Briefing (flat — see below), Perimeter Air, Sampling Well |

This is a growth taxonomy, not a fixed roster: the plan is 33 stations per category (330
total) — enough for every category to eventually cover a whole family of real, distinct
trades rather than one representative example. The 20 stations above were categorized by
consolidating the 13 ad-hoc `domain` values each sim already carried (Energy, Mobility,
Water, Connectivity, Aviation, Emergency Services, Manufacturing, Building Systems, Telecom,
Construction, Facilities, Environmental, Entertainment, Maritime) down into the first 10;
Environmental Monitoring was added as the eleventh for sites that need a documentary rather
than a walkable treatment; a new
sim declares both `domain` (its specific field) and `category` (which of the 11 it belongs
to) in its own module — see `js/sims/*.js` and `tools/gen_sims_meta.mjs`.

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

## Headset budget

`catalog.json` carries a `meshes` and `lights` count for every station, from a headless build,
and flags `overBudget` past 320 meshes — the working ceiling for a Quest-class headset on top
of the shared stage. The headset pass starts with the heaviest stations; today none is over
budget.

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
`node tools/check_all.mjs` (every headless checker — smartcity, trades, holodeck, records,
identity, lrs, orbis-stable — one line each) and a freshness check that regenerates `sims-meta.js`
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
that trade, on `REVIEW.md`, before any record is treated as certification evidence; (3) a headset
pass on Meta Quest for frame rate, comfort and in-headset legibility, heaviest stations first per
`catalog.json`; (4) the remaining stations
toward 33 per category. Environmental Monitoring is three stations deep today (one flat briefing, two walkable procedures); the Bay restoration sites and their
trade linkage that the roadmap mentions are not in this repository yet — this is the first, honest
entry in the category, not that content.

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
