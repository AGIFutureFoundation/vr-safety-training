# ROBOTRAIN-8 memory (loop 10 round 5, `rt8`, port 9134)

- Base e252b25f (fast-forward). Branch `worktree-agent-af52e68e50a9d8fb4`. Commits:
  - e504b70b: the declarations (pair oversampling rule, threshold, `amr-local` features, rounds, port rounds, sidestep k = 3),
    committed before any run on 7061–7120
  - a1bf8b4a: the amended declarations (pairs drawn from every broken step; the reactive pallet look-ahead, the first
    productive open cell, the later robot yields) and `rt8-learn.js`. This was still before any held-out run; the evidence
    was training-side only.
  - 9da2b26f: items 1–3 measured once (`col_eval`'s `rt8` key, `check_colearn` section 13)
  - de0c659d: item 4 (`ag_eval`'s `reactive-sidestep`, the supplement, `check_roboscenarios` row 10)
  - then the docs (this file, `docs/consoles/ROBOTRAIN-8.md`, `tools/briefs/next/rt8-next.md`)
- Results, as measured on 7061–7120 (all in `docs/evals/colearn.json` `rt8` unless named):
  - **Per-step reward** (declared P < 0.25, oversampled pairs): AMR 0.517 and AMR hard 0.050. The rule filter on the same
    seeds is 0.650 / 0.083.
    - ROBOTRAIN-7's pairs at P < 0.5 give 0.883 / 0.117: the hint holds on AMR.
    - The oversampled pairs at P < 0.5 give 0.467 / 0.067.
  - **Route without search** (`amr-local`): ceiling 0.910 on training states. Round 5 is 0.317, gap 0.683.
    - On the same seeds: `amr-holders` 0.683, `amr-holders-local` 0.250, `amr-robots` 0.067.
  - **Port-lane hard**: rounds 0.783 → 0.517 → 0.867 → 0.750 → 0.967 → 0.717. The gap stays 0.283.
  - **Reactive AMR hard**: seeds 1–3 1/3 → 3/3 (the supplement's `reactive-sidestep`); 7061–7120 26/60 → 55/60. 0 rules
    broken.
- Footguns met:
  - **The commit trailer.** The session's default trailer names a model, and the repo's own model-identifier pattern
    (`check_colearn`'s `MODEL_ID`) matches both trailer lines; the session line matches because of its hyphenated product
    prefix. The brief forbids model identifiers in commit messages, so commits here carry no trailer, as earlier consoles'
    do.
  - **The worktree guard** refuses Bash commands that `cd` and then chain git with other tools, heredocs with a pipe, and
    background `&`. Write scripts to `$SP/loop10/rt8/` and run them as one plain command; run git alone.
  - **A declared rule can miss its own intent.** "About half the pairs hold a broken rule" was not reachable from pair i's
    own runs (23 of 200). Measure the training-side share first, and amend in a commit before any held-out run.
  - **ROBOTRAIN-7's AMR stalls were mostly a pallet dead end**, not robots blocking each other. Trace the training seeds
    before you write the rule.
  - **Never trace held-out failures.** It turns the range into a development set.
  - **A `perRobot` feature set that needs history** (`lastMoves`) must be trained and rolled out through `rt8Dagger` /
    `rt8Stateful`. `colPolicy` on its own sees no last moves (zeros).
