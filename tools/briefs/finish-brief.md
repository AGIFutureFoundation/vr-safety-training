# Finish brief — the open stations, the Deep anchors and the port quays

Binds LOOM (console LOOM: three stations and the Deep anchors) and TIDE (console TIDE: the port quays). `station-brief.md`, `wave100-brief.md`, `console-brief.md` and `bayarea-brief.md`'s facts rule apply.

## LOOM
1. Three stations the last runs scoped but did not start, each 12–15 steps, at least 6 kinds, 4 hazards, 2 scene-changing interruptions, eval ≥ 92 with standards score 1, citations in registry form only:
   - `md-intimacy-and-conduct-coordination-briefing` (screen and media crafts): a respectful, non-explicit set briefing on consent, boundaries, the closed-set rule, the reporting channel and the right to stop; SAG-AFTRA and the production's own policy as named bodies; add it to `screen-and-media-crafts` in CURRICULA and its competency.
   - `ml-suspicious-package-protocol` (postal): isolate, do not handle, clear the area, notify per the facility's plan; generic only, no device details, no invented procedure numbers; add to `postal-and-mail-processing`.
   - `ml-retail-counter-deescalation` (postal): a counter customer escalating; distance, calm script, the supervisor and the facility's workplace-violence plan; siblings `till-drop-robbery.js`, `hc-workplace-violence-deescalation-at-the-desk.js`; add to `postal-and-mail-processing`; bump that competency's `require` to 4.
2. The Deep anchors: add every `cd-` and `me-` station id and their programme ids to the DEEP_SITES whose comments name them in `WebXR/shared/underwater-data.js` (and any further sites that fit: the pier pilings for wet welding, the kelp forest for the transect), then `node tools/gen_dive_quests.mjs` so each programme gets its opener and capstone dive. `check_underwater.mjs` and `check_dive_quests.mjs` must pass.

## TIDE
The estuary water body in `WebXR/shared/bayworld.js` / `bayworld-data.js` now covers the Port Container Terminal, the Port Rail Yard, the Port Hazmat Response Yard and the island ferry-landing clock, so they stand over water. Give the port a quay: reshape the water bodies (or add quay slabs with the `concreteFace`/`laneAsphalt` patterns) so every site and landmark position stands on ground or a quay, the berths and the marina stay on water, and the regatta courses stay on water. Extend `tools/check_bayworld.mjs`: every site and landmark stands on ground or a quay (not in water), every marina berth and regatta course point stays on water (reuse the water-above-ground test PALETTE added to `check_regatta.mjs`).

## Process (both)
Start with `git fetch origin claude/vr-ar-safety-training-wkwmve && git merge --ff-only FETCH_HEAD`. Keep your console file. Commit in steps; each commit message ends with the two trailer lines in your task. Regenerate (`gen_catalog`, `gen_bay_quests`, `gen_dive_quests`, `gen_compliance`, `gen_wiki`, `gen_home`, `gen_investor`, `bundle_webxr.py`; `SMARTCITIX_THREE` is not needed for the content export: `node tools/export_unity.mjs`) and gate with `node tools/check_all.mjs` (exact "All N checkers pass" line). Hand back within 40 minutes: ≤200 words, commit hashes, the check_all line, (LOOM) the three eval scores.
