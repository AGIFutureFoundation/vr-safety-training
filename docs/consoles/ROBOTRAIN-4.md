# ROBOTRAIN-4 — the open proofs closed in code, the cell ghost walks, the tasks get harder (`rt4`, port 9071)

Loop 8 (SmartCiti.X Holodeck · Powered by AGI Corp). Base b7caa08e (the pushed head of PR #1). Builds on ROBOTRAIN-3
(`docs/consoles/ROBOTRAIN-3.md`: the learner's consented takes train the agent-jobs provider; the open page-level proof),
ROBOSCENARIOS (the drilling and port gym scenarios), COLEARN (`col-learn.js`, `tools/col_eval.mjs`, `docs/evals/colearn.json`)
and DATAWORKS (`dx-data.js`). Read those first; this file adds to them.

This console ran out of its model budget mid-loop. The code and the measured results below were committed from its worktree
by the coordinator after the five neighbouring checkers passed there (`check_colearn` 46/0, `check_robotics` 19/0,
`check_roboscenarios` 10/0, `check_robotrain` 291 checks, `check_dataworks` 59/0). What it did not finish is listed under
**Left**, with nothing claimed for it.

## What is here

1. **The recorder's store write is observable** (`WebXR/shared/dx-data.js`). `dxFlush()` runs every parked idle-slot write now
   and resolves with the count; flushes queue behind one another, so the pad's `onTake` and the Me tab's refresh never race the
   same writes. The store's `put()` is serialised (read list → save list was never atomic on either backend; two concurrent puts
   could drop an episode). The write also happens on `pagehide` and `visibilitychange` (hidden), not only on an idle slot. The
   privacy behaviour is unchanged: nothing is written unless the learner is collecting (adult, opted in, not K-12, demo or
   signed-out), and revoke still deletes.
2. **The cell-task ghost drives a walker, not only the arm** (`WebXR/shared/rb-env.js`, `rt-teleop.js`, `WebXR/parishes/js/app.js`).
   The cell-entry observation carries `walker { at, hand, control }`; `rtFollowRig(rig, obs, { walker })` hands a cell observation
   to `rtFollowCell`, which poses the cell arm by the robot's mode (sweeping at full speed, square and slowed in the warning zone,
   parked when protective-stopped, e-stopped or locked out) and stands the walker figure on the approach with its hand at the
   control in use. The parishes app builds the figure (`npWalkerFigure`: two boxes beside the rig, hidden until a take or the
   ghost moves it; no new mesh in the site budget) on a cell site only. `RT_CELL_CONTROLS` is now the sim's own control table
   (`RB_CELL_CONTROLS` in `rb-robotics-data.js`) minus the rest pose, so the pad and the sim cannot drift apart.
3. **Hard variants, honestly measured** (`rb-env.js` `variant: "hard"`, `tools/col_eval.mjs`, `docs/evals/colearn.json`
   `variants`). Drilling gains a second person who enters the barricade at a random step and a bit that wears at a random rate;
   the port lane gains a second pedestrian with random crossing timing and a lane obstruction. Both seeded. The k-NN clone was
   trained on synthetic demonstrations as before and scored on 60 held-out seeds:

   | Scenario (hard) | Demos kept | Random | Clone | Expert | Gap to expert |
   |---|---|---|---|---|---|
   | `rb-construction-drilling#hard` | 20 of 40 | 0.000 | 1.000 (clean 1.000) | 1.000 | 0.000 |
   | `rb-port-gantry#hard` | 24 of 40 | 0.000 (clean 0.233) | 0.717 (clean 1.000) | 1.000 | **0.283** |

   The port result is the point of the exercise: with a second pedestrian and an obstruction the clone that scored 1.000 on the
   base lane completes 43 of 60 runs, and every run it completes is clean. It fails by waiting, not by driving into anyone. The
   gap is reported as it is; no tuning was done to close it.

## Evals (before → after)

| Measure | Before (b7caa08e) | After |
|---|---|---|
| Scenario variants with a measured random / clone / expert result | 2 (base only) | **4** (`base` and `hard` for drilling and port) |
| Clone-to-expert gap stated on `hard` | — | drilling 0.000; port **0.283** |
| Ghost tasks that move the product's own 3D scene | 1 (arm) | **2** (arm; cell walker and arm) |
| Store writes that can be awaited | 0 | `dxFlush()` resolves with the count; writes serialised |
| Open page-level proof (the card says "your 3 takes" in the headless page) | 1 open | **still open**; see Left |

## Cycles (as recorded in the heartbeat and the worktree)

1. Reason: ROBOTRAIN-3's proof failed because the recorder wrote on an idle slot the busy page never granted; check = a
   `dxFlush()` the app can await → Act: parked writes in a set, `dxFlush()` runs them, `pagehide`/`visibilitychange` hooks →
   Observe: `check_dataworks` 59/0, recorder still inert without consent.
2. Reason: two callers can flush at once; check = no interleaved read-save → Act: a flush chain and a serialised `put()` →
   Observe: `check_colearn` 46/0, `check_robotrain` 291 checks.
3. Reason: the cell ghost moved only the arm; check = `rtFollowRig` with a cell observation moves a walker node → Act:
   `walker` in the observation, `rtFollowCell`, the figure in the app → Observe: the pad's cell take and the ghost move the figure;
   `check_roboscenarios` 10/0.
4. Reason: both base clones hit 1.000, which shows learnability, not difficulty; check = a seeded `hard` variant with a measured
   gap → Act: variants in `rb-env.js`, `col_eval.mjs --variant hard` → Observe: drilling 1.000 / 1.000, port 0.717 / 1.000 on 60
   held-out seeds; written to `colearn.json` `variants` through COLEARN's tooling.
5. The console's budget ended here. Checker section 9 and the headless page drive were not run.

## Left

- **The page-level proof.** The flush exists, but the headless drive (opt in → 3 takes → the provider card says "your 3 takes" →
  revoke → "synthetic", store 0) was not run in the built page this loop. Until it is, the roadmap's Open item stays open.
- `tools/check_robotrain.mjs` section 9 (the walker, `dxFlush`, the hard variants) and `check_roboscenarios.mjs` rows for the
  variants. The variants are in `colearn.json`; no checker pins them yet.
- The hard variants have no teleop task of their own in `RT_TASKS` and no AGENTGYM baseline.
