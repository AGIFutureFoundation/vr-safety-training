# ARENA-2: the declared retest, stations in the dataset, consented takes (`ra2`, port 9151)

Loop 10, round 7. Base 40d97421 (loops 3–9, loop 10 rounds 1–6), fast-forwarded and confirmed. This continues ROBO-ARENA
(`docs/consoles/ROBO-ARENA.md`, `tools/briefs/next/ra-next.md`) and keeps its `ra-*` files. Every robot is simulated.
Every model here is built and trained in this repository, on the device, with no network call, no external API and no
key. ra-lm and ra-lm-h are **small language-conditioned models trained here, not large language models**. Every
demonstration is synthetic and says so. No person was measured.

## Declared before running (docs/evals/arena-declared-r7.json)

- **8ea01d3c, 18:48:** the declaration, committed before any run on the fresh held-out range.
  - Seeds: gym **7181–7240**, stations **7181–7190**.
  - Models: `bc`, `ra-lm` and the new `ra-lm-h`. The one declared change is a hidden layer: `h = tanh(V·[s,1])`,
    H = 24, shared across tasks, with `logit = tᵀ·W·[h,1]`.
  - Headline: ra-lm-h − bc, pooled over AMR base and port base (the two declared gaps), with Newcombe's interval. No
    claim is made from an interval that spans 0.
  - A `consumers` section tells STRANDS and CLAW-2 how to use the range. They cite this commit, declare their own
    comparison, run it once and never tune on it.
- **19f654a9:** amendment 1 and the code, still before the run.
  - The hyperparameters stayed at their declared values; nothing was tuned.
  - It records the cobot diagnosis (below) and the declared fix, `interruptText`.
  - It corrects one sentence of the declaration. A station-only input change does shift the gym weights, because
    ra-lm-h is one model trained on every task. On development seeds the gym moved by at most one episode per scenario.
- `tools/arena_eval.mjs --r7` refuses to run in three cases: the file is uncommitted or modified, the code's protocol
  differs from it, or `arena.json` already holds `retest7`. It ran once (3325b914).

## The cobot station's missed step (training data only)

- On the 12 clean synthetic cobot demonstrations (seed 1), ra-lm answers the station's time-limited interruption
  (`select:@interrupt`) on **9 of 24** labels. On the `force-hold` step it predicts `wait` for 12 of 12.
- Rollouts on the generator's own seeds (100004–100006) show what follows:
  - The interruption ("a student reaches into the work area") stays pending.
  - At `release-select` the model presses `release-button` while the interruption is still pending.
  - The station scores that as a hazard, so every rollout finishes the drill with 1 hazard and fails (score 29.04).
- Its other weak step is the `approach-walk` track: 1,290 of 1,920 labels right, mostly letting go of the meter while the
  demonstration holds it.
- **The fix** (ra-lm-h only): while an interruption is pending, its own alert and cue text from the station file joins
  the instruction vector, as the current step's text already does. The interruption texts stay out of the TF-IDF corpus,
  so ra-lm's weights are unchanged (hash e5461753183121cb before and after).
- With the fix, on training data: interruption answers 21 of 24, `approach-walk` 1,384 of 1,920, and every training
  rollout passes (279 steps, 0 hazards). The hidden layer alone already passed those rollouts; the fix is kept because it
  targets the diagnosed label.

## Evals (before → after)

