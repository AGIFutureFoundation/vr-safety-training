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
