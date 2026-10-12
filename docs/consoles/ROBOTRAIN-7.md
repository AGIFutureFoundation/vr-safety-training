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

**Item 4, a non-privileged reactive agent.** Written and tried on training seeds 101–130 only, then measured once on the
supplement's seeds 1–3. Its rules read only a declared list of observation fields (the safety fields plus the task's own
position and goal); no search, no planner.

## Cycles

## Evals (before → after)

## Checkers run

## Seams

## Left