| What | Before | After | Source |
|---|---|---|---|
| **Small model vs clone on the declared gaps** (AMR + port, 7181–7240, measured once) | ra-lm 0.417 / 0.767 vs bc 0.700 / 1.000 on 7121–7180 | ra-lm-h **0.842** [0.766, 0.896] vs bc **0.908** [0.843, 0.948]; difference **−0.067 [−0.152, 0.018]**. The interval spans 0, so no difference is claimed. | `docs/evals/arena.json` `retest7.comparisons.headline` |
| AMR base / port base separately | — | AMR 0.717 vs bc 0.817 (−0.100 [−0.247, 0.052]); port 0.967 vs 1.000 (−0.033 [−0.114, 0.031]) | `retest7.comparisons.amr`, `.port` |
| **The effect of the change** (ra-lm-h − ra-lm, same seeds, AMR + port) | — | **+0.133 [0.028, 0.235]** (ra-lm 0.708 here: AMR 40/60, port 45/60) | `retest7.comparisons.changeOnGaps` |
| Every scenario, 7181–7240 | ra-lm − bc −0.093 on 7121–7180 | ra-lm-h 0.832 vs bc 0.849: **−0.018 [−0.060, 0.025]**; ra-lm 0.782 | `retest7.comparisons.allScenarios`, `.leaderboard` |
| Held-out tasks (3 hard variants × 60) | ra-lm − bc −0.022 [−0.122, 0.078] | ra-lm-h − bc **−0.011 [−0.111, 0.089]** (0.589 vs 0.600) | `retest7.comparisons.heldOutTasks` |
| **Cobot station** | ra-lm 0 of 10 (7121–7130) | ra-lm **0 of 10**, ra-lm-h **10 of 10**, bc 10 of 10 (7181–7190). Both the hidden layer and the fix are present. | `retest7.comparisons.cobotStation` |
| Cobot training labels (diagnosis) | interruption answers 9 / 24 | 21 / 24 (ra-lm-h with the fix) | amendment 1 |
| Governor / physical | — | 83,756 of 83,756 steps checked; physical 0; audit chains intact; 1,710 episodes | `retest7.totals` |
| ra-lm-h size | — | 44,760 weights (ra-lm 26,640) | `retest7.newModel.params` |
| **Dataset episodes from stations** | 0 | **90** (25,633 steps; 20 / 5 / 5 per station and split). The set grows from 351 / 9,469 to 441 / 35,102. **Leakage 0**, re-measured from the full lines. | `exports/robotics/arena/index.json` `fromStations`; `check_arena` 7 |
| `exports/robotics` folder | 1,277 KB | 1,439 KB (cap 1.5 MB, not loosened) | `check_roboexport` 1–2 |
| **Consented export** (drive on 9151, fixture store) | no button | signed out **0**; opted-in adult **2 of 2** (one provenance row each: take, task, steps, consent receipt, licence); after revoke **0**, store empty | `node tools/drive_ra_takes.mjs 9151` |
| Consented export (Node) | — | signed out 0; opted in 1 of 1; 1 receipt-less take refused; K-12 0; demo 0; revoke 0; lines byte-identical to `ra_dataset.mjs` | `check_arena` 10 |
| `check_arena` | 8 / 0 | **10 / 0** | `node tools/check_arena.mjs` |

What the table says, plainly:

- One hidden layer made the small model better than itself on the two gaps (+0.133, interval clear of 0).
- It did not overtake the clone: the remaining difference on the gaps (−0.067) and over all scenarios (−0.018) has an
  interval that spans 0.
- The cobot station went from 0 of 10 to 10 of 10. The diagnosis was made on training data only.

## What is here

- **`WebXR/shared/ra-lm.js`**
  - `raLmTrain` takes `opts.hidden`, and the hidden layer is trained by backpropagation. H = 0 runs the original code
    path, number for number.
  - `opts.interruptText` is the declared station fix.
  - `raLmLabel` returns the argmax label, for the diagnosis.
  - `RA_LM_H_TRAIN`, `RA_LM_H_VERSION` and `RA_LM_H_LABEL` describe ra-lm-h.
  - `raLmTaskTexts` also returns each station's interruption texts.
- **`WebXR/shared/ra-arena.js`**
  - `ra-lm-h` is listed in `raModels()` after `ra-lm` (9 models).
  - `RA_HELD_OUT_R7` and `RA_STATION_SEEDS_R7` hold the round-7 seeds.
  - `RA_MODELS_R6` names the eight round-6b families. `RA_HELD_OUT` stays 7121–7180, so the published rows still re-run.
- **`tools/arena_eval.mjs`:** `--r7` (and `--r7 --dev`), `raDeclarationR7`, `raEvalR7` and `raFirstCommit`. The round-6b
  path uses the eight round-6b families only.
- **`tools/ra_dataset.mjs`** (`ra-ds/2`, schema `smartcitix.robotics.arena-episode@2`)
  - The three station tasks enter when `raDsBuild({ stations })` is given the headless suite's stations.
  - Station lines carry `step`, the drill step's id. Its text is in `instructions.json` `stepInstructions`.
  - The committed sample holds the first 100 lines of one train episode per station, marked `truncated` in the index.
    A whole station episode is about 120 KB, and three whole ones measured 1,669 KB against the 1.5 MB cap.
  - `--full --out <dir>` writes every shard. This also fixes a `full is not defined` bug in that path.
- **`WebXR/shared/ra-takes.js`** (browser-safe)
  - `raTakesExport` reads the learner's own takes through `colLocalDemos`, so only while `dxCollecting()` holds.
  - Each take is validated, and one without an adult consent receipt is refused.
  - It writes lines in the set's schema, with provenance per sample.
  - `raTakesMount` is the page control. The export is a local file download; nothing is sent.
- **`WebXR/data/index.html`:** the DATAWORKS page mounts the button under its consent panel. `tools/bundle_webxr.py`
  `DIST_SHARED` gains `ra-takes.js` and its imports (`col-learn.js`, `rb-env.js`, `robot.js`, `robot-embodiment.js`,
  `rb-robotics-data.js`).
