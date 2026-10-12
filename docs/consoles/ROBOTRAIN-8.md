# ROBOTRAIN-8: the declared retests (`rt8`, port 9134)

Loop 10, round 5 (SmartCiti.X Holodeck · Powered by AGI Corp). Base e252b25f, the integration head (loops 3–9, loop 10
rounds 1–4). This builds on ROBOTRAIN-7 (`rt7-learn.js`), ROBOTRAIN-6 (`rt6-learn.js`), COLEARN (`col-learn.js`,
`tools/col_eval.mjs`, `docs/evals/colearn.json`), AGENTGYM (`tools/ag_eval.mjs`) and ROBOTICS' gym (`rb-env.js`). Every robot
is simulated. Every pair, rater, demonstration and correction label here is synthetic or scripted, and says so where it is
written. No person was measured.

## Declared before running (written 16:08 UTC, before any run on the held-out seeds 7061–7120)

Held-out seeds for this round are **7061–7120** (60 fresh seeds). Nothing below is tuned on them, and each declared result
is measured once on them and reported as measured. COLEARN's earlier range, 7001–7060, has been seen by earlier rounds.

**Disclosure.** Before writing this, one timing run reproduced work on the old range 7001–7060 only. It ran one correction
round on `rb-port-gantry#hard` (round 0 0.717, as published; round 1 **0.583**) and one round of `amr-holders` (round 1
0.783). The port round count below is ROBOTRAIN-6/7's 5 × 20, written before this round; it was not chosen from that figure.

**Item 1, the per-step reward, tested properly.**
- Unchanged from ROBOTRAIN-7: the window (the step and the next two, W = 3); its features `broke`, `waitRate` and
  `progress`; the synthetic window rater (utility = −4·any rule broken in the window + 1·progress, Bradley–Terry choice at
  temperature 0.5); the fit (`rt6FitReward`: L2 0.01, 500 full-batch steps, lr 0.5); the same 40 synthetic demonstrations
  (seed 1); the drop rule's form.
- **The pair oversampling rule.** There are 200 pairs per task, built from the two runs of ROBOTRAIN-6's synthetic pair i
  (`rt6SyntheticPairs`, seed 1), the same synthetic runs ROBOTRAIN-7 used.
  - For an even i, when either run has a rule-broken step, a seeded generator (`rng(seed·7907 + 31)`) picks a run with a
    broken step (each with probability ½ when both have one) and one of its broken steps, uniformly. Its window starts 0, 1
    or 2 steps before that step (uniform, clipped at step 0), so the window holds the broken step. The other run's window
    starts uniformly, as in ROBOTRAIN-7.
  - For an odd i, or an even i where neither run broke a rule, both windows start uniformly, as in ROBOTRAIN-7.
  - 150 pairs fit the model and 50 are held out for pair accuracy.
  - The measured share of pairs with a broken rule in at least one window is reported, whatever it is.
- **The threshold.** Drop step t when sigmoid(its window's reward − the median step reward over the 40 demonstrations) is
  below **0.25** (ROBOTRAIN-7's declared value, unchanged). Every other step of every demonstration, passing or failing, is
  cloned with COLEARN's k-NN, with no run-level filter.
- **Measured once on 7061–7120, on `rb-amr-fleet-routing` and `rb-amr-fleet-routing#hard`:**
  - **A, the declared result:** the oversampled pairs at P < 0.25.
  - B: the oversampled pairs at P < 0.5, the sweep's hint, tested once beside the declared threshold.
  - C: ROBOTRAIN-7's own pairs at P < 0.5, the hint exactly as it was found on 7001–7060.
  - The rule filter (clean passes only) and the unfiltered clone, on the same seeds.
  - The item is answered by A against the rule filter.

**Item 2, learn the route instead of being given it.**
- **`amr-local`, the declared result.** It is opt-in and uses no search output of any kind: no shortest path, no BFS and no
  planner. Its features:
  - COLEARN's 9 AMR features, with their weights unchanged.
  - `order`: this robot's place among the robots still moving, as in `amr-robots`. Weight 4.
  - **Free cells within two steps:** 8 features, one for each cell at Manhattan distance 2 (E2, W2, S2, N2, NE, NW, SE,
    SW). A cell is free when it is inside the grid and holds no shelf, no pallet and no robot (parked robots count). Weight
    1 each.
  - **The other robots' last moves:** `stillN/S/E/W`, 1 when a robot stands on that neighbouring cell and did not move on
    the last tick (parked robots count as still), and `towardN/S/E/W`, 1 when the nearest robot within two cells in that
    straight line moved toward this robot on the last tick. Weight 2 each.
  - A robot's last move is its cell now minus its cell at the previous observation of the same episode ([0, 0] at the first
    step). The clone's wrapper adds `lastMoves` to the observation from what it has already seen in the episode. Nothing
    is looked up ahead.
- **`amr-holders-local`.** This is `amr-holders`' 17 features plus the same 16 local features (8 free cells, 4 still, 4
  toward; `order` is already in `amr-holders`). It keeps `amr-path`'s route features, as the 0.483 baseline does: a
  shortest path around the shelves and the pallet, with the other robots ignored. It shows what the local view adds on top
  of that static route.
