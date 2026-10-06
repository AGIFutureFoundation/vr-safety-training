# COLEARN (`col`, port 9031) — humans, robots and agents learning from each other

Loop 4 (robotics & enterprise Holodeck). Base 949c0919. SmartCiti.X Holodeck · Powered by AGI Corp.

Builds on ROBOTICS (`rb-env.js`: gym-style reset/step/reward over four robot games), DATAWORKS (`dx-data.js`:
the consented episode schema, consent gate and local store) and the agents (`npc.js`, `guide.js`: deterministic,
on-device, no model call). One module, `WebXR/shared/col-learn.js`, one checker, `tools/check_colearn.mjs`.

## What each learner is

| Loop | Mechanism, plainly | What it is not |
|---|---|---|
| Human → robot | **Behaviour cloning** with a k-nearest-neighbour classifier (k = 5, inverse-distance vote) over 5–9 hand-written features per game. It copies the action type of the most similar demonstrated moments and the mean parameter they used (a move vector, a grip-force ratio, a stop-zone ratio). | Not reinforcement learning, not planning, no generalisation beyond the demonstrations. |
| Robot → human | **Replay**: the cloned policy plays Robot Cell Entry as a ghost on a schematic track; each frame shows its explanation. | Not a 3D animation of the robot rig. |
| Agent ↔ human | **UCB1 multi-armed bandit** over four hint styles (show, tell, ask, why), rewarded when the next attempt at that step is right, plus a Beta(1,1)-smoothed per-step error table that picks the step to re-teach first. Counts persist per profile on the device (`col-tutor-v1`). | Not a learner model of the person; it counts. |
| Agent ↔ robot | **Heuristic explanation**: the features of this moment that most separate the chosen action's demonstrations from the others', turned into sentences from a fixed phrase table, plus how many of the k nearest moments agree. | No language model is called; no text is generated. |
| AMR safety layer | An optional **reservation shield** (a rule): robots claim cells in id order; a robot whose next cell or swap is claimed waits. Reported separately from BC. | Not learnt. |

## Data rules (DATAWORKS stands)

- Demonstrations enter only through `colDemosFromEpisodes()`, which refuses anything `dxValidateEpisode()` rejects
  (a human episode without a consent receipt) and any human episode whose receipt lacks the adult attestation.
- The learner's own episodes are read from the local DX store only through `colLocalDemos()`, which returns nothing
  unless `dxCollecting()` is true: adult, signed in, not K-12, not the demo, opted in. Revoke deletes them (checked).
- A finished "Your turn" try goes to DATAWORKS only through `dxCaptureRollout()`, which returns before recording
  when the learner is not collecting.