- **`tools/drive_ra_takes.mjs`:** the headless drive (port 9151).
- **`tools/check_arena.mjs`**
  - Check 1 now expects nine models; the round-6b eight are still named.
  - Check 7 builds the set with the stations and checks every station line's `step` and all three stations in every
    split.
  - New check 9: `retest7` was declared first, matches the code, ran once on 7181–7240, the governor saw every step, and
    a live row equals the file.
  - New check 10: the consented takes.

## Cycles

1. **Reason:** two other consoles wait on the range, so the declaration comes first. **Act:** wrote
   `arena-declared-r7.json` with the seeds, models, change, metrics, headline and a consumers section. **Observe:** no
   held-out seed had been touched. **Check:** committed 8ea01d3c at 18:48, with a heartbeat line naming it.
2. **Reason:** ra-lm is linear in the scene for a given text, and the clone is not. **Act:** a hidden layer behind
   `opts.hidden`, with H = 0 kept exact. **Observe:** on gym-only dev seeds AMR scored 18/20 against bc's 14. With the
   stations in training, as declared, it scored 12/20 against bc's 14 and ra-lm's 11. **Check:** ra-lm's weights hash is
   unchanged (e5461753183121cb), and `check_arena` 8/0. The declared values were kept and nothing was tuned.
3. **Reason:** the cobot station's 0 of 10 needed a cause. **Act:** compared argmax with the demonstration labels per
   `stepId` on training data, then rolled out on the generator's seeds. **Observe:** every rollout finished the drill but
   failed on one hazard: a release with an unanswered interruption, which force-hold had predicted as `wait`.
   **Check:** interruption answers 9/24 → 21/24 with the interruption-text fix. Recorded in amendment 1 (19f654a9) before
   the run.
4. **Reason:** measure once. **Act:** `arena_eval --r7`, which refuses unless the declaration is committed and matches.
   **Observe:** the gap difference is −0.067 [−0.152, 0.018], the change is +0.133 [0.028, 0.235], and the cobot station
   went from 0 to 10 of 10. **Check:** `check_arena` 9 confirms declared 8ea01d3c → results 3325b914 and that a live row
   equals the file.
5. **Reason:** the stations belong in the set. **Act:** 20/5/5 station episodes per split. **Observe:** the folder
   measured 1,669 KB against the 1.5 MB cap with whole station sample episodes. **Check:** 100-line station samples,
   marked truncated: 1,439 KB, and `check_roboexport` 8/0. Leakage 0, and `check_arena` 7 passes.
6. **Reason:** a learner's own takes, only under consent. **Act:** `ra-takes.js` and the data-page button. **Observe:**
   the fixture check's receipt-less take was never stored, because DATAWORKS' `put` already refuses it, so the export's
   refusal went unexercised. **Check:** the take is written straight into the backend; the export refuses it
   (`check_arena` 10). The drive found 0 / 2 / 0, with page errors 0 and off-host requests 0.

## Checkers run (single checkers; last lines)

- `check_arena`: 10 passed, 0 failed
- `check_roboexport`: 8 passed, 0 failed
- `check_dataworks`: 59 passed, 0 failed
- `check_claw`: 8 passed, 0 failed (it reads `raModels()`, now nine)
- `check_colearn`: 69 passed, 0 failed
- `check_roboscenarios`: 13 passed, 0 failed
- `check_robotics_programme`: ok — 714 checks
- `check_newton`: all NEWTON checks pass
- `check_imports`: all 1,138 modules call only what they declare or import
- `check_parse`: all 2,717 shipped modules parse
- `check_interface`: OK — 21 passed, 0 failed (a control was added on the data page)
- Drive: `node tools/drive_ra_takes.mjs 9151`, pass. The committed dist was restored afterwards, and the coordinator
  rebuilds.

## Seams

- **STRANDS and CLAW-2** use 7181–7240 only through 8ea01d3c (its `consumers` section).
- **The dataset schema** is now `@2`; station lines add `step`. STRANDS' LeRobot-style mapping should read `@2`.
- **OMEGA-CLAW** sees nine models from `raModels()`. `ra-lm-h` needs `lmOptions.texts` exactly as `ra-lm` does.
- **The data page** (DATAWORKS) carries the button under its consent panel. The page's bundle list was not touched; only
  `DIST_SHARED` gains files.

## Left

- ra-lm-h still trails the clone on AMR base (0.717 vs 0.817), within an interval that spans 0.
- The port hard variant: ra-lm-h 37/60 vs bc 44/60, not a declared comparison.
- ra-next item 5 (the promoted model per scenario on the arena panel) is not done. It would read OMEGA-CLAW's
  `oc-claw-record` file.
- The programme page's static arena section still shows round 6b's leaderboard only. A `retest7` card was not added
  (`check_arena` 8 still reads the round-6b rows).
- The station sample is truncated at 100 lines per station; the full set has every station episode.