- **The aliasing ceiling comes first, on training states only.** It is `rt6Aliasing` over the labelled states that the
  `amr-path` rounds aggregate: training seeds 800,100–800,519, the same 15,548 rows as ROBOTRAIN-7. That run scores no
  held-out seed.
- **Then the rounds, run once each.** Each is 5 rounds × 20 rollouts, with labels from the scripted expert (not a person),
  scored on 7061–7120. The final round (round 5) is the result.
  - The runs are `amr-local` (the declared result) and `amr-holders-local`.
  - `amr-holders` and `amr-robots` (the detour-feature result) are run again unchanged on the same fresh seeds, for a
    same-seed comparison.
  - The AMR hard gap is the expert's success on 7061–7120 minus round 5's.

**Item 3, the port-lane hard variant.**
- `rb-port-gantry#hard` with COLEARN's 14 port features, unchanged.
- Correction rounds, DAgger-style: the scripted expert's action at skill 1 labels each state the clone visits (not a
  person's correction). There are **5 rounds × 20 rollouts** on training seeds 800,100–800,519, scored on 7061–7120 and
  run once.
- Round 0 is COLEARN's filtered clone on the fresh seeds. The result is round 5. The gap is the expert's success on the same
  seeds minus round 5's.

**Item 4, a reactive agent that does not deadlock on AMR hard.**
- `rt8ReactivePolicy` is ROBOTRAIN-7's reactive rules plus one rule, on AMR only: **wait-then-sidestep, k = 3**.
  - The rule fires when the same robot has stood on this robot's first productive cell for 3 consecutive ticks. The count
    resets when the blocker changes or the cell is free.
  - This robot then steps to a free, safe cell at right angles: not into a busy walkway, toward the goal's row or column
    first, then N, S, E, W order. The count then resets.
  - It reads only `RT7_REACTIVE_FIELDS["rb-amr-fleet-routing"]`. It uses no search, no planner and no learning.
- It is developed on training seeds 101–130. Then it is measured once on the supplement's seeds 1–3 (the eval's "N of 3")
  and once on 7061–7120.
- k is fixed here. A bug fix found on the training seeds is written in the Cycles. k and the rule's form do not change.

## Amended before running (written 16:20 UTC; still before any run on 7061–7120 or on seeds 1–3)

Both amendments come from training-side evidence only: the synthetic pairs, and training seeds 101–130. No held-out seed and
none of seeds 1–3 had been run. They replace the rules above where they differ. I am stating them because the declaration
above promised the rule's form would not change.

