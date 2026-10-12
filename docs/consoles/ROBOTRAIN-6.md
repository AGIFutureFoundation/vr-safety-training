# ROBOTRAIN-6: preference pairs that train something, corrections for the hardest gap (`rt6`, port 9095)

Loop 10 (SmartCiti.X Holodeck · Powered by AGI Corp). Base 43d3e3f6, the integration head of loops 3–9. This builds on COLEARN
(`col-learn.js`, `tools/col_eval.mjs`, `docs/evals/colearn.json`), AGENTGYM (`ag-feedback.js` preference pairs, `tools/ag_eval.mjs`),
ROBOEXPORT (`tools/rb_report.mjs`) and ROBOTRAIN-5 (the AMR hard variant). Every robot is simulated. Every pair, rater, demonstration
and correction label here is synthetic or scripted, and is labelled as such where it is written. No person was measured.

## What is here

1. **Preference pairs train a reward model** (`WebXR/shared/rt6-learn.js`). This closes the roadmap's Open item "preference
   ratings are recorded and paired; nothing trains on them yet".
   - **The model.** A Bradley–Terry reward model: logistic regression, with no intercept, on the difference of two runs' six
     trajectory features (`RT6_TRAJ_FEATURES`: finished, clean, unsafe-step rate, length, wait rate, progress). It is fitted by
     500 full-batch gradient steps from zero with an L2 penalty of 0.01, so the same pairs give the same weights byte for byte.
   - **The pairs.** 200 seeded synthetic pairs per task, 150 to fit and 50 held out. Each pair is two runs of one seed by the
     scripted stand-in at two drawn skills. A **synthetic rater** picks between them by Bradley–Terry noise. Its utility, written
     in `RT6_RATER`, prefers no unsafe step, then a finished run, then a shorter one. The pairs use AGENTGYM's pair shape, with
     reasons from `AG_RATING_REASONS`.
   - **A learner's own pairs.** They join the fit only through `rt6LocalPairs()`. It returns `[]` unless `dxCollecting()` is
     true, and it keeps only human episodes that carry an adult consent receipt. Revoke deletes the ratings. No person's pairs
     exist, so the count in this eval is 0; `check_colearn` proves the path with a test profile.
   - **How it is used.** The reward ranks the 40 demonstrations that COLEARN clones, and the top half is cloned. The share
     (`RT6_KEEP` = 0.5) was fixed before any held-out seed was run. A sweep over 0.25, 0.5 and 0.75 is reported beside it and
     was not chosen from.
2. **DAgger-style corrections for `rb-amr-fleet-routing#hard`** (`rt6Dagger`).
   - Round 0 is COLEARN's filtered clone. Each round rolls the current clone out on 20 training seeds (800,100 and up). Every
     state it visits is labelled with **the scripted expert's action** (rb-env's planner at skill 1; not a person's
     correction). The labelled states are added to the demonstrations, the clone is retrained, and it is scored on the 60
     held-out seeds. Five rounds.
   - `rt6Aliasing` measures how much of the expert's labelling the clone's features can express at all.
   - Then the same rounds were run once with an opt-in feature set, `COL_FEATURE_SETS["amr-path"]` in `col-learn.js`. It adds
     four route features: the first move of a shortest path around the shelves and the blocked cell, whether that cell holds a
     robot, and whether it enters a busy walkway. COLEARN's default features, models and hashes are unchanged.
3. **Agent baselines for the three hard variants** (`tools/ag_eval.mjs --scenarios`, `agEvaluateScenarios`). These are
   AGENTGYM's random and scripted-expert baselines on the gym scenario ids, on the station rows' seeds (1–3), with rb-env's
   pass rule. The word-overlap agents read a station step's text, and a gym observation has none, so they are listed as not
   applicable (`null`), never scored 0. The rows went into the robotics supplement, `docs/perf/agent-baselines-robotics.json`.
   Its 16 station rows are byte-identical to before.
