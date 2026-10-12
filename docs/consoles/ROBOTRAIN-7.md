# ROBOTRAIN-7: the robot-learning roadmap, next (`rt7`, port 9113)

Loop 10, round 3 (SmartCiti.X Holodeck · Powered by AGI Corp). Base 41e41366, the integration head (loops 3–9, loop 10
rounds 1 and 2). This builds on ROBOTRAIN-6 (`rt6-learn.js`), COLEARN (`col-learn.js`, `tools/col_eval.mjs`,
`docs/evals/colearn.json`), AGENTGYM (`ag-feedback.js`, `tools/ag_eval.mjs`) and ROBOTICS' gym (`rb-env.js`). Every robot is
simulated. Every pair, rater, demonstration and correction label here is synthetic or scripted, and says so where it is
written. No person was measured.

## Declared before running (written 13:17 UTC, before any held-out seed was run for these items)

Held-out seeds are 7001–7060, as COLEARN's. Nothing below was chosen after seeing them.

**Item 1, a per-step reward.**
- A step window is the step and the next two (W = 3). Its features, in this order: `broke` (share of the window's steps that
  broke a safe-practice rule), `waitRate` (share of the robots' decisions that were a wait), `progress` (the robots' summed
  Manhattan distance to their drop-offs at the window's start minus at its end, over W × the robots still moving; in −1..1).
- A synthetic window rater (ours, not measured): utility = −4·(any rule broken in the window) + 1·progress; a Bradley–Terry
  choice at temperature 0.5. Waits are not penalised by the rater.
- Pairs: 200 per task, one window from each of the two runs of ROBOTRAIN-6's synthetic pair i (same seeds, start drawn by a
  seeded generator); 150 to fit, 50 held out. Fit: `rt6FitReward` unchanged (L2 0.01, 500 full-batch steps, lr 0.5).
- The reward of step t is the model's reward of the window starting at t.
- **Drop rule:** drop step t of any demonstration when the model's own probability that its window beats the median window
  (the median step reward over all 40 demonstrations) is below **0.25**. Every other step of every demonstration, passing or
  failing, is kept and cloned with COLEARN's k-NN (no run-level filter). Thresholds 0.1 and 0.5 are reported beside it as a
  sweep and are not chosen from.
- Measured once on AMR base and hard, beside ROBOTRAIN-6's arms.

**Item 2, the other robots in view.**
- Feature set `amr-robots` (opt-in): `amr-path`'s 13 features plus six: `holderEarlier` (a robot holds the route's next cell
  and moves earlier in the order), `holderLater` (it moves later), `holderParked` (that robot has delivered and stays), `order`
  (this robot's place among the robots still moving, 0 first to 1 last), `detourE` and `detourS` (the first move of a shortest
  path around shelves, the pallet and every other robot's cell). Weights 4 each, as `amr-path`'s.
- First the aliasing ceiling, on training states only: `rt6Aliasing` over the labelled states that the `amr-path` rounds
  aggregate (training seeds 800,100–800,519), for `amr-path` and `amr-robots` on the same states.
- Then 5 rounds × 20 rollouts, run once. The result is the final round (round 5), whatever it is. The AMR hard gap is the
  expert's success minus round 5's.

**Item 2, ablation (declared 13:36 UTC, after the `amr-robots` result above was seen).** The detour move in `amr-robots` is a
shortest path around the other robots, close to what the scripted expert computes. To show how much of the gain it carries:
`amr-holders` = `amr-path` plus only the four holder and order features (no detour move). Its aliasing ceiling on the same
`amr-path` training states first, then the same 5 rounds × 20 rollouts, run once. It is reported beside the declared result
and does not replace it.

**Item 4, a non-privileged reactive agent.** Written and tried on training seeds 101–130 only, then measured once on the
supplement's seeds 1–3. Its rules read only a declared list of observation fields (the safety fields plus the task's own
position and goal); no search, no planner.

## What is here

1. **A per-step reward** (`WebXR/shared/rt7-learn.js` `rt7EvalStepReward`). This is the same Bradley–Terry fit as
   ROBOTRAIN-6's (`rt6FitReward`, unchanged), but on 3-step windows instead of whole runs. The features are a rule broken,
   waits and progress. A synthetic window rater prefers the window with no rule broken. Each step gets the reward of the
   window it starts. Only the steps under the declared threshold are dropped. Every other step of every demonstration,
   passing or failing, is cloned with COLEARN's k-NN. The result is a new key, `stepReward`, beside the four arms in
   `preference.scenarios[]`.
