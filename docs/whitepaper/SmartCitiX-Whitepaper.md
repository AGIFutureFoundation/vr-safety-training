# SmartCiti.X — a white paper

_Union-trade AR/VR procedure training that runs in a browser, proves what it scores, and says plainly what it has not yet proven._

_Written 2026-09-23 from the repository as it stands on that date. Every number in this paper is read from a file in the repository — `WebXR/smartcity/catalog.json`, `tools/check_all.mjs`, `tools/standards.json`, `tools/eval_content.mjs`, the READMEs and the `docs/` tree — and the file is named beside the number where it matters. Where the repository says a thing is unverified, assumed or a stub, this paper says so in the same words. Nothing here names a customer, a revenue figure, a partner agreement or a quotation, because the repository holds none._

---

## Contents

1. Executive summary
2. The problem
3. The current version
4. The stack
5. Compliance and safety posture
6. Roadmap
7. Questions and answers
8. A letter to prospective investors
9. Appendix

---

## 1. Executive summary

SmartCiti.X is a network of browser-based AR/VR training simulators for union trades. A learner opens a web page, walks into a generic but fully dressed job site, and works a real ordered procedure — a lockout, a confined-space entry, a chairside turnover — with their hands. The engine scores every touch, seeds real hazards, interrupts the learner mid-step with the kind of event that actually hurts people, and writes an auditable record. There is no server to stand up, no app store, no account system: the whole thing is static files served over HTTPS.

By the numbers, as the catalog records them on 2026-09-23: **225 stations** (216 SmartCiti.X stations, of which two are flat sourced briefings, plus the 9 rooms of the sibling Trade Skills Simulator) across **17 trade categories**, organised into **24 training programmes**, each naming a real union and the standard the block maps to. Together they hold **2,940 scored steps**, **917 seeded hazards** and **442 interruptions**. Every station cites at least one entry in a **standards registry of 285 entries across 75 publishing bodies**, of which 242 carry a citation form the authors are sure of and 43 are carried as body and title only, marked unverified. A **competency layer of 34 competencies** over 213 distinct stations and 69 standards sits above the game badges and applies one stated mastery rule. **29 headless checkers** gate every commit; the content evaluation ranks the corpus at a **mean of 95 out of 100** over all 225 procedures. **33 head-worn device profiles** in five classes decide how a station renders on hardware from a Quest to a hardhat monocular. Three input layers — keyboard, gamepad and voice — are checked so that nothing spoken can complete a step.

What it proves today is narrower than what it contains, and the repository is careful to say so. Records are held in the learner's browser until exported as CSV, xAPI 1.0.3 or Open Badges 2.0; the badges are self-asserted until a hall hosts them. Identity is a launch context handed in by an LMS or a URL, not authentication; the one server in the repository, an LTI 1.3 relay, verifies a signed launch and has been proven against a stand-in platform, not registered with a real one. The practitioner review packet shows an automated preview pass on every section and a practitioner sign-off on none. No headset performance pass has been recorded, though the instrument to record one exists. The adaptive-content client (Orbis-Stable) and the Holodeck's prompt interpreter are seams with no live model behind them. There is no sign-in page and no homepage; there is no contract with any host platform in the repository, and the name Cognition.X appears exactly once, as one example of a host that could receive credentials.

The case for funding or adopting it rests on three things the repository does demonstrate: a deterministic engine whose scoring, pass rule and mastery rule are stated once in code and read everywhere; a content corpus built and checked at scale, with the tooling to grow it; and a habit of writing down what is unverified rather than papering over it. The roadmap is ordered by dependency, and the letter at the end says what money would buy in that order.

---

## 2. The problem

### Union and trade training today

A journeyman is made by doing the job beside someone who already knows it, and a union training centre — a JATC, a training fund, a hall — exists to make that safe and repeatable. The repository's own framing of the gap is in `WebXR/shared/incidents.js`: "A toolbox talk is somebody reading out what went wrong on the job and the crew nodding. Nobody rehearses it, so the next crew meets the same event cold." The procedures that kill people are written down in OSHA subparts, NFPA documents and apprenticeship standards, and taught from slides, because the only place to rehearse a chlorine leak or a lock coming off a hasp is the one place nobody should.

The training centre's other problem is proof. A safety director does not sign a game score; what they sign, in the words of `competency.js`, is "a named thing a journeyman can do, tied to the standards a body actually publishes, demonstrated by passing named stations under one stated rule that never bends." A hall needs a transcript that says which standard, which procedure, which run, and why a near miss did not count.

### What a simulator has to prove

The repository's design documents set out the bar a simulator has to clear before its records mean anything, and it is a useful list because it is the list the platform is built against:

- **Order is assessed, not suggested.** Reaching for a later step's control is its own scored mistake with a trade-specific reason (`WebXR/trades/README.md`). A quiz with a 3D background does not do this.
- **Hazards carry consequences.** Every station seeds real traps — another worker's padlock, a water jug beside a grease fire, a production credential next to the staging ones — and touching one costs double and explains what would have happened.
- **The dangerous thing is not the procedure.** `WebXR/smartcity/README.md`: "Every step kind in this engine asks the same question: do you know what comes next. That is worth assessing and it is not what gets people hurt. What gets people hurt is the thing that happens while they are busy." A simulator has to interrupt the learner and score whether they noticed.
- **The second attempt has to still measure something.** `variants.js`: a learner who repeats a station "learns the answer key … and the score stops measuring competence and starts measuring recall."
- **The record has to be attributable and exportable** to the formats a hall, an HR system and a Learning Record Store already accept.
- **Nothing may be invented.** The station brief that every authoring team reads (`tools/briefs/station-brief.md`) forbids naming a real site, a real person, or "a clause number you are not sure of — name the body instead." A drill that teaches an invented clause on a union floor, as `incidents.js` puts it, "is how a platform loses a hall."

### Why headset fleets fail in the field

The device guide (`docs/devices.md`) is unusually direct about the hardware problem. The head-worn devices a site crew actually wears "are mostly assisted-reality or optical see-through systems whose browsers offer no immersive WebXR session," and the headsets a training centre buys for its classroom "are a second, different fleet." A procedure "that renders a full plaza with rain at 2× pixel ratio behind a 28px HUD is unreadable on an 854-pixel-wide monocular display clipped to a hardhat" (`WebXR/shared/devices.js`).

Three further failure modes the repository names:

1. **The device is not PPE.** "A smart glass is not automatically safety eyewear," and a VR headset "is never worn with a hardhat." The device layer records vendor safety statements and marks them as claims to verify, never as certification.
2. **Detection lies.** Apple's Safari on visionOS "sends a desktop-Mac user agent on purpose"; PC-tethered headsets show the PC's browser. A wrong guess must change only the rendering profile, never the procedure, and the learner has to be told what was chosen.
3. **Nobody has measured it.** The repository's own enterprise-readiness note (`WebXR/smartcity/README.md`) lists "a headset pass on Meta Quest for frame rate, comfort and in-headset legibility" as not yet done: "the instrument to record that pass now exists (`?perf=1`) … the numbers do not." A fleet purchase made before that pass is a fleet purchase made on an assumption.

---

## 3. The current version

### 3.1 By the numbers

All counts are from the generated catalog (`WebXR/smartcity/catalog.json`, `generatedAt` 2026-09-23), the output of `node tools/check_all.mjs` run the same day, and `tools/standards.json`. Some READMEs and the review packet carry older counts (181 stations, 22 programmes, 89 sections); the catalog and the checkers are the current source.

| Measure | Value | Source |
|---|---|---|
| Stations in the shared catalog | 225 (216 SmartCiti.X + 9 Trade Skills rooms) | `catalog.json` |
| Flat (non-walkable) briefing stations | 2 — Hunters Point Briefing, Can We Live? | `catalog.json` `flat` |
| Trade categories | 17 | `catalog.json` `categories` |
| Training programmes | 24 | `catalog.json` `curricula` |
| Scored steps across the roster | 2,940 (median 13 per station; range 10–16) | `catalog.json` |
| Seeded hazards | 917 | `catalog.json` |
| Interruptions | 442 across 221 procedures, every one visibly changing the scene | `check_interrupts.mjs` |
| Step kinds | 8 — select, sequence, find, gauge, hold, track, turn, drag | `shared/game.js` |
| Weather kinds | 7 — clear, overcast, rain, fog, wind, storm, smoke | `catalog.json` `weather` |
| Indoor stations / interior styles | 103 / 6 (plant, service, shop, garage, theatre, datahall) | `catalog.json`, README |
| Headless checkers | 29, all passing | `tools/check_all.mjs` |
| Content-eval corpus mean | 95 / 100 over 225 procedures | `tools/eval_content.mjs` |
| Standards registry | 285 entries, 75 bodies; 242 verified citation form, 43 unverified | `tools/standards.json` |
| Competencies | 34 (24 programme, 10 core) over 213 stations and 69 standards | `check_competency.mjs` |
| Device profiles | 33 devices, 6 run profiles; 22 detected by user agent, 11 URL-only | `check_devices.mjs` |
| Device classes | monocular 8, goggle 9, helmet 3, mr 2, vr 11 | `check_devices.mjs` |
| Input methods | 5 keyboard presets × 13 actions; 15 gamepad buttons + 2 sticks; 26 voice commands | `check_input.mjs` |
| Apps | SmartCiti.X, Trade Skills Simulator, Holodeck, portal; plus the instructor console and the credential verifier; plus the older Safety Campus companion page | `WebXR/` |
| Global level ladder | 33 levels in 9 named tiers, shared by three apps | `shared/game.js` |
| Mesh budget | 320 per SmartCiti.X station, 430 per Trade Skills room; all 225 inside | `check_budget.mjs` |
| Shipped binary models | 1 (`guide-worker.glb`, CC-BY 4.0) | `check_models.mjs` |
| Commits | 222, from 2026-07-17 to 2026-09-23 | `git log` |

