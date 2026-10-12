# ROBO-ARENA memory (loop 10 round 6b, `ra`, port 9145)

- Base 230105b7 (fast-forward). Branch `worktree-agent-a462c26ed1cdbebc9`. Commits:
  - c720e927: the contract (`raModels`, `raScenarios`, `raRun`, `raLeaderboard`), at 17:40, with an `ra-lm` stub
  - 00e20dce: the small model, `tools/arena_eval.mjs` and `docs/evals/arena-declared.json`, before any held-out run
  - 54d8ce84: `docs/evals/arena.json`, the single held-out run (7121–7180; stations 7121–7130)
  - ced2458d: the dataset (`tools/ra_dataset.mjs`, `exports/robotics/arena/`), and `rxDiff` skipping `arena/`
  - 304a9213, 74618706: the panel and its drive; a173110d: `check_arena`
  - then the docs
- Results, as measured (all in `docs/evals/arena.json`):
  - **Gym leaderboard:** expert 1.000, reactive 0.939 (6 scenarios), dagger-r3 0.859, bc 0.837, dagger-r1 0.809,
    step-reward 0.802, ra-lm 0.757, random 0.
  - **Small model against the clone:**
    - on the held-out tasks, −0.022 [−0.122, 0.078]
    - over all 12 scenarios, −0.093 [−0.139, −0.047]
  - **The text** matters only on the stations: blanked, the robot-cell and AMR stations drop from 10/10 to 0/10.
  - **The governor** checked 179,248 of 179,248 steps; 0 physical.
- Footguns met:
  - **The worktree guard** refuses a `cd` chained with other tools, `for` loops, and `$VAR` used as an argument. Run each
    tool alone with absolute paths, and put scripts under `$SP/loop10/ra/`.
  - **ROBOEXPORT's guards:** `rxDiff` fails on any extra file under `exports/robotics/`, and `check_roboexport` caps the
    folder at 1.5 MB. Commit samples, not dumps.
  - **A per-scenario cache key must carry every option that changes the model.** The ablation silently reused the text
    model until the key carried `blankText`.
  - **`rt7ReactivePolicy` returns null** off drilling, port and AMR.
  - **DX episodes** keep their seed in their metadata, not at `ep.seed`; key dedup on content.
  - **The machine's clock** ran faster than expected: the whole held-out run took under a minute at nice 10.
