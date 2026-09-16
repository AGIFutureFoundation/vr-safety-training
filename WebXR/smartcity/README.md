# SmartCiti.X

AR/VR training simulators across ten trade-union categories. Twenty stations exist today,
each a real ordered procedure with real hazards, its own gamified rank ladder, and the real
union and certification a worker in that role would actually need — not a generic "safety
training" wrapper, a specific one per trade.

## The ten categories

| Category | Stations today |
|---|---|
| Energy & Power | Charge Point, Solar Deck, Line Truck |
| Mobility & Transit | Signal Cabinet, Flight Deck, Track Access |
| Water & Environmental | Valve Vault, Abatement Chamber |
| Connectivity & Telecom | Splice Node, Tower Climb |
| Building Systems & Facilities | Chiller Plant, Boiler Room, Elevator Pit |
| Construction & Structural Trades | Steel Erector, Crane Yard, Trench Box |
| Manufacturing & Automation | Robot Cell |
| Emergency Services | Triage Point |
| Maritime & Ports | Dock Crane |
| Entertainment & Live Events | Rigging Loft |

This is a growth taxonomy, not a fixed roster: the plan is 33 stations per category (330
total) — enough for every category to eventually cover a whole family of real, distinct
trades rather than one representative example. The 20 stations above were categorized by
consolidating the 13 ad-hoc `domain` values each sim already carried (Energy, Mobility,
Water, Connectivity, Aviation, Emergency Services, Manufacturing, Building Systems, Telecom,
Construction, Facilities, Environmental, Entertainment, Maritime) down into these 10; a new
sim declares both `domain` (its specific field) and `category` (which of the 10 it belongs
to) in its own module — see `js/sims/*.js` and `tools/gen_sims_meta.mjs`.

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

## Quality gate

`.github/workflows/webxr-checks.yml` runs on every push/PR touching `WebXR/` or `tools/`:
`node tools/check_all.mjs` (every headless checker — smartcity, trades, holodeck, records,
identity, orbis-stable — one line each) and a freshness check that regenerates `sims-meta.js`
and every `dist/` bundle and fails if the committed copies differ — a stale bundle is a
silent deploy of old code. Run the same command locally before pushing.

## Enterprise readiness — what is and isn't here

Done: deterministic assessment engine, real certification mapping per station, auditable
per-attempt records with standard exports written by all three apps, learner identity as a
launch context (URL or embedding page, origin-bound, with live record hand-back to the
host), accessibility basics (dialog semantics, live region, focus rings, reduced motion),
input escaping, a CI gate, and single-file/static deployment with no server dependency.

Not yet done, in the order it should happen: (1) real authentication behind the launch
context — an LTI 1.3 or SSO launch needs a server to verify the signed launch, which a static
page cannot do; (2) a live LRS endpoint behind the xAPI export instead of a file download;
(3) subject-matter review of every station by a qualified practitioner in that trade before
any record is treated as certification evidence; (4) a headset pass on Meta Quest for frame
rate, comfort and in-headset legibility; (5) the remaining stations toward 33 per category.

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