Stations by category (catalog, 2026-09-23): Culinary & Hospitality 33; Community Environmental Justice 26; Emergency Services 21; Dental & Oral Health 20; Water & Environmental 16; Maritime & Ports 15; Environmental Monitoring 15; Construction & Structural Trades 13; Energy & Power 12; Sewing & Garment Trades 10; Building Systems & Facilities 8; Entertainment & Live Events 7; Trade Skills Simulator 7; Mobility & Transit 6; Connectivity & Telecom 6; Manufacturing & Automation 6; Surface Prep & Coatings 4. The SmartCiti.X README states the growth target as 33 stations per category.

The 24 programmes: Inside Wireman — First Period (8 stations); Confined Space — Entry and Rescue (4); Working at Height — Fall Protection (5); Hazmat and Environmental Response (6); Rigging and Lifting (5); Stationary Engineer — Building Plant (5); Port and Terminal Operations (4); Transit and Ramp Operations (5); Energy Transition Systems (5); Live Events Production (4); Hunters Point Clean-up and Bay Restoration (26); Culinary — The Working Kitchen (16); Dental Hygiene — Unspoken Smiles (16); Dental Careers — Unspoken Smiles (6, with two slots open); Bartending — Behind the Bar (16); Hunters Point Edition — Can We Live? (26); Sewing and Garment Trades (11); Bridge and Structural Trades (4); Hotel Workers — Back of House (4); Builders — Carpenters, Laborers and Masons (4); First Responders — Fire, EMS, Police, Crisis and Relief (16); Situational Awareness — Interruption Drill (22); Ports, Maritime and Bay Ecology (11); Air Quality — Monitoring and Control (6). Every programme carries the same completion rule: "every station has a passing attempt (stars >= 2, no unsafe action)."

### 3.2 The procedure engine and the step kinds

`WebXR/shared/game.js` is the one engine every app runs. Its header states the contract: "A room supplies an ordered list of steps. The engine owns correctness: it decides whether an interaction advances the procedure, applies score, and produces the coaching line the HUD shows. Rooms never score themselves, so the assessment stays deterministic and auditable — the same contract the Unity build uses."

Eight step kinds cover what a hand does on a job. **select** is a single correct control; **sequence** is an ordered set; **find** is a set in any order; **gauge** is an analogue setting scored inside a band, so "just barely right" and "dead centre" differ; **hold** must be held for its seconds and restarts if released early (the 20-second handwash, the post-weld fire watch); **track** is a drifting reading the learner keeps in band; **turn** is a valve or handle rotated through its turns; **drag** is pick-and-place onto a target. The station brief requires 12–15 steps over at least five kinds per station, with a `why` on every step whose median length is at least 200 characters and states "the consequence or mechanism a journeyman would give; never padding."

Scoring constants are exported once and read by everything else: 100 points per correct step times the combo; a wrong control costs 25; a registered hazard costs 50 and is recorded as an unsafe action; the combo climbs 0.1 per clean step to a cap of 2.0×; finishing under par adds 2 points per second saved. Stars, not score, decide whether a run counts: three for no corrections inside par, two for at most one correction inside 1.5× par, one otherwise.

### 3.3 Interruptions

An interruption "is not a step. It arrives unannounced partway through a step the learner is already working, it runs on its own clock, and the learner has to break off, deal with it and come back." Every station is required to carry two. Scoring is deliberately asymmetric: catching one is worth 120 points plus up to 60 for speed, "because noticing is the harder thing and the one nobody practises"; missing one, or answering with the wrong control, counts as an unsafe action and lands on the same field the pass rule and badges read. "A run can be procedurally perfect and still fail on the alarm it slept through, which is the point."

Two rules are enforced by `tools/check_interrupts.mjs`: an interruption must visibly change the world (a fan stops and its lamp goes red; a lock is gone from the hasp) — "an alarm you can only read is a caption" — and its answer must not be the control the learner is already holding, because "that is not an interruption, it is a nudge." 442 interruptions across 221 procedures pass these rules today. The **Situational Awareness — Interruption Drill** programme collects 22 stations a learner may already know and reports an `attention` figure — interruptions caught against dropped — separately from the station count, because "passing the procedure and noticing the alarm are two different competencies."

### 3.4 Hazards