**Item 1, the oversampling rule.** The rule above draws only from pair i's own two runs. It gave a broken rule in only
**23 of 200** pairs on AMR and **48 of 200** on AMR hard: only 19 and 39 of the 100 even pairs had a rule-broken step in
either run. That is far from "about half". The amended rule:
- For an even i, window A starts 0, 1 or 2 steps before a rule-broken step drawn uniformly from every rule-broken step of the
  400 synthetic runs (ROBOTRAIN-6's 200 pairs × 2 runs, the same synthetic runs). Window B starts uniformly in run b of
  pair i.
- For an odd i, both windows start uniformly in pair i's runs, as in ROBOTRAIN-7.
- The generator stays `rng(seed·7907 + 31)`. Measured on the pairs (training side): a broken rule in **104 of 200** pairs on
  AMR and **105 of 200** on AMR hard. The threshold (P < 0.25), the arms A/B/C and the baselines are unchanged.

**Item 4, the reactive agent.** On training seeds 101–130 the declared rule changed nothing: 16/30, the same 14 runs at
the step cap. The traces showed two stalls.
- **12 of the 14 were a pallet dead end, not robots blocking each other.** A robot entered (1, y) with the pallet at (2, y).
  It then had shelves or the grid edge on both sides, and ROBOTRAIN-7's pallet rule had no side to step to. Amendment: the
  pallet rule looks **two cells ahead** in the robot's row, not one, so the robot changes rows in column 0 before it enters
  the dead end.
- **The other stalls were head-on blocks in column 5** (seeds 101, 111 and 113). The declared rule never counted them: the
  "first productive cell" was a shelf, so no robot stood on it. Two amendments:
  - The first productive cell is the first productive move whose cell is open floor (inside, no shelf, no pallet).
  - Only a robot that moves **later in the move order** than its blocker, or one blocked by a parked robot, steps aside. In a
    mutual block, if both stepped aside at once they would come back to the same block.
- k = 3 and the right-angle sidestep are unchanged.
- After the amendments, training seeds 101–130 give **29/30**, 0 violations and 19.1 mean steps. The one failure (seed 123)
  is a robot at (7, 3) bound for (8, 6). A parked robot holds (8, 3) and both side cells are shelves, so it has no right-angle
  cell to step to. It is left as it is.
- It is then measured once on seeds 1–3 and once on 7061–7120, as declared.

## What is here

1. **The per-step reward, tested properly** (`WebXR/shared/rt8-learn.js` `rt8WindowPairs`, `rt8EvalStepReward`). These are
   ROBOTRAIN-7's windows, features, synthetic window rater and fit. The pairs are oversampled under the amended rule. Each
   arm is scored once on 7061–7120 beside the rule filter and the unfiltered clone, on the same seeds.
2. **The route from local features** (`COL_FEATURE_SETS["amr-local"]` and `["amr-holders-local"]`, registered by
   `rt8-learn.js`; opt-in).
   - `amr-local` reads no search output.
   - The last moves come from the episode's previous observation, through a wrapper (`rt8WithLast`, `rt8Stateful`).
   - `rt8Dagger` is ROBOTRAIN-6's rounds with that wrapper, and with the held-out range as an argument.
   - The ceiling ran first, on training states, with no held-out seed scored.
3. **Correction rounds on the port-lane hard variant.** These are `rt8Dagger("rb-port-gantry#hard")` with COLEARN's
   features, unchanged.
4. **A reactive agent that does not stall on AMR hard** (`rt8ReactivePolicy`).
   - It is ROBOTRAIN-7's rules with a two-cell pallet look-ahead, plus wait-then-sidestep (k = 3; the robot later in the move
     order yields).
   - It reads the same declared fields and uses no search, no planner and no learning.
   - It is a fourth baseline, `reactive-sidestep`, in `ag_eval --scenarios`. `check_roboscenarios` row 10 re-measures it
     live.

Everything goes through COLEARN's tooling: `tools/col_eval.mjs` writes `docs/evals/colearn.json`'s new last key, `rt8`.
`check_colearn` re-runs it and compares byte for byte.

## Evals (before → after)

Every "after" figure is on the 60 fresh held-out seeds 7061–7120, measured once, unless named otherwise. Every "before"
figure is ROBOTRAIN-7's, on 7001–7060, unless named otherwise.