2. **The other robots in view** (`col-learn.js` `COL_FEATURE_SETS["amr-robots"]`, opt-in). This is `amr-path`'s 13 features
   plus six more:
   - who holds the route's next cell, and whether that robot moves earlier or later in the move order;
   - whether that robot has delivered and stays;
   - this robot's place in the order;
   - the first move of a shortest path around every other robot's cell.

   The aliasing ceiling was measured first, on training states only (`rt6Dagger`'s new opt-in `aliasingSets`, measured on
   the `amr-path` rounds' own labelled states). Then the declared rounds ran once (`dagger.robotFeatures`). An ablation,
   declared before it ran, keeps only the holder and order features (`amr-holders`, `dagger.holderFeatures`).
3. **Rate robot runs on the page** (`rt-teleop.js`). The teleop pad in the parishes drills menu gets "Rate two robot runs".
   The trained policy (the learner's takes through VBRIDGE's provider, otherwise 30 synthetic demonstrations) runs the pad's
   task on two seeds (`rt7RobotRun`), and each run shows a thumbs up and a thumbs down.
   - The thumbs are enabled only while `dxCollecting()` is true. They store only through AGENTGYM's `agRate`: adult opt-in,
     never K-12, demo or signed-out, local only.
   - `rt6LocalPairs` turns the ratings into pairs, but only while collecting. Revoke deletes them.
   - `ag-feedback.js` joins the parishes bundle before `rt-teleop.js`.
   - `tools/drive_rt7_ratings.mjs` is the page-level proof on the built page.
4. **A non-privileged reactive agent** (`rt7ReactivePolicy`).
   - Fixed rules over a declared field list, `RT7_REACTIVE_FIELDS`: the safety fields plus the task's own position and goal.
     The observation is cut down to that list before any rule runs.
   - No search, no planner and no learning. The AMR rules know the aisle layout, the same shelf cells COLEARN's features
     use, and keep one bit per robot: which way it stepped aside around the pallet.
   - It is the third baseline in `ag_eval --scenarios`, between random and the scripted expert.

## Evals (before → after)

| Measure | Before (41e41366) | After | Source |
|---|---|---|---|
| AMR clone success, 60 held-out seeds: per-step-reward clone (declared rule) against the rule filter | none; rule filter 0.817, unfiltered 0.600, whole-run reward filter 0.483, weighted votes 0.600 | **0.550** (3 of 560 steps dropped) | `docs/evals/colearn.json` `preference.scenarios[0].stepReward` |
| AMR hard, the same | none; 0.050 / 0.117 / 0.050 / 0.067 | **0.017** (18 of 839 steps dropped) | `preference.scenarios[1].stepReward` |
| Held-out window-pair accuracy, 50 pairs (chance 0.5) | none | AMR **0.66** (rater ceiling 0.65) · AMR hard **0.72** (ceiling 0.671) | `stepReward.accuracy` |
| Aliasing ceiling on the `amr-path` rounds' 15,548 labelled training rows | 0.745 (`amr-path`) | **0.959** (`amr-robots`; 6 of 260 vectors ambiguous) · 0.796 (`amr-holders`) | `dagger.pathFeatures.aliasingOnTheseStates` |
| **AMR hard gap after the declared 5 rounds** | **0.583** (`amr-path`, round 5 0.417) | **0.017** (`amr-robots`, round 5 **0.983**; expert 1.000) | `dagger.robotFeatures.rounds` |
| The same rounds, holder and order features only (ablation, declared first) | — | 0.517 (gap 0.483) | `dagger.holderFeatures.rounds` |
| Robot-run ratings collected only under consent | not built | an opted-in adult: **2 ratings → 1 pair**. Refused or empty: before opt-in 0, K-12 0, demo 0, signed-out 0, after revoke 0 | `check_colearn` section 11; `node tools/drive_rt7_ratings.mjs 9113` |
| The ratings drive on the built page | not built | page errors **0**, external requests **0** (98 s) | `tools/drive_rt7_ratings.mjs` |
| Hard variants with a third baseline | 0 | **3** (reactive: drilling 3/3, port 3/3, AMR 1/3) | `docs/perf/agent-baselines-robotics.json` `perScenario[].reactive`; `check_roboscenarios` row 10 |
| `check_colearn` | 55 passed, 0 failed (ROBOTRAIN-6's last line) | **61 passed, 0 failed** | `node tools/check_colearn.mjs` |
| `check_roboscenarios` | 13 passed (row 10: random and expert) | **13 passed, 0 failed** (row 10 re-measures random, reactive and expert live) | `node tools/check_roboscenarios.mjs` |

Notes on the evals:
- **Budgets.** No scene, mesh, light, texture or world-bundle geometry changed. The page change is DOM: one button and a
  rating box in the drills menu. The parishes bundle gains `ag-feedback.js` (5,124 bytes of source) and about 5.9 KB of
  `rt-teleop.js` source. `check_robotrain` reads 207/204/210/218 meshes per robot site, as before.
- **Bytes.** `colearn.json` is +332 lines with 0 deletions against base. Every row above `preference` is byte-identical,
  and so are ROBOTRAIN-6's four arms and its two DAgger runs. `agent-baselines-robotics.json` is +22 lines with 0 deletions,
  and its 16 station rows are unchanged.

### The per-step reward in full (60 held-out seeds, 7001–7060; the same 40 synthetic demonstrations)

| Task | Rule | Steps dropped | Rule-broken steps dropped | Rows | Success | Clean | Mean steps |
|---|---|---|---|---|---|---|---|
| `rb-amr-fleet-routing` | **declared, P < 0.25** | 3 of 560 | 2 of 4 | 1,290 | **0.550** | 0.550 | 59.367 |
| | sweep P < 0.1 | 0 | 0 | 1,294 | 0.600 | 0.600 | 15.5 |
| | sweep P < 0.5 | 183 | | 944 | 0.917 | 0.917 | 14.1 |
| `rb-amr-fleet-routing#hard` | **declared, P < 0.25** | 18 of 839 | 2 of 9 | 1,620 | **0.017** | 0.867 | 118.283 |
| | sweep P < 0.1 | 0 | 0 | 1,651 | 0.117 | 0.933 | 107.783 |
| | sweep P < 0.5 | 419 | | 816 | 0.083 | 0.767 | 111.317 |

The learned window weights, in the order broke, waitRate, progress: AMR −0.812, 0.275, 1.518; AMR hard −1.162, −0.692, 0.956.

Read honestly:
- The declared rule is the result: 0.550 on AMR and 0.017 on AMR hard. Both are below the rule filter (0.817, 0.050) and the
  unfiltered clone (0.600, 0.117).
- The rule dropped very few steps, and only half the rule-broken ones. Windows with a broken rule are rare in the synthetic
  window pairs (a few in 150), so the fitted penalty for a broken rule stayed small next to progress. The reward mostly
  scores progress.
- At P < 0.5 the sweep reached 0.917 on AMR, above the rule filter, but 0.083 on AMR hard. That threshold was not declared,
  and it was seen on the held-out seeds. **It is not a result.** Confirming it needs a fresh held-out range declared in
  advance (see Left).

### DAgger rounds on `rb-amr-fleet-routing#hard` with the other robots in view (the labels are the scripted expert's)

| Round | `amr-robots`: labelled states | Rows | Success | Clean | Mean steps | `amr-holders` (ablation): success | Clean |
|---|---|---|---|---|---|---|---|
| 0 (COLEARN's filtered demos, the new features) | 0 | 1,291 | 0.850 | 0.850 | 34.367 | 0.217 | 0.967 |
| 1 | 686 | 2,763 | 0.917 | 0.917 | 23.567 | 0.783 | 0.900 |
| 2 | 1,167 | 3,798 | 0.917 | 0.933 | 23.667 | 0.467 | 0.983 |
| 3 | 1,767 | 5,006 | 0.900 | 0.900 | 23.750 | 0.600 | 0.900 |
| 4 | 2,147 | 5,840 | 0.917 | 0.917 | 22.017 | 0.250 | 1.000 |
| 5 | 2,745 | 7,131 | **0.983** | 0.983 | 20.017 | **0.517** | 0.933 |

Read honestly:
- The final round is the result, as declared. With `amr-robots` the AMR hard gap goes from 0.583 to 0.017, and the mean steps
  (20.0) come close to the expert's (19.5).
- On the states its own rounds visit, the ceiling is 0.978 (23 of 298 vectors ambiguous).
- **Most of the gain is the detour move.** It is a hand-written shortest path around the other robots, and that is close to
  what the scripted expert computes. Without it (`amr-holders`) the same rounds swing between 0.25 and 0.78 and end at 0.517.
  The clone is given the planner's answer as a feature; it does not learn to plan.
- The waits that are still learnt come from the reservation order and the walkways, which the holder and order features
  describe.
- The features are opt-in, and COLEARN's default clone is unchanged (0.05 on AMR hard).

### The reactive agent

| Scenario | Training seeds 101–130 (one try, before seeds 1–3) | Seeds 1–3 (measured once) | Random / expert on 1–3 |
|---|---|---|---|
| `rb-construction-drilling#hard` | 30/30 | **3/3**, 19.7 steps, 0 violations | 0/3 / 3/3 |
| `rb-port-gantry#hard` | 30/30 (29.4 steps) | **3/3**, 22.3 steps, 0 violations | 0/3 / 3/3 |
| `rb-amr-fleet-routing#hard` | 16/30 (14 at the step cap) | **1/3**, 84.7 steps, 0 violations, 2 at the cap | 0/3 / 3/3 |

Read honestly:
- Drilling has no planner even in the expert, so a rule-follower matches it.
- The port gantry needs no search to pass, only more steps.
- On AMR the reactive robots never break a rule, but they can block each other until the step cap.

## Cycles

1. Reason: every share, threshold and round count must be on record before any held-out run. Check: a commit that comes
   before the first held-out run. → Act: the "Declared before running" section. → Observe: committed 891fbff4, before any
   arm ran.
2. Reason: the hard variants need a third baseline between random and the expert. Check: `check_roboscenarios` row 10
   re-measures it live. → Act: `rt7ReactivePolicy`, which projects the observation onto the declared fields, plus `ag_eval
   --scenarios`. It was tried once on training seeds 101–130 (30/30, 30/30, 16/30) and not tuned. → Observe: seeds 1–3 gave
   3/3, 3/3 and 1/3. The supplement is +22 lines, 0 deletions, with the station rows identical. `check_roboscenarios` 13/0.
   Committed 77ff7377.
3. Reason: measure whether per-robot features can express the expert's labels before running rounds. Check: the
   `rt6Aliasing` ceiling on training states only. → Act: `amr-robots`, plus `rt6Dagger`'s opt-in `aliasingSets`. → Observe:
   0.745 → 0.959 on the same 15,548 rows (and 0.745 reproduced for `amr-path`).
4. Reason: the per-step reward and the declared rounds go through COLEARN's tooling. Check: rows above `preference`
   byte-identical, plus `check_colearn` lines. → Act: `col_eval` appends `stepReward` and `dagger.robotFeatures`. → Observe:
   the per-step reward gave 0.550 / 0.017 (below the rule filter), and `amr-robots` gave 0.983 (gap 0.017).
   `colearn.json` +249 lines, 0 deletions. `check_colearn` 58/0. Committed 9a78eca5.
5. Reason: rating robot runs gives the reward model pairs about robot behaviour. Check: a `check_colearn` consent line and a
   headless drive with page errors 0 and external requests 0. → Act: `rt7RobotRun`, the pad's rating block, and
   `ag-feedback.js` in the parishes bundle. → Observe:
   - In node: refusals everywhere except the opted-in adult, and 1 pair. `check_colearn` 60/0.
   - The first drive **failed**: one of the two ratings was lost. The drive had navigated while the second IndexedDB write
     was in flight; an awaited debug run stored both.
   - The drive now waits until both cards are marked. The second drive passed, with page errors 0 and external requests 0.
   - Committed 46013727.
6. Reason: the detour move is close to the expert's planner, so how much of the gain does it carry? Check: the same rounds,
   run once, without it, declared first (28ab0904). → Act: `amr-holders`. → Observe: 0.517 (gap 0.483), ceiling 0.796, so
   the detour move carries most of the gain. `colearn.json` +83 lines, 0 deletions. `check_colearn` 61/0. Committed
   72727125.
7. Reason: a checker outside my own list can catch a merge-level break. Check: the neighbour checkers' last lines. → Act:
   ran them one at a time. → Observe: all pass (below). The export did not change, so it was not regenerated.

## Checkers run (single checkers; last lines)

- `node tools/check_colearn.mjs`: 61 passed, 0 failed
- `node tools/check_roboscenarios.mjs`: 13 passed, 0 failed
- `node tools/check_robotrain.mjs`: ok, 334 checks. Meshes 207/204/210/218. The COLEARN provider completes 28/30, with the
  governor's verdict on 413/413 steps (unchanged).
- `node tools/check_agentgym.mjs`: 33 passed, 0 failed
- `node tools/check_dataworks.mjs`: 59 passed, 0 failed
- `node tools/check_roboexport.mjs`: 8 passed, 0 failed. The export did not change: default model hashes are untouched.
- `node tools/check_newton.mjs`: 60 checks, 0 failed, "All NEWTON checks pass."
- `node tools/check_imports.mjs`: "All 1117 modules call only what they declare or import."
- `node tools/check_parse.mjs`: see the hand-back (run last)
- `node tools/drive_rt7_ratings.mjs 9113` (on the locally rebuilt parishes page): ok. Page errors 0, external requests 0.
- `eval_worlds` and `eval_content` were not run: this work adds no world subject and no station.

## Seams

- `WebXR/shared/rt7-learn.js` (tools-only, like `rt6-learn.js`; in no bundle list):
  - `RT7_WINDOW`, `RT7_WINDOW_FEATURES`, `rt7WindowFeatures(ep, t, W)`
  - `rt7WindowPairs(sc, { n, seed })`, `RT7_DROP_BELOW`, `RT7_DROP_SWEEP`, `rt7EvalStepReward(sc, opts)`
  - `RT7_REACTIVE_FIELDS`, `rt7ReactivePolicy(sc)`
- `col-learn.js`:
  - `COL_FEATURE_SETS["amr-robots"]` and `["amr-holders"]` (opt-in); the internal `colDetourMove`.
  - COLEARN's default features, models and hashes are unchanged.
- `rt6-learn.js`:
  - `rt6Dagger(sc, { aliasingSets })` adds `aliasingOnTheseStates` only when given.
  - `rt6LocalPairs` reads a rated robot run against its task's step cap; station ratings are read as before.
- `rt-teleop.js`:
  - `rt7RobotRun(model, seed)`
  - the pad's `rateRuns(seed)`, `rate(k, "up" | "down")` and `ratings()`
- `tools/bundle_webxr.py`: `ag-feedback.js` in the parishes list, after `dx-data.js` and before `rt-teleop.js`.
- `tools/ag_eval.mjs --scenarios`: the `reactive` agent; the supplement's `scenarioBaselines.reactive` and
  `perScenario[].reactive`.
- `tools/drive_rt7_ratings.mjs [port]`: build first; not in the gate.
- `docs/evals/colearn.json`: `preference.scenarios[].stepReward`, `dagger.pathFeatures.aliasingOnTheseStates`,
  `dagger.robotFeatures`, `dagger.holderFeatures`.

## Left

- **The per-step reward did not beat the rule filter under its declared rule.**
  - Rule-broken windows are rare in the synthetic window pairs, so the fit learnt little about them.
  - Next, both declared before running: pair windows so that about half contain a broken rule, and score on a fresh held-out
    range, 7061–7120. The sweep's P < 0.5 result (0.917 on AMR) is only a hint until then.
- **The `amr-robots` gain rests on the detour move**, a hand-written shortest path around the robots. A clone that learns
  the route itself (without that feature) is still 0.483 short. The features stay opt-in.
- **The rated pair carries no signal yet.** On the page, the two rated runs are the pad's task (cell entry at the cell rig).
  With the synthetic clone both passed in 26 steps, so the pair's features are identical.
  - Rating the clone against a different policy, or two more different seeds, would give the reward model something to learn.
  - The compact rating steps keep action types and rule breaks, not positions, and wait steps are dropped (AGENTGYM's
    `agRatingSteps`), so `waitRate` reads 0.
- **The reactive agent deadlocks on AMR hard** (1/3, with 2 runs at the cap). No rule ever broke.
- **Not done here:**
  - The dist bundles were rebuilt locally for the drive (`python3 tools/bundle_webxr.py parishes`) and **not committed**.
    The coordinator's rebuild carries `rt-teleop.js`, `ag-feedback.js` in the bundle and `col-learn.js`.
  - The wiki and roadmap lines (`docs/wiki/Roadmap-and-Changelog.md`) were not edited; WHITEPAPER-R6 reads these notes.
    `guide-kb.js` was not regenerated.
  - `check_colearn` grew by six lines (about 10 s more under load). Re-measure its `docs/perf/checkers-baseline.json` row
    quiet (coordinator).