Every walkable station seeds four hazards on registered objects (the brief's requirement; the corpus holds 917). Touching one costs 50 points, is recorded as an unsafe action, and explains its consequence in text the accessibility checker requires to be a full sentence. In the two flat stations the hazards are unsafe conclusions rather than objects — "treating a parcel as open ground, swapping a clean sample, silencing a dust monitor, dismissing the community's monitors" — scored on the same engine. The instructor console can switch a session between **Assess** (an unsafe action counts) and **Coach** (called out once, taken back off the count); the choice is written onto the record as `hazardMode`.

### 3.5 The emotional-intelligence guide and the check-in

`WebXR/shared/ei-guide.js` decides the tone of what is said around a score. Its rule set is the one "a good peer-support trainer follows: name what happened in one plain sentence, say what to do next, never blame, never minimise, and after a hard run ask how the person is and point at the real support line." The file's own example: a first responder who missed a Mayday "does not need 'Unsafe action detected'. They need 'You missed the Mayday while the line was stretched. Next time, the radio wins. Reset and go again.'"

Every results card ends with an unscored check-in — "How are you doing after that run?" with three answers, Steady, A bit shaken, Need a minute — and a rough run adds the pointer to the local's peer-support or EAP line (`supportLine`). Answers are stored only in the learner's own browser, never transmitted, and are not part of any export (`docs/ei-guide.md`). The First Responder series brief makes the human side procedure rather than decoration: the words said to a person in crisis, the check on a partner and the debrief are scored steps, and the interruptions are "the human ones: a bystander filming, a partner freezing, a family member arriving."

### 3.6 Pre-brief and debrief

The first run of any walkable station opens on a **pre-brief**: the procedure as study material, every step and its reason, the union and certification it maps to, and how many hazards are seeded — never which. Reading it stamps the shared profile and the run that follows starts *prepared*, earning the engine-wide Prepared award and a 10% score bonus. Skipping is allowed and costs only that. The README calls it the flipped classroom: "learn the procedure first, then prove it in the simulator."

At the other end, the **step debrief** times every step and shows one row per step on the results screen, toned clean, corrected or unsafe, with two lines naming the step that took longest and the step that gave the most trouble — "the two an instructor asks about first." The step log persists on the record and is mapped into xAPI result extensions.

### 3.7 Gamification, and the competency tier above it

The motivational layer is deliberately separate from the proof layer. Each station has its own five-tier rank ladder tracked by its own XP; one account-wide level runs 1 to 33 in nine trade-apprenticeship tiers (Trainee through Apprentice, Journeyworker, Technician, Specialist, Foreman, Master, Certified Master and Legend at 33), shared by SmartCiti.X, Trade Skills Simulator and Holodeck; leaderboards are per station and per device, "arcade-cabinet style." Three stars earn a station's badge.

Above that sits `WebXR/shared/competency.js`, "the sober tier above the badges." A competency is "a named thing a journeyman can do, tied to the standards a body actually publishes, demonstrated by passing named stations under one stated rule that never bends." That rule is the mastery rule, stated once in code and quoted in full in the appendix: two or more stars, zero unsafe actions, every interruption answered, and time within 1.5× par. One mastery run on enough of a competency's stations earns *demonstrated*; mastery runs on three different days earn *consistent*. "No other rule earns a competency. There is no partial credit, no curve, and no second rule for a learner who nearly made it." A near miss is reported with the first reason it fell short, in a fixed order, "because a learner who touched a live bus and also ran long needs to hear about the live bus."

There are 34 competencies: 24 programme competencies that mirror the curricula blocks one for one (a checker fails the build if they drift), each requiring mastery on half its stations capped at six, and 10 cross-programme core competencies — fall protection, lockout/tagout, confined space, hot work, trenching, crane and rigging, respiratory protection, hazard communication, emergency response and trauma-informed practice — that name their required count outright. A competency is dated by its evidence, so an exported badge is issued on the day it was earned rather than the day somebody pressed export.

### 3.8 Proof of training and Open Badges

Every finished run appends one immutable entry to the training record (`WebXR/shared/records.js`): station, category, union and certification, score, stars, corrections, unsafe actions, time against par, the interruption tally, any instructor actions, and a pass verdict under the rule "two or more stars with no unsafe action." The record carries "nothing it must not (no biometrics, no free text beyond the learner's own crew tag)."

Exports are the hand-off. **CSV** (RFC 4180) for a spreadsheet, HR system or a hall's register. **xAPI 1.0.3** statements with `passed`/`failed` verbs, the station as a `simulation` activity, and category, certification, stars and unsafe-action count as extensions. **Open Badges 2.0** assertions — a station badge for every passing run on a station with a real certification, and a competency badge for every demonstrated competency, carrying the standards as OB `alignment` entries, the station and attempt ids, and the mastery rule text in the criteria narrative. The **Proof** tab of the records overlay shows competency cards, the proof transcript (every attempt behind every claim, and why a run did not count) and the scoring rubric read straight from `game.js`'s constants. A print transcript is built as DOM text nodes only, "the last place to hand markup a chance to run."

Two limits the repository states in its own words: "These are self-asserted by a static page: hosting the BadgeClass and Assertion URLs under an issuer is what makes them verifiable," and "Passing a simulator evidences readiness for the named certification; it is not the certification." The credential verifier at `WebXR/verify/` lets a third party check an exported assertion and returns one of three honest verdicts: a structural pass without a hosted match is "self-asserted", a hosted match is "the issuing hall stands behind it", a mismatch is "altered." It flags the `smartciti.example` placeholder home that means the hall never hosted the assertion.

### 3.9 The standards registry and the eval

`tools/standards.json` is "the one place a standard, code or union training programme this platform teaches against is written down": id, body, title, the catalog categories it governs (`scope`), the forms a station's own text cites it by, and `source` — `verified` where the citation form is one the authors are sure of, `unverified` where the entry is carried as a body and a title because "the exact designation, edition or course code is not certain — there the claim is the body and the subject, not the number." On 2026-09-23 it holds 285 entries across 75 bodies, 242 verified and 43 unverified. The largest families are OSHA (65 entries), NFPA (29), the unions' own apprenticeship and training funds (29), ANSI/ASSP (20) and EPA (16); most of the union entries are marked unverified by design, since a training fund's course code is not something to guess. `docs/standards/README.md` renders the registry; `docs/compliance/compliance-matrix.md` is generated from the station sources and maps every procedure to the standards it cites and every standard to the procedures that carry it. The compliance README is explicit that the matrix "maps what is taught. It is not a certification of compliance with any standard."

`tools/check_standards.mjs` is the gate: every station must cite at least one registered standard in scope for its category. `tools/eval_content.mjs` is the ranking: eight weighted dimensions — variety (0.18), decisions (0.20), explanation (0.18), grounding (0.14), standards (0.14), feedback (0.15), scene (0.10), originality (0.05) — scored per station and printed worst-first. The standards dimension is the share of a station's cited authorities that resolve to a registry entry governing its category, less a penalty for citing out of scope, "which is how a code borrowed from somebody else's trade becomes visible." The originality dimension penalises the closest prose match between any two stations. The eval "deliberately does NOT fail a build … wiring it into check_all would turn an opinion into a gate and start producing stations written to satisfy the metric." On 2026-09-23 the corpus mean is 95 over 225 procedures; the two flat briefings score 73 (they have two step kinds and no interruptions by design) and the lowest walkable station scores 90.

### 3.10 The instructor console and the observer protocol

`WebXR/instructor/` is the console for the person running the class. It "owns no simulation, no scoring and no records: it speaks only the observer protocol (`WebXR/shared/observer.js`) and reads the static catalog for its roster." Three views: **Live class**, one card per session with the step, score, stars, corrections, unsafe actions, interruptions answered, the last twelve notable events and the verdict; **Roster**, the whole catalog with search, from which a station or programme can be sent to one learner or every live session; **Session log**, both directions, exportable as CSV, gone when the page closes.

Nine commands — roll call, note, hold/release, open, fire an interruption, set weather, set device profile, coach/assess, assign a programme — each of which "must exist as a command the learner app answers, must be logged in the learner's record, and must have a learner-visible effect." A command the app cannot honour is refused with the reason and not recorded. Every honoured command is appended to the learner's attempt as an `instructorAction`, "so a run driven by an instructor is never mistaken for one the learner drove alone." Untrusted text — crew tags, notes, alerts — is set as text nodes; `tools/check_console.mjs` fails the build if markup assignment appears anywhere in the console.

The default transport is a browser `BroadcastChannel`, same-origin and same-device: "a hall with a row of laptops, or headsets mirrored to one screen." For an instructor on another machine both sides accept `?relay=<ws url>`; `tools/relay_server.mjs` is "a dumb fan-out" whose header says what it is not: "authentication, encryption or an audit trail. Anyone who can reach the port can send commands to every learner on it." The protocol is at version 2 and still accepts version 1.

### 3.11 Device profiles and the controls layer

`WebXR/shared/devices.js` is "the one place a headset is described; app code reads a profile, never sniffs a user agent itself" (`tools/briefs/interface-brief.md`). Thirty-three devices in five classes — vr, mr, goggle, monocular, helmet — each map to one of six run profiles that decide pixel ratio, shadows, whether the weather layer and the skyline are built, HUD and target scale, contrast, whether the scene sits on black (optical see-through: black is transparent), which entry mode the intro offers first, and what the select verb is called in a hint (a click, a trigger, a pinch, a touchpad, a spoken word). Detection is by `?device=` on the URL first, then user agent, then a small-monocular screen heuristic, else desktop; "a wrong guess only changes the profile, never the procedure, and the intro names what it chose so a learner can correct it." User-agent rules exist only for browsers known to announce themselves (22 devices); the other 11, Apple Vision Pro above all, are URL-only, and `tools/check_devices.mjs` proves no rule shadows another. No field-of-view or resolution figure is recorded, "because none was verified." The full table is in the appendix.

The controls layer (`WebXR/shared/input.js`, `docs/controls.md`) holds one action table for three inputs: five keyboard presets (Standard, WASD + IJKL, Left hand, Numeric keypad, One hand) over thirteen remappable actions, a gamepad polled by the W3C Standard mapping by index alone, and a voice grammar of 26 fixed phrases parsed by an ordered grammar, "not a model." Two rules are enforced by `tools/check_input.mjs`: **hands do the work** — voice, pad and keyboard navigate, focus, adjust, read back and open panels, but "nothing here completes a step by speaking" — and **every action is reachable from the keyboard**. Hand tracking (`shared/hands.js`) maps pinch, fist and wrist roll onto the same verbs the controllers drive; the classifier is a pure function checked headlessly, while "what is left unverified is the plumbing — that the runtime hands us joints at all — which is the part a device has to confirm."

### 3.12 Human avatars and the CC-BY hero

Almost everything in the product is built from primitives at runtime. The crew figures on a site — a supervisor by the gate, a banksman with wands down, a second welder in the next bay — are `standingFigure()` builds from `citykit.js`, restyled on 2026-09-22 with "painted hi-vis dress with reflective bands, caps, safety glasses, tool belts and higher-resolution faces" at equal or lower mesh cost. None is a step target or a hazard, and `check_layout.mjs` fails a figure standing inside equipment.

The one scanned figure in the product is the hub's guide, `WebXR/smartcity/models/guide-worker.glb`: "Construction worker in high visibility" by restore50, CC-BY 4.0, decimated to about 3% of its triangles, 551,500 bytes, with the licence's credit line in the hub's intro panel and in `WebXR/assets/env/ATTRIBUTION.md`. `tools/check_models.mjs` holds every shipped `.glb` to five things: 2 MB or smaller, an attribution line with title, author and source, a licence the product may redistribute (CC0, CC-BY-4.0, CC-BY-3.0 or a marketplace licence), a module that references it, and a copy in `dist/`.

### 3.13 The environment texture pipeline

Every surface used to be one flat colour, "which is what made the scenes read as diagrams rather than places." `shared/kit.js` now builds finish variation procedurally — a roughness map and a normal map per finish, drawn once into a 256-pixel canvas and shared by every material that asks for the same finish, "so a hundred concrete surfaces still batch the way they did before." `citykit.js` adds `surfaceTexture()` (a repeating canvas texture drawn by a function) and the large-surface faces the station brief requires on big areas: `pavingFace`, `deckPlateFace`, `waterFace`, `mudflatFace`. A licensed GLB can also be loaded around a station (`shared/environment.js`); the only file there today is a hand-built CC0 placeholder street, and the directory README refuses game rips and models of unknown provenance.

### 3.14 The robot embodiment layer and datasets

`WebXR/shared/robot.js` is a software learner that "sees exactly what the procedure engine exposes … and emits one action at a time," parameterised by a single skill in [0, 1]. Headlessly, `tools/robot_train.mjs` plays every station and writes each station's optimal skill (found by bisection to a target success band), episodes and per-decision trajectories; a default run of 30 stations and 900 episodes "takes about two seconds." Live, `?robot=<skill>` runs the agent through the same click path a learner uses. The honest use, in the README's words, is difficulty tuning: "which stations an expert still fails (over-tuned) or a random agent already passes (under-tuned)."

`WebXR/shared/robot-embodiment.js` is "the missing half" for a machine with an arm: for every interactable a target pose derived from the scene, for every step the grasp its kind implies and the most force the robot may use (`none`, `light`, `firm`), and for the room the keep-out volumes around the people in it. Two safety rules carry it. A step marked `noRobot` is never performed by the robot and is handed to the clinician, recorded with `operator: "human"`, no pose, no force and no credit. Entering a keep-out volume is a violation unless the step declares patient contact by carrying a `forceClass` — "a station that reaches for a patient without saying so fails the checker, which is the point: the declaration is the safety case." The fifteen dental hygiene stations are annotated to this rule set; 46 steps across the block are ones a robot must never perform, which `docs/robot-training.md` calls "the point of the exercise, not a shortfall." The dataset is labelled synthetic, generated from the procedures, deterministic for a seed, and engine-level — "ids, states, rewards, not pixels."

### 3.15 The Holodeck generator and the Trade Skills bays

`WebXR/holodeck/` is "a prompt-driven generator that builds a scored safety-training procedure from a spoken or typed description, or loads any real SmartCiti.X station by name." Its `training.js` generates a procedure from one of three templates (lockout and verify, confined-space entry, pressure isolation and bleed-down) and an equipment noun, played through the same `Session` engine, so "nothing about the scoring, hazards or combo system is a toy version." `shared/lessons.js` turns a sentence into a programme of real stations ("nothing here invents content"); `shared/incidents.js` turns a near-miss report into a replay that adds one interruption and never rewrites the procedure; `shared/crew.js` splits a station between two roles only when the station itself holds the evidence, and otherwise declines. The prompt interpreter is a keyword stand-in: "There is no live model behind this yet — no working API endpoint or credentials have been wired into this project."

The Trade Skills Simulator (`WebXR/trades/`) is the sibling app: nine rooms — Isolation Bay, Colour Studio, Hot Line, Draw Station, Weld Bay, Deploy Bay, Rough-In Bay, Wash-Down Yard, Coatings Bay — on the same engine and profile. Its rooms open the Inside Wireman, Dental Hygiene and Situational Awareness programmes.

### 3.16 Records, xAPI, LRS, LTI and identity

**Identity** is "a launch context, not authentication, and the docs say so" (`shared/identity.js`). It arrives two ways, both under the host's control: a launch URL (`?learner=…&learner_id=…&learner_home=<https origin>`, read once, kept per tab, scrubbed from the address bar) or an embedding page's `postMessage`, accepted only when `learner_home` equals the sender's real origin. With an identity present the crew tag is locked, every record and xAPI actor carries it, and each finished attempt is also posted back to the host page — "only when embedded, and only to `learner_home`, never broadcast."

**The LRS connection** (`shared/lrs.js`) POSTs every finished attempt to `<endpoint>/statements` as xAPI 1.0.3 the moment it happens; a statement that cannot be delivered waits in a local queue and is retried, carrying the record's own id so a resend never double-counts. Endpoints must be https (http on localhost only); a credential is kept per tab and "never written to localStorage."

**The LTI 1.3 relay** (`tools/lti_relay.mjs`) is "the one server this network needs, and the smallest one that does the job." It runs the OIDC third-party-initiated login, verifies the platform's RS256 `id_token` against its JWKS — issuer, audience, expiry, single-use nonce, message type and version — and 302s the browser into the app with the launch context. `tools/check_lti.mjs` stands in a platform with its own RSA key and proves a good launch redirects and a bad signature, wrong audience, expired token, replayed nonce or unknown state is refused. It has not been deployed behind TLS or registered with a real platform; the README lists that as the first undone item, "a platform-side act."

**The platform channel** (`shared/platform.js`, protocol 1) lets an LMS or portal drive an app (`open`, `hub`, `status`, `catalog`) and hear back (`ready`, `state`, `progress`, `record`, `credential`), only to the `learner_home` origin. The static catalog is the roster a platform can index "without loading the app at all."

### 3.17 The flagship editions

**Hunters Point Edition — Can We Live?** (26 stations) and **Hunters Point Clean-up and Bay Restoration** (26). The edition is "a 25-station flagship built to be offered to the Marie Harrison Community Foundation ('Can We Live?')" with a sourced flat opener. The brief's rules are not negotiable: every station "sited generically," never naming a real person, never inventing "a foundation programme detail, a partner, a number or a clause," and "it is not the foundation's own programme and must never say it is." Consent (45 CFR 46) is a scored step wherever a person's sample or data is touched. The Hunters Point Briefing is deliberately flat — an active EPA Superfund site is not rendered as a stroll — and every paragraph carries its source, with the README noting "the settlement and the lawsuit are live matters." The opener's header records that the foundation's own pages "could not be retrieved from the environment this file was written in, so where its own words belong the dossier says so rather than guessing."

**Dental Hygiene — Unspoken Smiles** (16) and **Dental Careers — Unspoken Smiles** (6, two slots open). The hygiene block makes a hygienist's clinical day — from operatory turnover and instrument reprocessing through scaling, radiographs, a chairside emergency and a mobile outreach van — into scored procedures under CDC infection-control guidance, OSHA bloodborne pathogens and hazard communication, the EPA amalgam rule and the state practice act. It doubles as the robot training simulator described above. The careers programme, opened for expansion, holds the pathway briefing, four-handed dentistry, a full-mouth radiographic series, the sterilisation technician's cycle and the laboratory bench. The repository names the block "Unspoken Smiles" in its programme titles and does not describe the organisation behind that name; this paper does not either.

**First Responders — Fire, EMS, Police, Crisis and Relief** (16): fireground size-up and rehab, a cardiac arrest, an overdose, a crisis call, a critical incident debrief, trauma-informed intake, a shelter and psychological first aid — every station closing with the crew's own check-in. **Sewing and Garment Trades** (11) "teaches sewing as a trade" for Workers United and UNITE HERE members under machine-guarding and lockout standards. **Hotel Workers — Back of House** (4) for UNITE HERE housekeepers, laundry and banquet staff under Cal/OSHA's housekeeping and workplace-violence standards. **Ports, Maritime and Bay Ecology** (11) and **Port and Terminal Operations** (4) for ILWU, the Inlandboatmen's Union, IBEW port electricians and LIUNA. **Bridge and Structural Trades** (4) for Ironworkers, IUPAT bridge painters, IUOE and LIUNA. **Inside Wireman — First Period** (8) is the IBEW block: "the isolation habit, built four ways," opening on the Trade Skills panel bay and ending in a grid battery yard. **Builders — Carpenters, Laborers and Masons** (4) for UBC, LIUNA, BAC and IUOE under Subparts Q, L and CC and the silica rule.

---

## 4. The stack

### WebXR, three.js and vanilla ES modules

Every app is a static WebXR page. The renderer is three.js 0.160.0, fetched from cdnjs as the one pinned external dependency; the environment loader's GLTFLoader is vendored under `WebXR/vendor/` (MIT) "so a hall's kiosk works with only the one CDN fetch it already makes." There is no framework and no build toolchain in the ordinary sense: the source is plain ES modules under `WebXR/<app>/js` and the shared engine under `WebXR/shared/`, which is why "ES modules need HTTP, not `file://`" for the modular source. The only per-app UI helper is a small React-style renderer for the 2D chrome that builds elements from plain data, never from HTML strings. Stations run in three modes: flat (any browser), immersive AR (a WebXR browser with hit-test, the station placed on the real floor) and immersive VR.

### The single-file bundler and lazy stations

`tools/bundle_webxr.py` inlines an app's modules into `WebXR/<app>/dist/<name>.html`. For Trade Skills and Holodeck the result is genuinely self-contained and even opens via `file://`. SmartCiti.X is the exception: its stations are lazy-loaded through dynamic `import()`, so its `dist/` "is a real folder — the HTML plus `sims/`, `citykit.js` and `gamify.js` copied alongside it — and needs a real HTTP(S) server." A learner therefore downloads the engine once and each station only when they walk into it, which is what lets 216 stations sit behind one page. The CI workflow regenerates `sims-meta.js`, `catalog.json` and every `dist/` bundle and fails if the committed copies differ, because "a stale bundle is a silent deploy of old code."

### The checkers as a gate

`node tools/check_all.mjs` runs 29 headless checkers and prints one line each; the full list with each checker's own summary line is in the appendix. The order matters: `check_parse` runs first because "every other checker reads these files after deleting the part of them most likely to be malformed," and `check_imports` second, "before anything asks whether the content is right." The rest build every station against a stubbed three.js and drive the real engine: a scripted perfect run through all 216 simulators, every interruption fired and timed out and answered, every control reachable from where the learner spawns, every crew figure clear of equipment, every station inside its mesh budget, the records, identity, LRS, LTI, observer, console, competency, devices, input, standards and models layers each proven in Node. `.github/workflows/webxr-checks.yml` runs the same command on every push or pull request touching `WebXR/` or `tools/`. The loop brief's rule is "never push red."

### The content eval as a ranking

Described in section 3.9: eight weighted dimensions, printed worst-first, kept out of the gate on purpose. Its snapshot lives in `tools/eval-content.json` so the corpus can be tracked over time. It exists because a station "can pass all of [the checkers] while being ten clicks in a row with a paragraph of filler on each."

### The team-brief method

The corpus was built by many parallel authoring teams, each working in its own git worktree from a short brief. `tools/briefs/station-brief.md` is the shape every station must take (section 3.2), the registration command (`node tools/add_station.mjs <id>`), a list of "footguns no checker catches," and the verify routine: all checkers, the bundle, a headless-browser drive of every step with every interruption answered, a spawn screenshot "a person looks at," and the eval row. Series briefs add the rules for a flagship; `optimize-brief.md`, `proof-brief.md` and `interface-brief.md` govern raising a station, the proof layer and the interface. `loop-brief.md` is the integration tick: heartbeat (checkers and eval), integrate the handed-back worktrees, regenerate metadata "with the generators (never by hand)," gate the commit on the exact "All N checkers pass" line, publish, show, re-arm. The history shows the result: 222 commits between 2026-07-17 and 2026-09-23, most adding or raising three stations at a time.

### The observer relay

Section 3.10 describes the console; the relay (`tools/relay_server.mjs`) is the one optional process a class might run. It is a WebSocket fan-out written on Node's built-in `http` server with the RFC 6455 handshake and no dependencies, one relay per class, storing nothing and logging only a connection count. It is meant to run "on the training room's own network, behind a TLS terminator if it leaves the room."

### The artifact publishing path

The loop brief's publish step reads: "rebuild the site (`build_site.sh`) and republish the artifact at its existing URL; regenerate the compliance matrix and the wiki series page; refresh `docs/STATUS.md`." Two of those exist in the repository as generators (`tools/gen_compliance.mjs`, `tools/gen_wiki.mjs`). The script named `build_site.sh` is not in the repository as of this writing, and no artifact URL is recorded in it; the paper can say only that the brief describes a republish-in-place path and that its script is not checked in. The older WebXR companion README names `rb1.com` as a hosting domain and marks it an assumption: "It was not reachable or identifiable from the authoring environment, so nothing here is specific to it."

### What runs where

**Browser only, no server required.** SmartCiti.X, Trade Skills Simulator, Holodeck, the portal, the credential verifier and the instructor console are static files. Records, progress, badges and check-ins live in the learner's browser. The instructor console works across tabs on one machine with no process at all. Two things are needed for immersive modes: HTTPS (WebXR requires a secure context) and, when embedded, an iframe `allow="xr-spatial-tracking"`.

**What a deployment adds, each optional:** an LRS endpoint; a host page or LMS that supplies identity; the LTI 1.3 relay behind TLS, registered with the platform; the observer relay on the room's network; hosted BadgeClass and Assertion URLs under the hall's issuer; and a Content-Security-Policy that allows the three.js CDN fetch and Google Fonts, or self-hosted copies of both.

---

## 5. Compliance and safety posture

### What is proven

Properties the repository checks mechanically on every commit:

- Every one of 216 SmartCiti.X simulators and 9 Trade Skills rooms parses, imports only what it declares, builds, and can be played to a perfect run on the real engine.
- Every one of 442 interruptions fires after its delay, times out if unanswered, counts the miss as an unsafe action, scores a correct answer, is disarmed when the learner leaves its step, and visibly changes the scene.
- Every step target is reachable from where the learner arrives; every station is inside its mesh budget; every crew figure stands somewhere real.
- Every station cites at least one registered standard in scope for its category; every programme guide names a real registry entry; every competency's stations exist and every competency mirrors its programme block.
- Every exported Open Badges assertion validates against the same verifier a third party would use; the rubric shown to a learner is the engine's own constants, not a copy.
- The 33 device records are well formed and no user-agent rule shadows another; every gamepad and voice action has a keyboard equivalent; no voice command completes a step.
- The LTI relay refuses a bad signature, a wrong audience, an expired token, a replayed nonce and an unknown state, against a stand-in platform with its own RSA key.
- The instructor console sets no markup, imports no simulator code, and every command it offers is handled, recorded and reduced into the roster.
- The one shipped model is inside 2 MB, attributed, redistributably licensed, referenced and bundled.
- The Orbis-Stable client rejects, before any transport is called, any payload carrying a biometric or inferred-mental-state key.

### What is asserted

Claims the repository makes in prose, on its own authority, and marks as such:

- The procedures are real union procedures under the standards named. The automated preview signature in `WebXR/smartcity/REVIEW.md` checks completeness and internal consistency on every section; the practitioner signature — "a qualified practitioner in that trade" confirming the order, the rationale and the certification claim — is on none. "Until a station's section is signed 'approved as evidence of readiness', records from it are training records, not evidence for the named certification." (The packet's roster is also stale at 89 sections against 225 stations and needs regenerating.)
- The accessibility statement (`WebXR/ACCESSIBILITY.md`) is a self-assessment against WCAG 2.1 AA and Section 508 for the flat mode only. "No third-party audit has been carried out, and this document says so rather than implying one." The AR and VR modes are not claimed to be keyboard-operable.
- Device safety fields (`ansiZ87`, `intrinsicallySafe`, `helmetMount`) are "the vendor's own statements, never a certification by this project." Where no statement was confirmed the field reads `"unverified"`. No field-of-view or resolution figures are recorded.
- The 43 unverified standards entries are "carried as a body and a title because the exact designation, edition or course code is not certain."
- The sourced facts in the two Hunters Point dossiers carry their sources and are "live matters" to be re-checked when the record changes.
- Headset performance on real hardware: the instrument (`?perf=1`) exists; no pass has been recorded. Hand-tracking on real hardware: the classifier is checked; the runtime plumbing is "the part a device has to confirm."

### What a deployment must configure

- **Issuer URLs.** Badge ids are laid out as URLs under the learner's home. Until a hall hosts the BadgeClass and Assertion documents at those URLs, the verifier reports every badge as self-asserted and flags the `smartciti.example` placeholder.
- **LRS.** An https endpoint and a credential, set from the records overlay, the launch URL (endpoint only) or the embedding page from the learner's home origin. Nothing is queued until one is set.
- **Identity and sign-in verification on the host.** The apps cannot verify who is in front of them. `identity.js`: "There is no server here, so nothing can be cryptographically verified: this is a *launch context*, not authentication." Verification is the host's job — an LMS that knows the learner, or the LTI relay verifying a signed launch. There is no sign-in page in the repository and no account system; a deployment that needs one must provide it on the host side.
- **The relay and the console.** If the console leaves the room, `wss://` behind a TLS terminator, on a network only the class can reach, because the relay itself has no authentication.
- **The three.js CDN fetch.** Either allow `cdnjs.cloudflare.com` and Google Fonts in the site's CSP or self-host both.

### Licensing of models, and the exclusion

`WebXR/assets/env/README.md` sets the rule: only models "with a licence that allows redistribution in this product — CC0, CC-BY (with the attribution line below), or a marketplace licence that covers redistribution in a compiled application." `tools/check_models.mjs` encodes the permitted set as exactly CC0, CC-BY-4.0, CC-BY-3.0 and marketplace. A non-commercial licence such as CC-BY-NC is not in that set and a model carrying one fails the build; the README's wider statement covers it: "Ripped game assets are not licensed for this and are not accepted, whatever the file is called. A model whose provenance is unknown is not accepted until it is known." Third-party code is vendored with its licence under `WebXR/vendor/`. The one shipped figure is CC-BY 4.0 with its credit line in the hub and the attribution table. The synthetic robot datasets carry a licence note in their manifest identifying them as generated from the SmartCiti.X procedures.

### Data and privacy posture

Records "never leave the browser on their own; export is the hand-off." No biometric or inferred-emotional signal is recorded; check-in answers are excluded from every export; launch identity is scrubbed from the address bar; LRS credentials never reach localStorage; the perf instrument runs only with its flag. The robot trainee records to the training log like any attempt, and the README warns to clear or filter it before exporting a learner's record. `WebXR/shared/orbis-stable.js` — the pluggable client for a future adaptive-content model — "has no real backend behind it: nothing here ever makes a network call" and "is not imported by the running apps"; its purpose today is to fix the safety contract at the boundary so that a real transport, if one is ever added, cannot be handed a biometric signal.

---

## 6. Roadmap

Each item is listed with what the repository says it depends on. Nothing here is scheduled; the order is the dependency order.

### Near

- **Finish the Dental Careers programme.** The block holds six stations and two open slots (`// slot-dc-2`, `// slot-dc-3` in `curricula.js`); the careers summary names orthodontic and surgical assisting, the front office and treatment coordination, and community outreach as the careers still to be stationed. Depends on: the station brief and the dental rule set in `docs/robot-training.md`, both already written.
- **A host-platform contract.** The repository mentions Cognition.X once, as one example of a host that can ingest Open Badges or listen on the launch channel — "none is special-cased here." No FlowHub contract, specification or integration exists in the repository, so this paper cannot describe one; what exists is the platform channel (protocol 1) and the static catalog any host can already index. Depends on: a counterpart on the host side, and a decision about whether the host supplies identity by `postMessage`, by LTI launch, or both.
- **Homepage and sign-in.** Neither exists. The portal is a static map of the apps; identity is a launch context, and "real authentication (LTI 1.3 / SSO) needs a server and remains the next step." Depends on: deploying the LTI relay behind TLS and registering it with a platform, or a host-side sign-in that hands the launch context in.
- **More headset user-agent rules.** Eleven of the 33 devices are URL-only because their browsers are not known to announce themselves; the device guide says "vendors update browsers, so re-test before a fleet rollout." Depends on: hardware in hand, and the interface brief's rule of "no invented device facts."

### Mid

- **A verified standards library.** 43 registry entries are unverified, most of them union training-fund course names. Depends on: confirming citation forms with the bodies, and, separately, the practitioner review — the packet has 0 sign-offs, and a regenerated roster to cover all 225 stations.
- **Instructor cohorts.** The console shows the sessions it can hear and stores nothing; a programme can be assigned to a learner. A cohort — a named class with a roster and a history — is not in the repository. Depends on: a durable store, which the architecture currently places outside the apps (the LRS, or the host).
- **Multi-user sessions over the relay.** The relay is a dumb fan-out with no rooms and no authentication, "one relay is one class." Depends on: room scoping and authentication on the relay, and a definition of what two learners in one scene would share, which the engine does not yet model.
- **Headset fleet pilots.** The device guide's pilot short list names, for a hardhat pilot, the Epson Moverio BT-45CS, RealWear Navigator 520, Vuzix M400 with the M-Series helmet mount, Rokid X-Craft, ThirdEye X2 or MIDAS and the Vuzix Shield where the glasses must be the eye protection; for the training room, the Meta Quest 3 or 3S as the fleet headset, Pico 4 Enterprise where device management without a consumer account matters, and one Apple Vision Pro pinned by URL to exercise the hands profile. Depends on: the Quest headset pass with `?perf=1`, heaviest stations first, whose numbers "do not" yet exist, and the three procurement questions in `docs/devices.md` answered by a safety officer, not the app.

### Far

- **Robot training partners.** The embodiment layer and datasets exist and are labelled synthetic and engine-level. Depends on: a partner with a real arm to close the loop from pose, grasp and force class to a controller, and extending the `noRobot`/`forceClass` annotation from the fifteen dental stations to other blocks.
- **Accredited proof.** Badges are self-asserted; competencies evidence readiness and are "not a licence, and not a certification issued by OSHA, NFPA, ANSI, a state board or a union." Depends on: a hall hosting the badge documents, practitioner sign-off on every station, and a body willing to recognise a mastery run as evidence.
- **More unions.** The programme headers already name some twenty unions and associations; the growth target is 33 stations per category. Depends on: the team-brief method, which has produced most of the corpus at three stations a commit, and the hall-side review that turns a station into evidence.

---

## 7. Questions and answers

Answered from the repository. Where the answer is "no" or "not yet", it is because the repository says so.

### From a union training director

**Is this a game or a training record?** Both, on purpose, in two separate layers. The game layer (XP, ranks, leaderboards, station badges) exists to motivate. The record layer (`records.js`) writes one immutable entry per attempt with a pass verdict under a stated rule, and the competency layer above it applies the mastery rule. A programme "can never show complete on stations that were only played."

**Can I run my own block?** Yes. A programme is an ordered list of existing stations, each with a reason, a union and a certification line, under the shared completion rule; the build fails if a programme names a station that does not exist. The Holodeck's lesson composer can also assemble one from a sentence.

**Will a hall accept the badge?** As it stands, a badge is self-asserted by a static page. Hosting the BadgeClass and Assertion URLs under your issuer is what turns "self-asserted" into "the issuing hall stands behind it" in the verifier. The ids are already laid out for that.

**Who says the procedures are right?** Today, the authors, checked by automation. `REVIEW.md` is the packet for a qualified practitioner in each trade to sign; the automated preview has passed on every section it covers, and the practitioner line is blank on all of them.

**What does a learner see if they fail?** The step debrief (which step, how long, how many corrections), the guide's one plain sentence on what happened and what wins next time, the check-in, and — on the Proof tab — the first reason the run did not count under the mastery rule.

**Can my instructor run a class?** On one machine or one mirrored screen, yes, with no server; on separate machines, with the relay on your room's network. Every console action lands on the learner's record.

**Does it cover my trade?** Seventeen categories today with between 4 and 33 stations each; the appendix and `catalog.json` list them. The stated plan is 33 per category.

### From a safety officer

**Is it a substitute for the training a standard requires?** No: "no station replaces the employer's own hazard assessment, permit system or the training a standard requires to be delivered by a qualified person" (compliance README).

**Are the clause numbers right?** Where the registry marks an entry verified (242 of 285), the authors are sure of the citation form. Where it marks one unverified (43), the claim is the body and the subject only, and the learner-facing UI shows a "citation unverified" tag.

**Can a learner pass by talking?** No. Voice, gamepad and keyboard navigate, focus and read back; "nothing here completes a step by speaking," and a checker fails the build if a voice command could.

**Is the AR glass I want to buy safety eyewear?** The device record tells you what the vendor states and marks anything unconfirmed as unverified; the guide says "a `safety.ansiZ87: true` in the registry is a vendor claim to verify, not a certificate." The three questions — eye protection rating, helmet mount through an approved slot, operational suitability — are yours to answer.

**Does a coached run look like an assessed one?** No. `hazardMode` is written on the attempt, and every instructor command is an `instructorAction` on the record.

**Does it teach last week's incident?** The incident replay adds one interruption to the station where it happened and never rewrites the procedure — "a drill that teaches the job as it was done wrong is worse than no drill."

### From an IT lead

**What do I have to host?** Static files over HTTPS. The SmartCiti.X bundle is a folder, not a single file, because stations lazy-load. Optionally an LRS endpoint, the LTI relay (Node, behind TLS), and the observer relay (Node, on the room's network).

**What does it phone home to?** One CDN fetch of three.js 0.160.0 and Google Fonts, both of which can be self-hosted. Nothing else leaves the browser unless you connect an LRS or embed the app in a host page that asked who the learner is.

**How is the learner identified?** By a launch context you supply — URL parameters or `postMessage` from the embedding page — accepted only when `learner_home` equals the sender's real origin. That is provenance, not authentication. For a verified launch, the LTI 1.3 relay verifies the platform's signed token and hands the context to the app.

**Where do records live?** In the learner's browser until exported or delivered to your LRS. There is no vendor database.

**Can I embed it in our LMS?** Yes, through the platform channel: identity in, `progress`/`record`/`credential` events out, to your origin only. The static catalog lets you index every station without loading the app.

**What is the CI, and what about accessibility procurement?** `node tools/check_all.mjs` (29 checkers) plus a freshness check on generated files, on every push touching `WebXR/` or `tools/`. Accessibility: a self-assessed WCAG 2.1 AA / Section 508 statement for the flat mode, non-conforming headset modes listed, no third-party audit.

**Is there an account system or sign-in?** No. That is host-side by design.

### From an investor

**What is actually built?** 225 stations, 24 programmes, 34 competencies, a shared engine, records and credentials, 33 device profiles, an instructor console, a verifier, a robot embodiment layer and 29 checkers, in 222 commits over about nine weeks.

**What is not built?** A sign-in, a homepage, any hosted badge issuer, any registered LTI deployment, any practitioner-signed station, any headset performance data, any live model behind the Holodeck or Orbis-Stable seams, any host-platform contract, any cohort store, any multi-user scene.

**Who are the customers?** The repository names none. Programme headers name the unions whose members the content is written for and the bodies whose standards it cites; that is content grounding, not a customer list.

**What is the moat?** The repository does not use the word. What it demonstrates is a method: briefs, checkers and an eval that let many teams add stations in parallel while holding a 95 corpus mean and a green gate.

**Why no server?** Because a hall can deploy a folder and a headset can load it over the hall's wifi. The one server that is required for a verified launch is small and checked.

**What is the biggest risk?** That the content is right by automation and not yet by a practitioner. The second is that the headset pass has not been run.

### From a student

**Do I need a headset?** No. The flat mode runs the same procedure, scores it the same way and writes the same record; the accessibility statement says a learner who cannot use a headset "is not on a lesser course."

**What if I get it wrong?** A wrong control costs 25 points and resets your combo; a hazard costs 50 and is an unsafe action. The guide says what happened and what to do next time, never blame. A repeat run is a variant: different hints, alarms and time, same procedure.

**Does reading the brief help?** Yes: the Prepared award and a 10% bonus on that run.

**Is my data sold?** Your records stay in your browser until you or your hall export them. The check-in answers are never exported at all.

**Can I use a controller or just a keyboard?** Either, plus voice for navigation. There are five keyboard presets including a one-handed one, and you can remap keys.

**What does a competency mean for me?** That you ran named stations under the mastery rule — two or more stars, no unsafe action, every interruption answered, inside 1.5× par — and the transcript shows every run behind it. It evidences readiness for the standard named; it is not the certification itself.

---

## 8. A letter to prospective investors

To whoever is reading this with a decision to make,

We have built a browser-based training network for union trades. On the day of writing it holds 225 stations across 17 categories and 24 programmes, each a real ordered procedure with real hazards, two interruptions and a reason on every step, citing standards from a registry of 285 entries. A learner opens a page, walks a dressed job site, works the job with their hands, gets interrupted the way a job interrupts you, and leaves with a record that exports as CSV, xAPI and Open Badges. An instructor can watch a class and step in. A competency layer applies one mastery rule that never bends. Twenty-nine checkers gate every commit, and the content ranks at a mean of 95 out of 100 on an eval we deliberately keep out of the gate so nobody writes to the metric.

What it proves is that the engine is deterministic and auditable, that the content can be built and held to a standard at scale by parallel teams working from short briefs, and that we would rather write "unverified" than guess. It does not yet prove that a practitioner in each trade agrees with every step: the review packet has an automated pass on every section and a human signature on none. It does not yet prove headset performance on real hardware: the instrument exists and the numbers do not. Badges are self-asserted until a hall hosts them. The one server we need for a verified launch has been proven against a stand-in platform and not registered with a real one.

Funding would buy, in the roadmap's order: the remaining dental careers stations and the first host-platform contract; a sign-in path through the LTI relay deployed behind TLS; the user-agent rules that need hardware in hand; then the practitioner review and the verification of the 43 unverified standards entries, instructor cohorts on a durable store, an authenticated relay for multi-user sessions, and headset pilots on the short list with the performance pass recorded; and after that, a robot partner with an arm, a hall that hosts its badges, and more unions at three stations a commit.

The risks are the ones above, stated plainly: content that is right by automation and not yet by a practitioner; hardware that has not been measured; credentials that verify structurally and not yet against a host; and a reliance on host platforms for identity, which is a design choice that keeps us serverless and also means we do not own the sign-in. We have no customers, partners or revenue to report and have not invented any here.

The SmartCiti.X team

---

## 9. Appendix

### A. Glossary

- **Station** — one procedure in one scene, authored as a `SIM_…` module with steps, hazards, interruptions and a `build()`.
- **Room** — a Trade Skills Simulator station; the room is the whole scene.
- **Flat station** — a station with no walkable scene (a sourced dossier and a knowledge check on the same engine); two exist.
- **Programme** — an ordered block of stations with a reason for each, a union, a certification line and the completion rule "every station has a passing attempt."
- **Step kinds** — select, sequence, find, gauge, hold, track, turn, drag.
- **Interruption** — an event that arrives mid-step on its own clock, must visibly change the scene, and counts as an unsafe action if missed.
- **Hazard** — a registered object (or, in a flat station, a conclusion) whose selection costs 50 and is recorded as an unsafe action.
- **Pass rule** — stars ≥ 2 and no unsafe action (`records.js`).
- **Mastery rule** — the stricter competency rule, quoted in E below.
- **Competency** — a named capability tied to standards and demonstrated on named stations under the mastery rule; programme or core.
- **Standards registry** — `tools/standards.json`; every standard once, with body, title, scope and verified/unverified source.
- **Checker** — a headless gate in `tools/check_*.mjs`; 29 run in `check_all.mjs`.
- **Eval** — `tools/eval_content.mjs`, a weighted ranking that never fails a build.
- **Device profile** — one of six run profiles (desktop, vr, hands, mr, seethrough, assisted) a device record maps to.
- **Launch context** — the learner identity a host supplies by URL or `postMessage`; not authentication.
- **LTI relay** — `tools/lti_relay.mjs`, the one server, verifying an LTI 1.3 launch.
- **Observer protocol** — the console's message envelope, version 2, over BroadcastChannel or the WebSocket relay.
- **Keep-out volume** — a sphere around a person in a scene that a robot end effector must not enter without a declared `forceClass`.
- **noRobot** — a step the robot never performs and hands to the clinician.

### B. File map

| Path | What it holds |
|---|---|
| `README.md` | The Unity prototype the project began as, and the map of the WebXR suite |
| `WebXR/portal/index.html` | Static map of the apps |
| `WebXR/smartcity/` | SmartCiti.X: `index.html`, `js/app.js`, `js/sims/*.js` (216 stations), `js/curricula.js` (24 programmes), `js/citykit.js`, `js/districts.js`, `js/interiors.js`, `js/apron.js`, `js/ambient.js`, `js/gamify.js`, generated `js/sims-meta.js` and `catalog.json`, `REVIEW.md`, `models/guide-worker.glb`, `dist/` |
| `WebXR/trades/` | Trade Skills Simulator, nine rooms, `README.md`, `dist/` |
| `WebXR/holodeck/` | Prompt-driven generator: `js/training.js`, `js/prompt-parser.js`, `js/minigolf.js` |
| `WebXR/instructor/` | Instructor console |
| `WebXR/verify/` | Credential verifier (`verify.js`) |
| `WebXR/shared/` | The engine (`game.js`) and the 24 shared layers named through section 3: records, competency, identity, LRS, platform, observer, devices, input, hands, a11y, voice, EI guide, weather, environment, kit, perf, robot, embodiment, lessons, incidents, variants, crew, Orbis-Stable |
| `WebXR/assets/env/` | Environment models, `README.md`, `ATTRIBUTION.md` |
| `WebXR/vendor/` | Vendored GLTFLoader (MIT) |
| `WebXR/ACCESSIBILITY.md` | The self-assessed conformance statement |
| `WebXR/index.html`, `WebXR/README.md` | The older Safety Campus companion page |
| `tools/check_all.mjs`, `tools/check_*.mjs` | The 29 checkers |
| `tools/eval_content.mjs`, `tools/eval-content.json` | The content eval and its snapshot |
| `tools/standards.json` | The standards registry |
| `tools/gen_*.mjs` | Generators: sims-meta, catalog, compliance matrix, wiki series page, review packet, competency programmes |
| `tools/bundle_webxr.py` | The single-file bundler |
| `tools/lti_relay.mjs`, `tools/relay_server.mjs` | The LTI relay and the observer relay |
| `tools/robot_train.mjs` | Headless robot runs and datasets |
| `tools/briefs/*.md` | The team briefs |
| `tools/review/` | Review-film scripts (the narration model files are not in the repository) |
| `docs/controls.md`, `docs/devices.md`, `docs/ei-guide.md`, `docs/instructor-console.md`, `docs/proof-of-training.md`, `docs/robot-training.md` | Feature guides |
| `docs/compliance/`, `docs/standards/` | The assurance README, the generated compliance matrix, the rendered registry |
| `docs/wiki/SmartCitiX-Training-Series.md` | The generated series page |
| `docs/screenshots/` | Spawn, console, proof, controls, devices, robot and avatar screenshots |
| `.github/workflows/webxr-checks.yml` | The CI gate |
| `Assets/`, `Packages/`, `ProjectSettings/`, `Tools/` | The Unity project |

### C. The checker list

In the order `tools/check_all.mjs` runs them, with each checker's own summary line from the run of 2026-09-23:

1. `check_parse.mjs` — All 497 shipped modules parse as JavaScript modules.
2. `check_imports.mjs` — All 279 modules call only what they declare or import.
3. `check_smartcity.mjs` — All 216 simulators pass.
4. `check_trades.mjs` — All rooms pass.
5. `check_holodeck.mjs` — All Holodeck checks pass.
6. `check_records.mjs` — All training-records checks pass.
7. `check_identity.mjs` — All identity checks pass.
8. `check_lrs.mjs` — All LRS checks pass.
9. `check_robot.mjs` — All robot-trainee checks pass.
10. `check_platform.mjs` — All platform checks pass.
11. `check_lti.mjs` — All LTI relay checks pass.
12. `check_orbis_stable.mjs` — All orbis-stable checks pass.
13. `check_verify.mjs` — All verifier and perf checks pass.
14. `check_observer.mjs` — All instructor-mode checks pass.
15. `check_a11y.mjs` — All accessibility checks pass.
16. `check_budget.mjs` — All 225 stations inside budget (320 meshes on the stage, 430 standalone). Fullest: welding 387/430, kitchen 385/430, salon 381/430.
17. `check_layout.mjs` — All 225 stations reachable.
18. `check_interrupts.mjs` — 442 interruptions across 221 procedures check out: the engine fires, times out and scores them, and all 442 visibly change the world.
19. `check_lessons.mjs` — All lesson checks pass.
20. `check_hands.mjs` — All hand-gesture checks pass.
21. `check_variants.mjs` — All variant checks pass.
22. `check_incidents.mjs` — All incident replay checks pass.
23. `check_crew.mjs` — All crew-role checks pass.
24. `check_devices.mjs` — All 33 device profiles check out: 6 profiles, 22 user-agent rules unshadowed, 11 URL-only; by class monocular 8, goggle 9, helmet 3, mr 2, vr 11.
25. `check_input.mjs` — All input checks pass: 5 keyboard presets × 13 actions, 15 gamepad buttons + 2 sticks by index with 3 vendor label sets, 26 voice commands, none of which completes a step.
26. `check_standards.mjs` — All standards checks pass.
27. `check_console.mjs` — All instructor-console checks pass.
28. `check_competency.mjs` — All competency checks pass. 34 competencies (24 programme, 10 core) · 213 distinct stations · 69 standards.
29. `check_models.mjs` — All 1 shipped model(s) check out: inside 2 MB, attributed with a redistributable licence, referenced by a module and copied into dist/.

Final line: **All 29 checkers pass.**

### D. The device profile table

From `WebXR/shared/devices.js` and `docs/devices.md`. "UA" means the browser is known to announce itself and a user-agent rule exists; "URL" means the device is reached only by `?device=<id>`. Safety statements are the vendor's, to be verified.

| `?device=` | Device | Class | Profile | Detected | Primary input | Notes from the record |
|---|---|---|---|---|---|---|
| `meta-quest-3` | Meta Quest 3 | vr | vr | UA | controllers | WebXR VR and AR; not PPE |
| `meta-quest-3s` | Meta Quest 3S | vr | vr | UA | controllers | the budget fleet headset |
| `meta-quest-pro` | Meta Quest Pro | vr | vr | UA | controllers | eye tracking not exposed to the browser |
| `meta-quest` | Meta Quest 2 / other Quest browsers | vr | vr | UA | controllers | generic Quest rule, below the specific ones |
| `pico-4-enterprise` | Pico 4 Enterprise | vr | vr | UA | controllers | exact model string unverified; pin a fleet by URL |
| `pico-4-ultra-enterprise` | Pico 4 Ultra Enterprise | vr | vr | UA | controllers | as above |
| `htc-vive-focus-3` | HTC Vive Focus 3 | vr | vr | URL | controllers | WebXR in the Vive browser unverified |
| `htc-vive-xr-elite` | HTC Vive XR Elite | vr | vr | URL | controllers | unverified |
| `lenovo-thinkreality-vrx` | Lenovo ThinkReality VRX | vr | vr | URL | controllers | unverified; MDM |
| `varjo-xr-4` | Varjo XR-4 | vr | vr | URL | controllers | PC-tethered; the page sees the PC's user agent |
| `apple-vision-pro` | Apple Vision Pro | vr | hands | URL | hands | Safari sends a desktop-Mac user agent |
| `hololens-2` | Microsoft HoloLens 2 Industrial Edition | mr | mr | UA | hands | hardhat adapter; hazardous-location class per vendor unverified |
| `magic-leap-2` | Magic Leap 2 | mr | seethrough | URL | controllers | move to `mr` once its browser's WebXR AR is verified |
| `vuzix-shield` | Vuzix Shield | goggle | seethrough | URL | voice | ANSI Z87.1 per vendor |
| `vuzix-blade-2` | Vuzix Blade 2 | goggle | seethrough | UA | touchpad | Z87.1 per vendor for the frames |
| `epson-bt-45cs` | Epson Moverio BT-45CS | goggle | seethrough | UA | touchpad | Z87.1-compatible shields per vendor; helmet mount |
| `epson-bt-45c` | Epson Moverio BT-45C | goggle | seethrough | UA | touchpad | shields per vendor; helmet mount |
| `epson-bt-40` | Epson Moverio BT-40 / BT-40S | goggle | seethrough | URL | touchpad | eye protection unverified |
| `lenovo-thinkreality-a3` | Lenovo ThinkReality A3 | goggle | seethrough | URL | mouse | tethered; rating unverified |
| `rokid-x-craft` | Rokid X-Craft | goggle | seethrough | UA | voice | ATEX/IECEx and IP66 per vendor; helmet mount |
| `thirdeye-x2` | ThirdEye X2 MR | goggle | seethrough | UA | voice | eye protection unverified |
| `univet-visionar` | Univet VisionAR | goggle | seethrough | UA | voice | EN166 and ANSI Z87.1+ per vendor |
| `realwear-navigator-500` | RealWear Navigator 500 | monocular | assisted | UA | voice | helmet clip; not eye protection |
| `realwear-navigator-520` | RealWear Navigator 520 | monocular | assisted | UA | voice | as above |
| `realwear-hmt-1z1` | RealWear HMT-1Z1 | monocular | assisted | UA | voice | Zone 1 / C1D1 per vendor |
| `vuzix-m400` | Vuzix M400 | monocular | assisted | UA | voice | M-Series helmet mount |
| `vuzix-m4000` | Vuzix M4000 | monocular | assisted | UA | voice | M-Series helmet mount |
| `vuzix-z100` | Vuzix Z100 | monocular | assisted | URL | buttons | no browser; the apps run on the phone |
| `iristick-g2` | Iristick.G2 | monocular | assisted | UA | voice | rating unverified |
| `google-glass-ee2` | Google Glass Enterprise Edition 2 | monocular | assisted | URL | touchpad | discontinued in 2023 |
| `xyz-reality-atom` | XYZ Reality Atom | helmet | mr | UA | buttons | no general browser; apps run beside it |
| `daqri-smart-helmet` | DAQRI Smart Helmet | helmet | mr | UA | buttons | legacy |
| `thirdeye-midas` | ThirdEye MIDAS | helmet | seethrough | UA | voice | the mask's own certification governs |

The six run profiles (`PROFILES`): desktop (pixel ratio ≤2, shadows, full weather, skyline, HUD 1.0, click); vr (as desktop, VR entry first, trigger); hands (HUD 1.1, targets 1.15, pinch); mr (pixel ratio 1, no shadows, light weather, no skyline, HUD 1.15, high contrast, AR entry, pinch); seethrough (pixel ratio 1, no weather or skyline, HUD 1.3, targets 1.2, black background, touchpad); assisted (pixel ratio 1, no weather or skyline, HUD 1.5, targets 1.3, dark background, say).

### E. The mastery rule

Quoted from `WebXR/shared/competency.js` (`MASTERY.text`, id `mastery-v1`):

> A run demonstrates mastery when it earns two or more stars, records zero unsafe actions, answers every interruption it was given, and finishes within 1.5 times the station's par time. One mastery run on enough of a competency's stations earns "demonstrated"; mastery runs on three different days earn "consistent". No other rule earns a competency.

The fields it reads: `stars` (≥ 2, `minStars`), `hazardHits` (0, `maxHazardHits`; a wrong or unanswered interruption increments it), `interrupts: { answered, wrong, missed }` (`answerEveryInterruption`, with `null` meaning nothing fired), and `seconds` against `parSeconds × 1.5` (`parMultiple`). Programme competencies require mastery on half their stations capped at six; core competencies name their number. "Consistent" is three or more different days, because "three runs in one sitting is one session, not consistency."