| Measure | Before | After | Source |
|---|---|---|---|
| **Per-step reward against the rule filter, AMR** (declared, P < 0.25) | 0.550; rule filter 0.817 | **0.517**; rule filter **0.650** (unfiltered 0.533) | `colearn.json` `rt8.stepReward[0].declared`, `.ruleFiltered`, `.unfiltered` |
| **The same, AMR hard** | 0.017; rule filter 0.050 | **0.050**; rule filter **0.083** (unfiltered 0.033) | `rt8.stepReward[1]` |
| The P < 0.5 hint on ROBOTRAIN-7's own pairs (arm C, declared as a test) | 0.917 / 0.083 (seen on 7001–7060, not declared) | **0.883** (AMR) / **0.117** (AMR hard) | `rt8.stepReward[].hintRt7Pairs` |
| P < 0.5 on the oversampled pairs (arm B) | — | 0.467 / 0.067 | `rt8.stepReward[].hintOversampled` |
| Pairs with a broken rule in a window | 11 / 17 of 200 (ROBOTRAIN-7's pairs) | **104 / 105 of 200** | `rt8.stepReward[].pairs` |
| Held-out pair accuracy (rater ceiling) | 0.66 (0.65) / 0.72 (0.671) | 0.78 (0.828) / 0.90 (0.856) | `rt8.stepReward[].accuracy` |
| The window's weight on a broken rule | −0.812 / −1.162 | −2.657 / −3.214 | `rt8.stepReward[].model.w[0]` |
| Aliasing ceiling on the `amr-path` rounds' 15,548 labelled training rows (no held-out seed) | 0.796 (`amr-holders`) | **0.910** (`amr-local`, no search output) · 0.911 (`amr-holders-local`) | `rt8.routeCeiling` |
| **AMR hard gap without the detour feature** (5 rounds, round 5) | 0.483 (`amr-holders`) | **0.683** (`amr-local`, round 5 0.317) | `rt8.localFeatures.gap` |
| The same rounds on the same fresh seeds: `amr-holders` / `amr-holders-local` | — | 0.683 (round 5 0.317) / **0.250** (round 5 0.750) | `rt8.holdersFresh`, `rt8.holdersLocal` |
| The detour-feature result beside it (`amr-robots`) | 0.017 | 0.067 (round 5 0.933) | `rt8.robotsFresh` |
| **Port-lane hard gap** (5 declared rounds, round 5) | 0.283 (no rounds tried) | **0.283** (round 5 0.717; round 0 on these seeds 0.783) | `rt8.portLane` |
| **Reactive agent, AMR hard, seeds 1–3** | 1/3 | **3/3** (15.3 steps, 0 rules broken) | `docs/perf/agent-baselines-robotics.json` `perScenario["rb-amr-fleet-routing#hard"]["reactive-sidestep"]`; `check_roboscenarios` row 10 |
| Reactive agent, AMR hard, 60 fresh seeds | 26/60 (ROBOTRAIN-7's agent, measured here) | **55/60** (5 at the step cap, 0 rules broken) | `rt8.reactive.heldOut` |
| `check_colearn` | 61 passed, 0 failed | **69 passed, 0 failed** | `node tools/check_colearn.mjs` |
| `check_roboscenarios` | 13 passed (row 10: random, reactive, expert) | **13 passed, 0 failed** (row 10 also re-measures `reactive-sidestep` live) | `node tools/check_roboscenarios.mjs` |

Notes on the evals:
- **Bytes.** `colearn.json` is +747 lines with 0 deletions. The old file's body is an exact prefix of the new one, so every
  earlier row (COLEARN's, ROBOTRAIN-6's and ROBOTRAIN-7's) is byte-identical. `agent-baselines-robotics.json` is +22 lines
  with 0 deletions; its 16 station rows were carried over unchanged, and only the scenario rows were regenerated
  (`agEvaluateScenarios`, seeds 1–3).
- **Budgets.** No scene, mesh, light, texture, page or bundle changed. `rt8-learn.js` is tools-only. `check_robotrain` reads
  as before.
- **Held-out discipline.** The held-out failures (5 reactive runs, the port rounds' misses) were not traced. Looking at them
  would turn 7061–7120 into a development set.

### The per-step reward in full (60 fresh held-out seeds 7061–7120; the same 40 synthetic demonstrations)

| Task | Arm | Steps dropped | Rule-broken steps dropped | Rows | Success | Clean | Mean steps |
|---|---|---|---|---|---|---|---|
| `rb-amr-fleet-routing` | **A: oversampled pairs, P < 0.25 (declared)** | 14 of 560 | 4 of 4 | 1,264 | **0.517** | 0.517 | 63.583 |
| | B: oversampled pairs, P < 0.5 | 203 | 4 of 4 | 886 | 0.467 | 0.467 | 67.167 |
| | C: ROBOTRAIN-7's pairs, P < 0.5 | 183 | 4 of 4 | 944 | 0.883 | 0.883 | 15.433 |
| | rule filter (clean passes, 37 of 40 demos) | | | 1,168 | 0.650 | 0.650 | 40.117 |
| | unfiltered | | | 1,294 | 0.533 | 0.533 | 16.750 |
| `rb-amr-fleet-routing#hard` | **A (declared)** | 24 of 839 | 6 of 9 | 1,601 | **0.050** | 0.767 | 111.350 |
| | B | 398 | 9 of 9 | 849 | 0.067 | 0.783 | 111.317 |
| | C | 419 | 9 of 9 | 816 | 0.117 | 0.700 | 104.183 |
| | rule filter (32 of 40 demos) | | | 1,291 | 0.083 | 0.933 | 107.900 |
| | unfiltered | | | 1,651 | 0.033 | 0.950 | 114.717 |

Read honestly:
- **The declared result is below the rule filter on both tasks:** 0.517 against 0.650, and 0.050 against 0.083.
  - Oversampling did what it was meant to do: the model now weighs a broken rule heavily (−2.66 against −0.81), and its pair
    accuracy rose.
  - At P < 0.25 it drops few steps (14 of 560), and every rule-broken one among them. Dropping those steps does not make
    a better clone than dropping the failed runs.
- **ROBOTRAIN-7's P < 0.5 hint held on AMR on fresh seeds:** 0.883 against the rule filter's 0.650 (0.917 on 7001–7060).
  - It was declared as a test before this run, so it is a measured result now. It is still not the declared primary rule.
  - On AMR hard it is 0.117 against 0.083: 7 against 5 runs of 60, too few to read.
  - The same threshold on the oversampled model gives 0.467. That model scores waits negatively (−0.86), where ROBOTRAIN-7's
    scores them positively (0.27). Which steps each one drops was not analysed.

### Learning the route: DAgger rounds on `rb-amr-fleet-routing#hard` (labels are the scripted expert's; 7061–7120)

| Round | `amr-local` (declared; no search output) | `amr-holders-local` | `amr-holders` (re-run) | `amr-robots` (re-run; detour feature) |
|---|---|---|---|---|
| 0 | 0.217 | 0.233 | 0.200 | 0.783 |
| 1 | 0.450 | 0.817 | 0.633 | 0.850 |
| 2 | 0.200 | 0.783 | 0.400 | 0.850 |
| 3 | 0.383 | 0.717 | 0.600 | 0.850 |
| 4 | 0.367 | 0.767 | 0.217 | 0.850 |
| **5** | **0.317** (gap 0.683) | **0.750** (gap 0.250) | 0.317 (gap 0.683) | 0.933 (gap 0.067) |
| Ceiling on its own rounds' states | 0.905 (52 of 624 vectors ambiguous) | 0.953 | 0.823 | 0.978 |

The expert passes 60 of 60 on these seeds (19.2 mean steps).

Read honestly:
- **Without any search output, the clone does not learn the route in 5 rounds.** The local features raise the ceiling on
  training states from 0.796 to 0.910, but the rounds swing between 0.20 and 0.45 and end at 0.317 (gap 0.683). A high
  ceiling only says the labels can be told apart; the k-NN clone does not reach it.
- **The 0.483 baseline was seed-dependent.** On these seeds the same `amr-holders` rounds end at 0.317, so the honest
  "before" on 7061–7120 is 0.683, the same as `amr-local`.
- **The local view helps on top of the static route.** `amr-holders-local` keeps `amr-path`'s shortest path around the
  shelves and the pallet, with the other robots ignored. It ends at 0.750 (gap 0.250), steadier than `amr-holders`. It is
  not search-free, and it says so.
- The detour feature still leads: 0.933, against 0.983 on 7001–7060.

### The port-lane hard variant: correction rounds (labels are the scripted expert's; 7061–7120)

| Round | 0 | 1 | 2 | 3 | 4 | **5** |
|---|---|---|---|---|---|---|
| Labelled states | 0 | 904 | 2,354 | 3,244 | 4,536 | 5,218 |
| Success | 0.783 | 0.517 | 0.867 | 0.750 | 0.967 | **0.717** |
| Clean | 1.000 | 0.850 | 1.000 | 1.000 | 1.000 | 1.000 |
| Mean steps | 53.7 | 72.0 | 43.5 | 59.1 | 31.7 | 64.7 |

Read honestly:
- **The declared result is round 5: 0.717, gap 0.283.** That is the same gap as before (0.717 on 7001–7060 with no rounds).
- On the same fresh seeds round 0 was 0.783, so the rounds ended lower than they started.
- They swing hard. Round 4 reached 0.967, but round 4 was not declared and is not the result.
- No rule was broken after round 1.
- A likely cause, not measured: COLEARN's port features do not see the second pedestrian's schedule, so aggregated labels
  can disagree on the same feature vector. `rt6Aliasing` reads per-robot rows only, so it gave no ceiling for the port.

### The reactive agent

| Scenario | Training 101–130 | Seeds 1–3 (once) | 7061–7120 (once) |
|---|---|---|---|
| `rb-amr-fleet-routing#hard`, ROBOTRAIN-7's agent | 16/30 (14 at the cap) | 1/3 | 26/60 (34 at the cap) |
| `rb-amr-fleet-routing#hard`, `reactive-sidestep` | **29/30** (1 at the cap) | **3/3**, 15.3 steps | **55/60** (5 at the cap) |
| drilling and port hard, `reactive-sidestep` (ROBOTRAIN-7's rules unchanged) | — | 3/3 and 3/3 | — |

No run broke a rule.

Read honestly:
- ROBOTRAIN-7 wrote that the reactive robots "can block each other until the step cap". On the training seeds, 12 of its 14
  stalls were a pallet dead end instead: a robot entered (1, y) between shelves with the pallet at (2, y). The two-cell
  look-ahead fixes most of them. The sidestep fixes the head-on blocks in column 5.
- Five fresh seeds still reach the cap. They were not traced. A known stall is a robot boxed in by a parked robot, with
  shelves on both sides (training seed 123).

## Cycles

1. **Declarations.**
   - Reason: every rule had to be on record before any held-out run. Check: a commit that comes before the first run on
     7061–7120.
   - Act: the "Declared before running" section.
   - Observe: committed e504b70b at 16:07, before any run on those seeds. The message was amended to drop a trailer that
     named a model; the brief forbids model identifiers in commit messages.
2. **Does the declared pair rule reach "about half"?**
   - Check: the share of pairs with a broken rule, on the training side.
   - Act: `rt8WindowPairs`.
   - Observe: **failed**, with 23 and 48 of 200. Too few runs have a broken step.
   - Next cycle: draw from every broken step of the 400 runs, giving 104 and 105 of 200. The amendment was committed in
     a1bf8b4a, before any held-out run.
3. **Can the local features express the expert's labels?**
   - Check: the `rt6Aliasing` ceiling on the `amr-path` rounds' training rows, with no held-out seed scored.
   - Act: `amr-local`, `amr-holders-local`, and `rt8Dagger(..., { score: false })`.
   - Observe: the 15,548 rows and 0.745 for `amr-path` are reproduced exactly. `amr-local` gives 0.910 and
     `amr-holders-local` 0.911.
4. **Does the sidestep end the stalls on training seeds?**
   - Check: the pass count on 101–130.
   - Act: the declared rule.
   - Observe: **failed**, 16/30, unchanged. The traces show 12 pallet dead ends and 3 head-on blocks that the rule never
     counted.
   - Next cycle: the two-cell look-ahead, the first productive open cell, and the later robot yields. That gives 29/30 with
     0 rules broken. k = 3 is unchanged. Committed in a1bf8b4a, before seeds 1–3 or any held-out run.
5. **Items 1–4 measured once on 7061–7120 through COLEARN's tooling.**
   - Check: the rows above stay byte-identical, and the `check_colearn` lines.
   - Act: `col_eval`'s `rt8` key, run once.
   - Observe: `colearn.json` is +747 lines with 0 deletions, and the old body is a prefix of the new one. The results are
     in the Evals. `check_colearn` 69/0. Committed 9da2b26f.
6. **Seeds 1–3 once, and the live re-measure.**
   - Check: `check_roboscenarios` row 10.
   - Act: the `reactive-sidestep` baseline in `ag_eval --scenarios`, with the supplement's scenario rows regenerated.
   - Observe: AMR hard 1/3 → 3/3. The supplement is +22 lines with 0 deletions. 13/0. Committed de0c659d.
7. **Neighbour checkers.**
   - Reason: a checker outside my own list can catch a merge-level break. Check: their last lines.
   - Act: ran them one at a time, at nice priority.
   - Observe: all pass (below).

## Checkers run (single checkers; last lines)

- `node tools/check_colearn.mjs`: 69 passed, 0 failed
- `node tools/check_roboscenarios.mjs`: 13 passed, 0 failed
- `node tools/check_robotrain.mjs`: ok, 334 checks
- `node tools/check_agentgym.mjs`: 33 passed, 0 failed
- `node tools/check_dataworks.mjs`: 59 passed, 0 failed
- `node tools/check_roboexport.mjs`: 8 passed, 0 failed. The export did not change: no default model changed.
- `node tools/check_newton.mjs`: 60 checks, 0 failed, "All NEWTON checks pass."
- `node tools/check_imports.mjs`: "All 1125 modules call only what they declare or import."
- `node tools/check_parse.mjs`: see the hand-back.
- `check_interface` was not run: no control was added or changed. `eval_worlds` and `eval_content` were not run either:
  this work adds no world subject and no station.

## Seams

- `WebXR/shared/rt8-learn.js` (tools-only, like `rt6-learn.js` and `rt7-learn.js`; in no bundle list):
  - `RT8_HELD_OUT` (7061–7120), `RT8_OVERSAMPLE`, `rt8WindowPairs(sc, { n, seed })`, `rt8EvalStepReward(sc, opts)`
  - `COL_FEATURE_SETS["amr-local"]` and `["amr-holders-local"]`, registered when the module is imported. Their rows need
    `lastMoves`: train through `rt8Dagger`, and roll out through `rt8Stateful(model)`.
  - `rt8WithLast(obs, prev)`, `rt8Stateful(model)`, `rt8Expert(sc, seeds)`
  - `rt8Dagger(sc, { rounds, rollouts, featureSet, seeds, score, aliasingSets })`
  - `RT8_SIDESTEP_K`, `RT8_REACTIVE`, `rt8ReactivePolicy(sc)`
- `tools/col_eval.mjs`: `colEvalRt8()` writes `colearn.json`'s last key, `rt8`.
- `tools/ag_eval.mjs --scenarios`: the `reactive-sidestep` agent, in the supplement's `scenarioBaselines` and
  `perScenario[]`.
- `tools/check_colearn.mjs` section 13. `tools/check_roboscenarios.mjs` row 10 re-measures `reactive-sidestep` live and
  checks its source for search, expert calls and learning.

## Left

- **The per-step reward does not beat the rule filter under its declared rule**, even with half the pairs holding a broken
  rule (0.517 against 0.650; 0.050 against 0.083).
  - ROBOTRAIN-7's P < 0.5 rule on its own pairs did beat the rule filter on AMR on fresh seeds (0.883).
  - Why the two reward models differ (the sign of the wait weight) is not analysed. Any further test needs a new range,
    for example 7121–7180.
- **The clone does not learn the route from local features alone** (gap 0.683, rounds unstable), although the ceiling is
  0.910.
  - On the same seeds the static route plus the local view gives 0.250. The detour feature gives 0.067.
  - Next, declared first: more rollouts per round, or feature weights.
- **The port-lane correction rounds oscillate** (0.517–0.967) and end at 0.717. That leaves the gap at 0.283.
  - Next: a ceiling for single-row scenarios (`rt6Aliasing` reads per-robot rows only), measured on training states first.
  - Then possibly a feature for the second pedestrian's timing, declared first.
- **The reactive agent still stalls on 5 of 60 fresh seeds.** These were not traced. A robot boxed in by a parked robot
  (training seed 123) is one known case.
- **Not done here:**
  - The bundles were not rebuilt. No bundled file changed.
  - The wiki and roadmap lines were not edited.
  - `check_colearn` now also runs the `rt8` retests, so its `docs/perf/checkers-baseline.json` row should be re-measured
    quiet (coordinator).
