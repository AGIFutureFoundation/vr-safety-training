# Compliance and assurance

What an enterprise training office needs to know before it runs SmartCiti.X, Trade Skills Simulator or the Holodeck with a workforce.

## What is taught, and where
[`compliance-matrix.md`](compliance-matrix.md) is generated from the station sources: every procedure with the standards it cites in the text a learner reads, and every standard with the procedures that carry it. Regenerate with `node tools/gen_compliance.mjs` after any station change; never edit it by hand. The matrix maps what is taught. It is not a certification of compliance with any standard, and no station replaces the employer's own hazard assessment, permit system or the training a standard requires to be delivered by a qualified person.

## How a procedure is assured before it ships
1. Twenty-three automated checkers (`node tools/check_all.mjs`): module parse and imports, every control reachable and crew figures clear of the work, mesh budget per headset frame, every interruption fires, times out, scores and visibly changes the scene, crew roles, incident replay, programme resolution, catalog freshness, accessibility.
2. A headless-browser drive of every step with every interruption answered, and a spawn screenshot a person looks at.
3. The graded content review (`node tools/eval_content.mjs`): variety of interaction, decision density, explanation depth, grounding in named bodies, feedback coverage, scene, originality. The corpus mean and every station's row are kept in `tools/eval-content.json`.

## Records
Attempts are recorded per learner with score, hazards struck, interruptions answered and time; they export as CSV and as xAPI statements to a configured Learning Record Store, and the LTI 1.3 launch relay carries learner identity from an LMS. Progress, ranks and badges are otherwise stored in the learner's browser only. See `WebXR/smartcity/README.md` for the records overlay, `WebXR/instructor/` for the instructor console.

## People, places and data
- **Real sites and people.** Stations are sited generically. The two flat briefing stations on Hunters Point carry sourced facts with their sources; nothing else names a real site, person or case. `tools/briefs/hp-edition-brief.md` sets the rules for the Hunters Point Edition, which is a training aid offered to the Marie Harrison Community Foundation and does not speak for it.
- **Consent.** Any procedure that touches a person's sample or data teaches informed consent (45 CFR 46) as a scored step and treats collecting without it as an unsafe action.
- **Environments and assets.** Only CC0, CC-BY or marketplace-licensed models with an attribution line go under `WebXR/assets/env/`; game rips are refused. Third-party code is vendored with its licence under `WebXR/vendor/`.
- **Accessibility.** The a11y checker enforces labelled controls and keyboard paths in the 2D chrome; AR requires a WebXR hit-test capable browser and the flat mode works everywhere.

## Standards families across the roster
OSHA 29 CFR 1910 (general industry) and 1926 (construction), 1915/1917/1918 (maritime), Cal/OSHA title 8, NFPA (70E, 70, 25, 96, 101, 1126, 1006), ANSI (Z359, A10, Z49.1, Z117.1), ASME B30, AWS D1, EPA and 40 CFR, 33 CFR and the IMO conventions for ballast and bunkering, the California Retail Food Code, the ABC Act and RBS programme, the Labor Code and Wage Orders for hospitality, CDC and ADA guidance for dental, 45 CFR 46 for biomonitoring, and the unions named on every station.
