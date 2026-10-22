# SILICA (`sil`, 9032) — ConstructionVR's drilling-dust study as a Holodeck station and eval

Loop 4 (robotics & enterprise Holodeck). The user's own Unity study `AGIFutureFoundation/constructionvr` (read-only
clone) ported to SmartCiti.X Holodeck: one station, one opt-in reaction-time eval in DATAWORKS' schema, and the
study's aggregate statistics.

Owns `WebXR/smartcity/js/sims/sil-concrete-drilling-and-silica-dust-cues.js`, the K-12 awareness version
`k12-sil-dust-you-cannot-see-at-a-building-site` (`tools/k12-data/sil-dust-you-cannot-see.json` → `gen_k12_station.mjs`),
`WebXR/shared/sil-reaction.js`, `tools/check_silica.mjs`, `docs/sources/constructionvr-study.md`.

## The study, as read from its scripts

- **Conditions.** ActiveDrilling (the participant holds a drill to each drilling point for 5 s while a hidden PM2.5
  value rises) and PassiveMoving (the value rises on a timer while the participant moves; no drilling).
- **Cue and response.** In Study mode the dust is hidden; a response is a left-index-trigger press logging
  `TimeToResponse` (seconds since the session started) and a press count. Later builds also log when the hidden value
  first reached 25 µg/m³ and when each drilling point started. Seed fixed at 123.
- **Port.** Two hazard cues in the station, one per condition: `shroud-hose-off` fires while the learner is drilling
  (active: their own dust), `dust-drift` while another crew's dust reaches them (passive). The 5 s anchor-hole hold
  matches the study's per-point hold.

## The station

`sil-concrete-drilling-and-silica-dust-cues` — Concrete Drilling & Silica Dust Cues (index 970). A LIUNA laborer drills
anchor holes for a handrail base plate and cores a pipe penetration inside a building core. 14 steps over 8 kinds,
4 hazards (blowing holes out with compressed air, dry sweeping, drilling with the shroud off, a loose respirator strap),
2 interruptions, 250 meshes, 28 interactables, 132 particle points (none move under reduced motion).
Sources: OSHA 29 CFR 1926.1153 Table 1 (handheld and stand-mounted drills: shroud + dust collector, HEPA vacuum for
holes; rig-mounted core drills: integrated water), the housekeeping limits and the written exposure control plan;
29 CFR 1926.103 (fit and seal checks via 1910.134); ANSI A10.9; NIOSH; LIUNA Training. Registered with
`tools/add_station.mjs`; in the Builders programme (and so in six packs); on the Lake Charles map's Tank Foundation
Pour site (`lcc-tank-foundation`, `np-data-lc-calcasieu-channel.js`).

## Cycles

