# Pathway Edition — wojrc.org

A second, separate SmartCiti.X programme built around wojrc.org's own services as the sponsor's text states them: warehouse and Commercial Class A training, navigating and enrolling in a union construction apprenticeship, financial coaching, and a wellness resource centre. Where the Job Readiness Edition trains the procedures those services teach, the Pathway Edition trains the participant's own journey through them — the parts of that journey the Job Readiness Edition does not cover: choosing a track with a coach at intake, getting ready to apply, the job fair, a live day on each track, the enrolment paperwork, the first paycheck, and graduation with an alumni mentor.

This page follows `tools/briefs/wojrc-brief.md` exactly: the only facts about the organisation stated anywhere in this edition are the sponsor's own words, quoted once below, and the name of the person the sponsor says runs the programmes, stated with nothing added. Everything else on this page and in the eight new stations is a procedure cited to its own standard.

## What is sourced (quoted once, unchanged)

> Everyone who is willing to work hard deserves an opportunity to succeed. For the past 14 years, we have been helping low-income Bay Area residents' gain the skills and confidence they need to get and keep jobs, and build financial security that support themselves and their families.
>
> How We Help: We offer training for warehouse and Commercial A truck driver positions. We prepare you and help you navigate and enroll in union construction trades apprenticeship programs. We offer financial coaching to help build your credit score, reduce debt, and build savings.
>
> Pages: "TDL Pre-Apprenticeship Training", "Wellness Resource Center".

Nothing else about the organisation or its staff could be fetched from the environment this edition was written in. The organisation is referred to only by its domain, wojrc.org; the acronym is not expanded here, matching the Job Readiness Edition brief this one shares.

**Who runs the programmes:** Joyce Guy is named by the sponsor of this edition as the person who runs the programmes. That is the whole of what is sourced — no title, no biography, no quotation and no history are attached to the name, because none was supplied and none could be fetched.

## The eight new stations

Each covers a part of a participant's pathway the Job Readiness Edition's own procedures do not: choosing a track, getting ready to apply, meeting employers, trying a track for a day, the paperwork of enrolling, the first paycheck, and graduation. Every hazard, interruption and citation follows the same station brief as the rest of the platform — 12–16 steps across six or more step kinds, four hazards, two interruptions with a visible scene change, and citations reused exactly from `tools/standards.json`.

| Station | What it trains |
|---|---|
| `wp-intake-and-pathway-planning` | Intake and pathway planning with a coach: an honest self-assessment, an aptitude quiz, and the warehouse-or-Class-A track confirmed and signed. |
| `wp-mock-interview-and-resume` | A resume built section by section from a draft with real gaps, and a mock interview sat until posture, eye contact and the hardest question all hold steady. |
| `wp-employer-meet-and-greet` | A job-fair floor walked with a map and a plan: the right three tables found among the decoys, a pitch rehearsed, and a real conversation held with the apprenticeship coordinator. |
| `wp-warehouse-ride-along` | The warehouse track's first live day: PPE, a pre-trip check, and two driven legs of a pallet-jack route at walking pace with a supervisor and a forklift crossing. |
| `wp-permit-study-and-knowledge-test` | The Class A track's first milestone: the state CDL handbook studied honestly, a practice quiz held without guessing, and the knowledge test sat for the permit. |
| `wp-apprenticeship-enrollment-day` | The paperwork day: documents, the apprentice agreement, drug-test consent actually understood before it is signed, a short physical, and the coordinator's own checklist — every requirement stated only as "per the programme's requirements," nothing invented. |
| `wp-first-paycheck-coaching` | First-paycheck coaching at the wellness resource centre: direct deposit set up in order, a budget built for the real number, and a benefits election made before the enrollment window closes. |
| `wp-graduation-and-alumni-mentors` | Graduation day: the ceremony, the certificate, the alumni mentors found on the floor, and a real mentor relationship started with 30/60/90-day check-ins booked. |

## The full pathway (`wojrc-pathway-edition`)

The programme entry appended at the end of `CURRICULA` composes the eight stations above with the Job Readiness Edition's own 32 stations, grouped by the service each belongs to, so the whole pathway reads as one line from a coach's first question to a signed mentor commitment.

**Warehouse** — `forklift-dock`, `tdl-pallet-jack-and-racking`, `tdl-pick-pack-and-scan`, `tdl-trailer-loading-and-dock-plate`, `tdl-hazmat-labeling-and-segregation`, `tdl-lifting-and-ergonomics`.

**Commercial Class A** — `tdl-pretrip-inspection`, `tdl-air-brake-test`, `tdl-coupling-and-uncoupling`, `tdl-backing-and-docking`, `tdl-cargo-securement-and-hours`, `drive-city-route-and-turns`, `drive-freeway-merge-and-following-distance`, `drive-mountain-grade-and-engine-brake`, `drive-night-fog-and-rail-crossing`, `drive-backing-serpentine-and-alley-dock`, `drive-light-vehicle-fleet-and-forklift-course`.