4. **The lineage as a figure on the policy report** (`tools/rb_report.mjs` `rt6LineageSvg`, `docs/perf/robot-policies.html`).
   The chain is consent → dataset → policy → eval → deployment, counted from `exports/robotics/governance.json`: 0 learner
   consents, 6 synthetic sets, 6 k-NN clones, 12 measured evals, 6 simulated sites. It is two static inline SVGs, a row on
   wide screens and a column under 720 px, themed by the page's `--at-*` design variables. It has no script and no URL.
5. **A faster k-NN with the same neighbours** (`col-learn.js` `colNeighbours`). Rows that share a feature vector are grouped
   once per model, in a WeakMap beside the model and never in its JSON. A query measures one distance per group. The result is
   the k smallest rows by (distance, row index), exactly as in the scan over every row. `colearn.json` regenerated
   byte-identical.
6. **Checkers.**
   - `check_colearn` sections 11–12: a deterministic fit; the pair shape; the local pairs (before opt-in 0, opted in 1, K-12 0,
     after revoke 0); the three arms on 60 seeds; the DAgger rounds; the aliasing figures; the route-feature arm; no network,
     no model identifier and no import alias in `rt6-learn.js`.
   - `check_roboscenarios` row 10: each hard variant has a baseline row, re-measured live against the file.

## Evals (before → after)