1. Reason: the port needs the study's real design, not a guess; check = scripts read and per-condition aggregates computed in scratch with nothing finer printed. Observed: ActiveDrilling 37 responses, median 25.41 s (IQR 13.76–33.43); PassiveMoving 39, median 10.98 s (IQR 6.97–15.88); 12 session files (not 24 — the other 12 are Unity .meta files), three header layouts.
2. Reason: one station on the station brief, sourced from Table 1; check = `eval_content --station` ≥ 95 and check_smartcity. Observed: eval_content before — no drilling-silica station (the sibling saw station scores 96); after **97** (var 100, dec 95, exp 100, gnd 100, std 100 6/6 in scope, fbk 100, scn 100, org 48); check_smartcity first run crashed (`material.color.setHex` absent in the headless mock, and colours on shared kit materials would bleed) → swapped to `.visible` toggles → All 722 simulators pass.
3. Reason: programme, pack and a Louisiana construction site; check = gen_catalog / gen_packs and the registry section of check_silica. Observed: builders-trades (61 programmes, 783 entries resolved), 6 packs, `lcc-tank-foundation` (kind construction).
4. Reason: the reaction-time eval must reuse the engine's own cue timer and DATAWORKS' gate, never a new store; check = check_silica privacy section. Observed: no consent / demo / signed-out / K-12 / unknown → null; opted in → valid episode with a consent receipt and `info.interrupt.responseS` per cue; revoke deletes; no network code.
5. Reason: prove the eval measures what it claims; check = seeded scripted-agent runs plus a calibration agent that waits a known delay. Observed: 18/18 runs finish; the scripted agent answers in the tick a cue fires (median 0 s, both conditions — expected, it is not a person); injected 0.5/1.5/3/6 s read back exactly; a 13 s wait reads as missed (12 s window). check_silica 40 passed, 0 failed.
6. Reason: the station has to work under a mouse in the flat build, not only headless; check = `python3 tools/bundle_webxr.py`, serve on 9032, drive every step and answer both cues, screenshot spawn and each cue. Observed: FINISHED, 14 steps, both cues answered, 0 page errors — but the laborer figure stood in the spawn sightline, the neighbouring crew stood inside a mesh (check_layout ✗) and sat downwind of the learner, contradicting the drift cue, and the hose-off plume was too faint to read.
7. Reason: fix what the drive showed; check = check_layout, a re-drive and the screenshots. Observed: figures moved to clear spots (clear_spot), the grinding crew moved upwind by the open bay so the draught really carries its dust to the core, the cue's answer renamed the clear-air marker, a still grey column added over the hole when the hose pops (reads under reduced motion), particles larger; check_layout 0 ✗, re-drive FINISHED with 0 page errors, eval_content still 97.
8. Reason: a K-12 awareness version is cheap on the K-12 generator; check = eval_content ≥ 95 and check_k12. Observed: first 92 (one unregistered body named in K-12 scope, median why 233) → body reworded, whys lengthened → **95**; check_k12 first 3 ✗ (the core K-12 counts are fixed) → wired as a Louisiana lesson in `lk-la-lessons.js` anchored at `lcc-tank-foundation`, so it counts apart from the core → All K-12 checks pass; check_packs needed `node tools/export_unity.mjs` for the k12-science export → all pass.
9. Reason: nothing neighbouring regressed; check = the single checkers that read the catalog, packs, maps, budgets, K-12 and DATAWORKS. Observed: see "Checkers" below.

## Seams

- `silRecordRun(session, room, { store, signals })` → episode | null — mounted in `WebXR/smartcity/js/app.js` on finish
  for any station that declares `reactionEval`; inert unless `dxCollecting()`. Bundled after `dx-data.js`.
- `silCueTimes(room, interruptLog)`, `silSummary(cues)`, `silStats(xs)` — pure; COLEARN's tutor or ENTERPRISE-3's
  admin console can read a learner's own local cue times through these.
- A station opts in with `reactionEval: { study, cues: { <interrupt id>: "active" | "passive" } }`.
- `SIL_STUDY` — the study's aggregates only, flagged `usedForTraining: false`.

## Privacy and honesty

- No participant row, code, file name or timestamp is in the repository (check_silica greps for them); aggregates
  only, credited to the ConstructionVR user study.
- The study's consent covered research use, so its data train nothing here — no robot policy, no tutor, no model.
- The study's clock (session start → press) and the station's (cue → answer) are different quantities; the study's
  numbers are design context, never a norm the learner is scored against.

## Checkers

- `node tools/check_silica.mjs` — 41 passed, 0 failed.
- `node tools/check_smartcity.mjs` — All 723 simulators pass.
- `node tools/check_packs.mjs` — all 51914 checks pass (failed 1, then 3, before the rebundle and the Unity re-export).
- `node tools/check_unity_export.mjs` — up to date: 732 stations.
- `node tools/check_k12.mjs` — All K-12 checks pass.
- `node tools/check_dataworks.mjs` — 59 passed, 0 failed.
- `node tools/check_standards.mjs` — all standards checks pass.
- `node tools/check_budget.mjs` — all 732 stations inside budget.
- `node tools/check_parishes.mjs` — 62989 passed, 0 failed.
- `node tools/check_layout.mjs` — 0 failures (1 before cycle 7).
- `node tools/eval_content.mjs --station …` — drilling station 97, K-12 version 95.

## Left

- The K-12 version was checked headlessly (check_k12, check_smartcity), not driven in the browser.
- `eval_worlds` was not run (the station sits on an existing site; no world geometry changed).
- The study's instruction to participants is not in its scripts; if the study team publishes it, the cue wording here
  should be checked against it.
