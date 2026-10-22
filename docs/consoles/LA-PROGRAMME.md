# LA-PROGRAMME — the Louisiana Development Training Programme (`lp`, port 9008)

Brief: `$SP/louisiana/wave-brief.md` (LA-PROGRAMME) under the Shared rules of `packs-brief.md` and the reactor loop of
`packs-brief-3.md`. Facts: `$SP/louisiana/la-facts.md` only (copied in the repo at `docs/sources/la-facts.md`). Base c0883a3.

## Plan
- `WebXR/shared/lp-programme-data.js` (pure data): nine tracks — the seven projects of the facts file, FastSites site
  readiness (the three example sites) and the growth cities (places only) — each with its verbatim figures and source, its
  fixed map and site ids (guarded), kinds of work quoted from the facts file → crafts (tools/unions.json) → stations and
  simulations; six role pathways × five levels; seven full-procedure simulations and their fixed places.
- `WebXR/shared/lp-programme.js` (functions, imports only competency.js): guard, resolve, pathways with capstones, matrix,
  DEAN templates with instructor guides, cohort set-up, PROJECTSIM registration.
- `tools/gen_la_programme.mjs` → `WebXR/louisiana/index.html` (design system, Home chip, Guide, cohort form) and
  `docs/louisiana-programme.md` (handbook with every instructor guide).
- `tools/check_la_programme.mjs` — the gate.

## Seams
- `lpTracks()`, `lpTrack(id)`, `lpGuardPlaces(track, lookup)`, `lpResolve(track, { stationIds, simIds, lookup })`,
  `lpPathways(pathwayId, opts)`, `lpMatrix(opts)`, `lpTemplates(opts)`, `lpSetUpCohort({ en, dn }, { orgName, pathwayId, level, seats, startDate })`,
  `lpSimPlaces(mapId, lookup)`, `lpRegisterSims({ psRegisterSims, lookup })`, `lpDeanModules(lookup)` — `WebXR/shared/lp-programme.js`.
- Parishes app (`WebXR/parishes/js/app.js`): `lpRegisterSims({ psRegisterSims, lookup: npParish })` — the simulations appear on
  PROJECTSIM's boards at their sites only once the map consoles' maps are merged (the guard needs no change after the merge).
- Map consoles: every map and site id comes from `$SP/louisiana/*-ids.md`; check_la_programme reads those files when present and
  fails if a programme id is not published, or if a merged map lacks a site the programme names.

## Cycles
1. Reason: one data module traces all nine tracks work type → craft → station → credential; check: every station resolves and all 30 pathway levels are earnable. Observed: 0 missing stations; 30/30 earnable (e.g. datacenter-ops entry → core-lockout-tagout 0 + 3 capstone; aviation-mro appr → aviation-maintenance-and-ground 5/4).
2. Reason: generator + checker prove facts, guards, matrix, pathways, sims, templates; check: `check_la_programme`. Observed: FAILED 13 of 1542 — CSS `100%` read as a percentage, the no-partnership text undefined (not re-exported), `hammond-downtown` missed by the ids regex, four `requires` naming non-gates, app mount and this file missing.
3. Reason: strip `<style>` from the scan, re-export the statement, widen the ids regex, point `requires` at gates, mount `lpRegisterSims` in the parishes app; check: `check_la_programme`. Observed: 1 of 1537 left (this Cycles section) → fixed by this file.
4. Reason: the page works in a browser (cohort form on org.js + dn-modules.js) at desktop and phone width; check: Chromium on port 9008, 0 page errors, 0 px overflow, a cohort created. Observed first: 0 errors, 0 px both widths, but the cohort failed — org.js accepts only registered programmes, not "louisiana-programme". Fix: the cohort takes the pathway's own competency programme (apprentice level first) → "Class code … module mod-lp-datacenter-ops-appr (10 lessons, required score 80) due 2026-11-10"; check_la_programme now sets up all 30 cohorts (1567 checks ok). Only 404s are the shared Guide's `backgrounds.json` probe.
5. Reason: the simulations reach the bundled parishes page without a name collision; check: `python3 tools/bundle_webxr.py parishes` + Chromium load of the bundle and the module page, 0 page errors. Observed: renamed the data helpers W/C/S → lpW/lpC/lpS (one shared scope); bundle wrote 147 modules; both pages load with 0 page errors; `check_imports` "All 1035 modules call only what they declare or import"; `check_projectsim` ok 1010/0. The rebuilt dist was not committed (the coordinator rebuilds at integration; the bundler list carries the two modules).
6. Reason: the catalog has no station for cryogenic-propellant awareness (Starbase "propellant production"); one new station fills it; check: `eval_content --station` ≥ 95 and `check_smartcity`. Observed first: eval 98, but check_smartcity 2 problems (a lateNote keyed by the step id, not the target hit id) → re-keyed → "All 713 simulators pass"; the Starbase gap closed, launch-support pathway gains the station.
7. Reason: the same for the other two gaps — gas storage well pad (Black Bayou) and marine vessel electrical (Saronic); check: eval ≥ 95 each, check_smartcity, check_la_programme. Observed: `lp-gas-storage-wellpad-awareness` 97, `lp-marine-vessel-electrical-safety` 96; "All 715 simulators pass"; check_la_programme ok 1576 checks, 223 matrix links, 0 gaps left, all 30 levels earnable. A browser drive of the stations was not possible: `tools/briefs/drive_one.mjs` times out on `#enter-flat` for existing stations too (stale harness); check_smartcity's headless run drives all three through their steps.

## New stations
- `lp-cryogenic-propellant-awareness` (eval 98) — support crew beside a cryogenic storage area; NFPA 55, OSHA HazCom/PPE/first aid, ANSI Z358.1.
- `lp-gas-storage-wellpad-awareness` (eval 97) — contractor crew on a gas storage well pad; OSHA PSM, lockout, hot work, PPE, NFPA 51B.
- `lp-marine-vessel-electrical-safety` (eval 96) — isolating a new-build vessel's switchboard with several sources; NFPA 70E, OSHA lockout, 1910.333, 1915.