- Tests and the shipped panel train on **synthetic** demonstrations: the scripted expert at skill 0.85 (it lapses:
  skips a test, cuts across the teammate's space, grips too hard) with action noise, written through
  `dxMakeEpisode({ source: "synthetic" })` and labelled "synthetic human stand-in" in provenance.
- No network code, no upload, no model call in `col-learn.js` (checked).

## Eval (before → after)

Policy success on 60 held-out seeds (7001–7060; demonstrations use seeds 100004–100043), 40 synthetic
demonstrations per game. "Before" is the state at base: no learned policy, only the random floor and the scripted
expert. Success = finished with every safe practice kept.

| Game | Random | BC, all demos (cycle 2) | BC, clean passes only (after) | Scripted expert | Gap to expert |
|---|---|---|---|---|---|
| Robot Cell Entry | 0.00 | 1.00 | **1.00** (24/40 demos kept) | 1.00 | 0.000 |
| Cobot Safety-Zone Setup | 0.05 | 1.00 | **1.00** (39/40) | 1.00 | 0.000 |
| Teleop Pick-and-Place | 0.00 | 0.00 | **0.967** (19/40) | 0.983 | 0.016 |
| AMR Fleet Routing | 0.00 | 0.45 → 0.60 with cycle-4 features | **0.817** (37/40); 0.867 with the reservation shield | 1.00 | 0.183 |

Tutor, simulated learners (300, paired: each learner replayed with the same random stream under both tutors).
The learner model is ours (three learner types, each helped most by a different hint style; harder steps are the
e-stop test, lockout and verify). Steps to pass = step attempts until one run with no mistake. Means with 95%
normal intervals; gain = static − adaptive (positive: adaptive needed fewer).

| Population | Static steps | Adaptive steps | Gain in steps | Static mistakes | Adaptive mistakes | Gain in mistakes | Hints (static / adaptive) |
|---|---|---|---|---|---|---|---|
| Mixed (three types) | 64.58 [60.45, 68.71] | 59.90 [56.41, 63.38] | **4.68 [0.25, 9.11]** | 10.41 [9.67, 11.15] | 9.03 [8.43, 9.63] | **1.38 [0.66, 2.10]** | 10.4 / 12.4 |
| "Tell" best for all | 54.51 [51.43, 57.60] | 58.35 [54.88, 61.82] | **−3.84 [−7.64, −0.03]** | — | — | −0.80 [−1.39, −0.22] | — |

Read honestly: the adaptive tutor helps in this model only when learners differ in which hint style works; when the
static hint is already the best for everyone, the bandit's exploration costs steps. The adaptive tutor also gives
about two more hints per learner (the review hint). These are simulation results, not measurements of people.

## Cycles

1. Reason: a learned policy means nothing without a floor and a ceiling; check = random and expert success on held-out seeds → Act: `colRandomPolicy`, `colEvalPolicy`, `colHeldOut` → Observe (before): random 0 / 0.05 / 0 / 0, expert 1 / 1 / 0.983 / 1 (cell, cobot, teleop, AMR).
2. Reason: clone the synthetic "human" demonstrations as they are; check = BC success → Act: k-NN BC over per-game features, demos through `dxMakeEpisode` → `colDemosFromEpisodes` → Observe: cell 1, cobot 1, teleop 0, AMR 0.45; teleop eval took 17.9 s.
3. Reason: cloning lapses copies the lapses (over-force grips drag the mean grip ratio; corner cuts) — clone clean passes only; check = teleop and AMR success → Act: `onlySuccessful` (filtered BC) and a top-k insertion search instead of a full sort → Observe: teleop 0 → 0.967, AMR 0.45 → 0.667, cell/cobot stay 1; teleop eval 17.9 s → 0.5 s.
4. Reason: AMR failures were 8 yield-missed, 8 truncated, 4 conflicts; one "walkway ahead" feature could not tell east from west → Act: directional walkway features (weight 4); an optional reservation shield, named as a rule → Observe: AMR 0.667 → 0.817 (left: 4 conflict, 7 truncated); with the shield 0.867 (left: 8 truncated, 0 conflicts).
5. Reason: the explanation must read right in the ghost; check = sample frames per game → Act: per-feature thresholds, third-person phrases (it said "you" for the robot and "bin side" at the fixture) → Observe: 94 ghost frames, every reason from the fixed phrase table.
6. Reason: the tutor's gain must be measured against static hints with intervals, and its limit shown; check = paired simulation → Act: `colTutorSim` (mixed and "tell-best" populations) → Observe: mixed gain 1.38 [0.66, 2.10] mistakes, 4.68 [0.25, 9.11] steps; tell-best −3.84 [−7.64, −0.03] steps (kept as the honest limit).
7. Reason: prove it as one checker and in the real page; check = check_colearn, the parishes bundle, a headless smoke run → Act: `tools/check_colearn.mjs`, bundle list, parishes mount → Observe: check_colearn 37 passed, 0 failed (6.4 s); bundle 175 modules; on the built page the panel mounts in `#menu-drills`, trains in 30 ms, a wrong first move gets a "show" hint with the robot's explanation, a scripted try ends "Clean pass", tutor counts saved, no page errors, no new external request.
8. Reason: nothing next door regressed; check = neighbours' single checkers → Observe: check_robotics 18 passed, 0 failed; check_dataworks 59/0; check_enterprise "All organisation-layer checks pass" (GT_PROFILE_KEYS grew by one); check_interface 21/0.
9. Reason: the per-step error table should change what the learner sees, and every quoted figure should trace to a file; check = smoke + byte-for-byte eval file → Act: "Review first" preview of the most-missed step when "Your turn" opens; `tools/col_eval.mjs` writes `docs/evals/colearn.json`, the checker compares it with a live run and reuses it (one eval pass, not two) → Observe: smoke "Review first: How do you know the e-stop works before you rely on it?" (bandit picked "ask"), no page errors; check_colearn 39 passed, 0 failed in 3.0 s.

## Seams

- `colSyntheticDemos(sc, { n, seed, skill, noise })`, `colDemosFromEpisodes(episodes, sc)`, `colLocalDemos(sc, { store, signals })`.
- `colTrain(sc, demos, { k, seed, onlySuccessful, maxPoints })` → plain-JSON model; `colPolicy(model, { shield })`; `colExplain(model, obs, robot?)`; `colGhost(model, { seed })`.
- `docs/evals/colearn.json` (written by `node tools/col_eval.mjs`, deterministic, checked against a live run): every figure in the eval tables above.
- `colEvalScenario(sc, opts)` / `colEvalPolicy` / `colRandomPolicy` / `colHeldOut` — ENTERPRISE-3's lineage (dataset id → policy id → eval) can record `modelHash` and the eval object; PITCHREEL can capture the panel (`#col-colearn` in the drills menu; `window.__parishTest.colearn.watch()`).
- `colTutor({ state, storage })` (`hint`, `record`, `nextReview`, `save`), `colTutorForget()`, `colTutorSim(opts)`, `COL_TUTOR_STEPS`, `COL_HINT_STYLES`.
- `colMountCoLearn(el, { reducedMotion, capture })` — mounted in the parishes app (drills menu) after ROBOTICS' sites.
- `col-tutor-v1` added to `GT_PROFILE_KEYS` (per profile, local); `col-learn.js` added to the parishes bundle after `dx-world.js`.

## Left

- The station-wrapper scenarios (`rb-station-*`) need the full SmartCiti.X suite; BC over human station episodes
  (DATAWORKS `kind: "station"`) is the next step — the feature table would come from `robot.js observe()`.
- AMR: 7–8 of 60 held-out seeds still end truncated (robots waiting on each other); a per-robot BC cannot coordinate.
- The ghost is a schematic track, not the 3D rig at a robot site; mounting the replay on `rb-world.js`' cell rig is next.
- The tutor runs on the cell-entry procedure only; other stations' steps would need their hint table.
- No real learner has been measured; every tutor number above is from the simulated learner model.