**Apprenticeship navigation** — `apprenticeship-standards-reading`, `apprenticeship-application-and-test`, `jobsite-orientation-and-osha-10`, `union-hall-and-dispatch`, `first-period-evaluation`, `trades-lineage-briefing`.

**Financial coaching** — `credit-report-reading`, `debt-reduction-plan`, `pay-stub-and-withholding`, `budget-with-irregular-income`, `emergency-savings-and-predatory-lending`.

**Wellness** — `wellness-shift-work-sleep-and-stress`, `wellness-peer-support-conversation`, `wellness-substance-use-and-the-job`, `wellness-asking-for-help-and-resources`.

The matching competency, `wojrc-pathway-edition` in `WebXR/shared/competency.js`, ties all forty stations to `dol-apprenticeship-standards`, `osha-1910-178` and `cfpb-consumer-guidance`, with mastery of ten of the forty required.

## Standards and bodies cited by the new stations

Every citation below is reused exactly from `tools/standards.json` — no clause number, drug-test panel or physical standard was invented for this edition. `dol-apprenticeship-standards`, `osha-outreach-10`, `fmcsa-49-cfr-380-subpart-f`, `fmcsa-49-cfr-383`, `state-cdl-handbook`, `osha-1910-178`, `ansi-b56-1`, `niosh-lifting-equation`, `ansi-isea-107`, `hipaa-privacy-rule`, `osha-1910-151`, `osha-1910-22`, `osha-1910-133`, `cfpb-consumer-guidance`, `cfpb-truth-in-lending`, `irs-consumer-guidance`, `samhsa-trauma-informed`, `teamsters-training`, `ilwu-pma-training` and `seiu-training`. Anything the registry does not cover — the specifics of a drug-test panel, a physical exam's clinical standard, an individual employer's benefits plan — is stated only as "per the programme's requirements" or "per the employer's plan," matching the wave-100 and station briefs' rule against inventing a clause nobody is sure of.

## Hand-back: every sentence in these files that refers to the organisation

Per the brief's hand-back requirement, this is every sentence across the new files (the eight station modules, the `curricula.js` programme entry, and this page) that refers to wojrc.org, its sponsor, or the person named as running its programmes. None of them state a fact about the organisation beyond the sourced passage quoted above; each is a label, a cross-reference to this edition's own name, or a restatement of the "only the sponsor's own words" rule already established by the Job Readiness Edition.

- `curricula.js` — `name: "Pathway Edition — wojrc.org"`
- `curricula.js` — "The participant's own journey through the programmes wojrc.org describes, station by station: …"
- `curricula.js` — "Those eight stations are followed by the job-readiness edition's own procedures, grouped here by the service they belong to … so the whole pathway reads as one line from a coach's first question to a signed mentor commitment."
- `curricula.js` — "Only the sponsor's own words describe the organisation; everything else here is a procedure with its standard."
- `curricula.js` — station `forklift-dock`'s `why`: "Warehouse: the shared opener, where the forklift and the dock are where the training wojrc.org describes actually starts."
- `wp-intake-and-pathway-planning.js` — header comment: "SmartCiti.X~ Intake and Pathway Planning VR — Pathway Edition, wojrc.org."
- `wp-mock-interview-and-resume.js` — header comment: "SmartCiti.X~ Mock Interview and Resume VR — Pathway Edition, wojrc.org."
- `wp-employer-meet-and-greet.js` — header comment: "SmartCiti.X~ Employer Meet-and-Greet VR — Pathway Edition, wojrc.org."
- `wp-warehouse-ride-along.js` — header comment: "SmartCiti.X~ Warehouse Ride-Along Day VR — Pathway Edition, wojrc.org."
- `wp-permit-study-and-knowledge-test.js` — header comment: "SmartCiti.X~ Permit Study and Knowledge-Test Day VR — Pathway Edition, wojrc.org."
- `wp-apprenticeship-enrollment-day.js` — header comment: "SmartCiti.X~ Apprenticeship Enrollment Day VR — Pathway Edition, wojrc.org."
- `wp-first-paycheck-coaching.js` — header comment: "SmartCiti.X~ First-Paycheck Coaching VR — Pathway Edition, wojrc.org."
- `wp-graduation-and-alumni-mentors.js` — header comment: "SmartCiti.X~ Graduation and Alumni-Mentor Day VR — Pathway Edition, wojrc.org."
- This page — the sourced-text quotation and "Who runs the programmes" section above (the two sourced sentences already quoted in `trades-lineage-briefing.js` and the Job Readiness Edition's brief, restated here for this edition's own readers rather than added to).

_Generated by hand alongside `tools/gen_wiki.mjs`, which regenerates `docs/wiki/SmartCitiX-Training-Series.md` with this programme's own section from `WebXR/smartcity/catalog.json`; this page is the edition's standalone reference and is not overwritten by that generator._