| Measure | Before (43d3e3f6) | After | Source |
|---|---|---|---|
| Roadmap Open items on preference learning | 1 | **0** | `docs/wiki/Roadmap-and-Changelog.md`; `check_colearn` section 11 |
| Models trained on preference pairs | 0 | **1** (Bradley–Terry reward model) | `docs/evals/colearn.json` `preference` |
| Held-out pair accuracy, 50 pairs (chance 0.5) | none | AMR **0.61** (the rater's own ceiling 0.584) · AMR hard **0.60** (ceiling 0.651) | `colearn.json` `preference.scenarios[].accuracy` |
| AMR clone success, 60 held-out seeds: reward-filtered / rule-filtered / unfiltered | none / 0.817 / 0.600 | **0.483** / 0.817 / 0.600 | `colearn.json` `preference.scenarios[0]` |
| AMR hard, the same three arms | none / 0.050 / 0.117 | **0.050** / 0.050 / 0.117 | `colearn.json` `preference.scenarios[1]` |
| AMR hard gap to the expert, DAgger with the scripted expert's labels | 0.950 | **0.950 after 5 rounds** (success by round 0.05 → 0.117 → 0 → 0.05 → 0.183 → 0.05) | `colearn.json` `dagger.rounds` |
| Best agreement any policy over the clone's features could reach with the expert's labels on the visited states | not measured | **0.696** (20,525 rows on 100 feature vectors; 29 vectors with more than one expert label hold 19,343 rows) | `colearn.json` `dagger.aliasing` |
| AMR hard gap, the same rounds with four route features (opt-in) | 0.950 | **0.583** (success by round 0.15 → 0.233 → 0.35 → 0.133 → 0.4 → 0.417; ceiling 0.745) | `colearn.json` `dagger.pathFeatures` |
| Hard variants with an agent baseline | 0 | **3** (random 0/3, scripted expert 3/3 each; retrieval agents n/a) | `docs/perf/agent-baselines-robotics.json` `perScenario`; `check_roboscenarios` row 10 |
| Lineage on the policy report | a text line per card | **a figure** (5 nodes; 23,494 → 29,383 bytes) | `docs/perf/robot-policies.html` |
| `tools/col_eval.mjs`, same output (grouped k-NN) | 23.4 s wall, 21.7 s user | 15.2 s wall, 17.2 s user | `time node tools/col_eval.mjs --print` (loaded machine) |
| DAgger, 5 rounds × 20 rollouts | 74 s | **3.2 s**, identical numbers | scratch timing, same machine |
| `check_colearn` | 46 passed (ROBOTRAIN-5's last line) | **54 passed, 0 failed** | `node tools/check_colearn.mjs` |
| `check_roboscenarios` | 12 passed | **13 passed, 0 failed** | `node tools/check_roboscenarios.mjs` |

The three arms in full, on 60 held-out seeds (7001–7060). The demonstrations are the same 40 synthetic ones `colEvalScenario`
clones.

| Task | Arm | Demos cloned | Success | Clean | Mean steps |
|---|---|---|---|---|---|
| `rb-amr-fleet-routing` | unfiltered | 40 | 0.600 | 0.600 | 15.5 |
| | rule-filtered (clean passes) | 37 | **0.817** | 0.817 | 24.65 |
| | reward-filtered (top half) | 20 (all clean passes) | 0.483 | 0.483 | 47.783 |
| | reward sweep 0.25 / 0.75 | 10 / 30 | 0.45 / 0.55 | | |
| `rb-amr-fleet-routing#hard` | unfiltered | 40 | **0.117** | 0.933 | 107.783 |
| | rule-filtered | 32 | 0.050 | 0.900 | 113.05 |
| | reward-filtered (top half) | 20 (all clean passes) | 0.050 | 0.900 | 113.083 |
| | reward sweep 0.25 / 0.75 | 10 / 30 | 0 / 0 | 0.983 / 0.983 | |

The learned weights, in the order finished, clean, unsafe rate, length, wait rate, progress:
- AMR: 1.067, 1.067, −0.225, −0.327, −0.342, 0.661.
- AMR hard: 1.316, 1.316, −0.238, 0.002, 0.187, 0.644.

Read honestly:
- The reward model learns the rater's direction. Its held-out pair accuracy sits at the noisy rater's own ceiling.
- The reward ranks the clean passes first: all 20 kept demonstrations are clean passes. Among those it prefers short runs with
  few waits.
- Halving the data costs the k-NN clone more coverage than the ranking buys. On AMR, reward-filtered cloning (0.483) is below
  both rule-filtered (0.817) and unfiltered (0.600). No share in the sweep reaches the rule filter.
- On the hard variant every arm fails mostly by waiting until the step cap.
- **The preference loop now trains something. It did not beat the rule filter on these tasks.**

DAgger rounds on `rb-amr-fleet-routing#hard`. The labels are the scripted expert's (`RT6_DAGGER_LABELS`).

| Round | Expert-labelled states | Rows | Success (default features) | Clean | Success (+ route features) | Clean |
|---|---|---|---|---|---|---|
| 0 (COLEARN's filtered clone) | 0 | 1,291 | 0.050 | 0.900 | 0.150 | 0.967 |
| 1 | 2,295 / 2,193 | 4,675 / 4,466 | 0.117 | 0.850 | 0.233 | 0.983 |
| 2 | 4,496 / 3,955 | 9,028 / 7,308 | 0.000 | 1.000 | 0.350 | 0.650 |
| 3 | 6,896 / 5,506 | 15,004 / 10,910 | 0.050 | 0.967 | 0.133 | 0.917 |
| 4 | 9,296 / 7,282 | 18,783 / 14,380 | 0.183 | 0.783 | 0.400 | 0.900 |
| 5 | 11,293 / 8,602 | 21,816 / 16,839 | **0.050** | 1.000 | **0.417** | 0.900 |

Read honestly:
- With COLEARN's nine features, DAgger swings from round to round and ends where it started. The final round, not the best
  one, is the result: the gap stays 0.950.
- The aliasing figure says why. On the states the clone visits, the expert's choice depends on things those features do not
  see: the route around the pallet, the other robots and the reservation order. No function of the features can agree with the
  expert on more than 0.696 of the rows.
- The route features were written after that figure, from training states only, and measured once. They lift round 0 from
  0.05 to 0.15 and the last round to 0.417 (gap 0.583).
- The swings remain (0.35 → 0.133), and so does aliasing (ceiling 0.745). The expert's waits depend on the other robots, which
  no per-robot feature here encodes.
- Five rounds were declared and run. No round was picked.

## Cycles

1. Reason: preference pairs must train something. Check: held-out pair accuracy above chance, and clone success on 60 held-out
   seeds for three arms on AMR base and hard. → Act: `rt6-learn.js` (trajectory features, synthetic pairs and rater, the
   Bradley–Terry fit, the top-half filter fixed before running). → Observe: pair accuracy 0.61 and 0.60 (rater ceilings 0.584
   and 0.651). Base: reward 0.483, rule 0.817, unfiltered 0.600. Hard: 0.050, 0.050, 0.117. Kept as measured.
2. Reason: corrections for the hardest gap. Check: success per round on 60 held-out seeds. → Act: `rt6Dagger`, 5 rounds × 20
   rollouts, the expert's labels. → Observe: 0.05 → 0.117 → 0 → 0.05 → 0.183 → 0.05. No convergence. 74 s, too slow for
   `check_colearn`'s live re-run.
3. Reason: the k-NN scans every row, and AMR's features are discrete. Check: `colearn.json` byte-identical, plus timings. →
   Act: grouped neighbours with the same (distance, index) order. → Observe: byte-identical; `col_eval` 23.4 → 15.2 s; DAgger
   74 → 3.2 s with identical per-round numbers.
4. Reason: why DAgger swings. Check: label consistency over the aggregated states. → Act: `rt6Aliasing`. → Observe: 100 feature
   vectors, 29 of them ambiguous, holding 94% of the rows; ceiling 0.696. Then the results went through COLEARN's tooling:
   `col_eval` appends `preference` and `dagger` (the `colearn.json` diff is 294 insertions, 0 deletions) and `check_colearn`
   sections 11–12 → 53 passed, 0 failed. Committed d63438cd.
5. Reason: hard variants need an agent baseline. Check: a live re-measure in `check_roboscenarios`, with the station rows
   unchanged. → Act: `ag_eval --scenarios`. → Observe: the supplement +77 lines, 0 deletions; 3 of 3; `check_roboscenarios`
   13/0, `check_bridge` 139/139, `check_agentgym` 33/0. Committed ab39812b.
6. Reason: the lineage as a figure. Check: the report current and static, and a headless render with 0 errors. → Act:
   `rt6LineageSvg`. → Observe: the first render cut two labels at the box edge in the wide row. Shortened them. Then page
   errors 0, external requests 0, no horizontal scroll at 390 px in either scheme; `check_roboexport` 8/0. Committed 85773db1.
7. Reason: the aliasing figure points at the features. Check: the same declared rounds, run once, with route features. →
   Act: `COL_FEATURE_SETS["amr-path"]` (opt-in) and cached distance fields (same first move as a forward search). → Observe:
   0.15 → 0.417, gap 0.583, ceiling 0.745; COLEARN's rows unchanged (insertions plus one comma); 18.9 → 7.4 s with identical
   numbers; `check_colearn` 54/0. Committed baf414fe.
8. Reason: every neighbour still passes. Check: single checkers. → Observe: `check_imports` flagged a local `pick()` in
   `rt6-learn.js` (it collided with other modules' top-level names). Renamed it to `rt6Pick`; then all 1104 modules pass.
   Committed 8dca89db. The lines are under Checkers run.

## Checkers run (single checkers; last lines)

- `node tools/check_colearn.mjs`: 54 passed, 0 failed (61 s wall, 24.9 s user, on a machine shared with five consoles)
- `node tools/check_roboscenarios.mjs`: 13 passed, 0 failed
- `node tools/check_robotrain.mjs`: ok, 334 checks. The COLEARN provider is unchanged: 28/30 completed, the governor's verdict
  on 413/413 steps.
- `node tools/check_roboexport.mjs`: 8 passed, 0 failed. The export did not change; the report was regenerated for the figure.
- `node tools/check_agentgym.mjs`: 33 passed, 0 failed
- `node tools/check_bridge.mjs`: 139/139 checks, 0 failed
- `node tools/check_vbridge.mjs`: 18 passed, 0 failed
- `node tools/check_imports.mjs`: All 1104 modules call only what they declare or import.
- `eval_worlds` and `eval_content` were not run. This work adds no world subject and no station.

## Seams

- `WebXR/shared/rt6-learn.js`:
  - `rt6TrajFeatures(episode)`, `RT6_TRAJ_FEATURES`
  - `rt6SyntheticPairs(sc, { n, seed })` returns `{ pairs, episodes }` (AGENTGYM's pair shape plus `x`, `ceil`, `source`)
  - `rt6LocalPairs({ store, signals })` returns `Promise<pairs>`, `[]` unless collecting
  - `rt6FitReward(pairs)`, `rt6Reward(model, ep)`, `rt6PairAccuracy`, `rt6RaterCeiling`, `rt6RankDemos`
  - `rt6EvalPreference(sc, { localPairs })`
  - `rt6Dagger(sc, { rounds, rollouts, featureSet })`, `rt6Aliasing(sc, labelled, featureSet)`
  - Tools-only, like `ag-gym.js`: no page loads it, so it is in no bundle list.
- A provider on the page could rank a learner's takes with `rt6Reward` before `colTrain`. Not wired: this loop measured that
  the hard filter does not help.
- `col-learn.js`:
  - `colTrain(sc, demos, { featureSet })` and `colF(sc, featureSet)`, with `COL_FEATURE_SETS["amr-path"]`.
  - A model carries `featureSet` only when one was given, so default models, their JSON and their hashes are unchanged.
  - `colNeighbours` groups rows by feature vector, cached beside the model.
- `tools/ag_eval.mjs --scenarios <ids>` / `agEvaluateScenarios`. The supplement gains `scenarioConfig`, `scenarioBaselines` and
  `perScenario`; `tq_robotics` and `check_bridge` read `perStation`, which is unchanged.
- `tools/rb_report.mjs` `rt6LineageSvg(governance)`.
- `docs/evals/colearn.json` keys `preference`, `dagger` and `dagger.pathFeatures`.
- **WHITEPAPER / wiki.** These lines are edited in this commit, so the next rebuild from the whitepaper fragments should carry
  the same text:
  - `docs/wiki/Roadmap-and-Changelog.md`: the preference Open item moves to Built with its result; the hard-variant baselines
    and the policy-report lineage figure become Built; the fleet-routing Open item carries the correction rounds.
  - `Glossary.md` ("Preference pair"), `Robotics-Training.md` (lines 76 and 114) and `Risks-and-FAQ.md` (line 197): no longer
    say that nothing trains on the pairs.

## Left

- Reward-filtered cloning did not beat rule-filtered cloning on either AMR task: the k-NN needs coverage. Next to measure:
  weighting each row's vote by its demonstration's learned reward, instead of a hard filter.
- The pairs and the rater are synthetic. The fit shows the pipeline learns a preference it is given, not what people prefer.
  A learner's pairs today are AGENTGYM ratings of agent runs on stations; rating robot-game runs on the page is not built.
- The correction labels are the scripted expert's. A person's corrections would need a correction control on the pad, which
  is not built.
- The AMR hard gap is 0.583 with route features after 5 rounds, and 0.950 without. The remaining aliasing (ceiling 0.745) sits
  in the expert's waits, which depend on the other robots and the reservation order; per-robot features do not see them. More
  rounds were not run (5 were declared). The route features are opt-in and not COLEARN's default.
- The hard-variant agent baselines are random and the scripted expert only. No text-reading agent applies to a gym
  observation, and a non-privileged reactive agent for gym scenarios is not written.
- `col-learn.js` changed, but the dist bundles were not rebuilt. The coordinator's `python3 tools/bundle_webxr.py` carries it.
- `check_colearn`'s row in `docs/perf/checkers-baseline.json` (31.5 s, an older estimate) is untouched. It was measured here
  under load only (above). Re-measure it quiet.
- `guide-kb.js` was not regenerated for the wiki edits.
