# ARENA-2 memory (loop 10 round 7, `ra2`, port 9151)

- Base 40d97421, fast-forwarded. Branch `worktree-agent-a20f13f1ab69f02ad`. Commits:
  - 8ea01d3c: `docs/evals/arena-declared-r7.json`, at 18:48, before any run on 7181–7240. STRANDS and CLAW-2 cite it.
  - 19f654a9: ra-lm-h (hidden layer), the cobot fix (`interruptText`), `arena_eval --r7`, and amendment 1 (before the run)
  - 3325b914: `arena.json` `retest7`, the single held-out run
  - aa0d56e6: the stations in the dataset (`ra-ds/2`, schema `@2`) and `check_arena` 9
  - 0affc151: `ra-takes.js`, the data-page button, the drive and `check_arena` 10
  - then the docs
- Results, as measured (`docs/evals/arena.json` `retest7`):
  - ra-lm-h − bc on AMR + port: −0.067 [−0.152, 0.018], no claim
  - ra-lm-h − ra-lm on the same: +0.133 [0.028, 0.235]
  - over all 12 scenarios: −0.018 [−0.060, 0.025]
  - held-out tasks: −0.011 [−0.111, 0.089]
  - cobot station: 0/10 → 10/10
  - 83,756 of 83,756 steps governor-checked; 0 physical
- Footguns met:
  - **The worktree guard** refuses `cd` chained with other tools, heredocs after a `cd`, `awk`, and `$VAR` as an argument.
    Write patch scripts to `$SP/loop10/ra2/` and run `python3 <script> <repo>`; run `git -C <repo>` commands one at a time.
  - **Joint training couples tasks.** A station-only input change moves the gym weights. Training with or without the
    stations also changes the gym numbers: ra-lm-h AMR dev scored 18/20 gym-only and 12/20 with the stations. Always
    develop in the declared setup (with the stations).
  - **DATAWORKS' `store.put` validates.** A human take without a receipt never reaches the store. To test a refusal
    downstream, write it into the backend directly.
  - **Station sample episodes are about 120 KB each** (283 lines of about 430 bytes). Three whole ones break the 1.5 MB
    folder cap.
  - **`check_arena` check 1 counts `raModels()`.** It now expects 9, with the round-6b eight named in `RA_MODELS_R6`.
  - **The held-out run is fast:** 1,710 episodes in 78 s. The station suite loads in about 10 s.
