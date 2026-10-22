# ROBOTRAIN-6 memory (loop 10, `rt6`, port 9095)

- Base 43d3e3f6 (fast-forward). Branch `worktree-agent-ac88e5fc01e1b5c89`. Commits:
  - d63438cd: `rt6-learn.js` (reward model, reward-filtered cloning, DAgger), the grouped k-NN, `col_eval` sections,
    `check_colearn` 11–12
  - ab39812b: `ag_eval --scenarios`, the supplement rows, `check_roboscenarios` row 10
  - 85773db1: the lineage SVG on the policy report
  - baf414fe: opt-in route features `COL_FEATURE_SETS["amr-path"]` and the DAgger arm with them
  - 8dca89db: `rt6Pick` rename, for `check_imports`
  - 7b504458: the docs (this file, `docs/consoles/ROBOTRAIN-6.md`, `tools/briefs/next/rt6-next.md`, the wiki lines)
  - a8f9cc4a: reward-weighted votes (`colTrain` `rowWeight`, opt-in): AMR 0.600, AMR hard 0.067
  - then the docs refresh for that arm
- Results, as measured (all in `docs/evals/colearn.json`):
  - `preference`: AMR reward-filtered / rule / unfiltered 0.483 / 0.817 / 0.600; AMR hard 0.050 / 0.050 / 0.117. Reward-weighted votes: AMR 0.600, AMR hard 0.067.
  - `dagger`: AMR hard 0.05 after 5 rounds; aliasing ceiling 0.696.
  - `dagger.pathFeatures`: 0.417 after 5 rounds, gap 0.583, ceiling 0.745.
  - The supplement: three hard variants, random 0/3 and expert 3/3 each.
- Footguns met:
  - The k-NN scanned every row. DAgger's aggregate (about 22k rows) made 5 rounds take 74 s. Rows are now grouped by feature
    vector (WeakMap beside the model). The ordering key is (distance, row index), so the neighbours are the same. If you
    change `colNeighbours`, regenerate `colearn.json` and `cmp` it: the byte-for-byte check is the proof of equivalence.
  - `colTrain` keeps 4000 rows by default. DAgger passes `maxPoints: 1000000`, so no labelled state is subsampled away.
  - A model carries `featureSet` only when one is given. Do not add the key to default models: it would change every
    `modelHash`, and with it `exports/robotics` and `check_roboexport`.
  - The route feature's breadth-first search per call cost 18.9 s. The cached distance field per (grid, goal, blocked cell)
    gives the same first move: the first N/S/E/W direction with distance d−1.
  - `check_imports` flags a local helper named like another module's top-level function (`pick`). Prefix locals too.
  - `ag_eval --scenarios` without `--stations` would run all 721 stations. Pass the 16 supplement station ids.
  - The worktree guard refuses compound shell commands that mention git or write outside the worktree. Write scratch
    scripts with the editor and run them as single commands.
  - Commit trailers: `Co-Authored-By: Claude <noreply@anthropic.com>` and the session line. The brief forbids a model
    identifier in commit messages.
- `check_colearn` now runs about 25 s of CPU (61 s wall under load). `docs/perf/checkers-baseline.json` was not touched.
