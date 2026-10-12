# ROBOTRAIN-7 memory (loop 10 round 3, `rt7`, port 9113)

- Base 41e41366 (fast-forward). Branch `worktree-agent-a8b3073cca590f64b`. Commits:
  - 891fbff4: the declarations (window, rater, drop rule, features, rounds, seeds), committed before any held-out run
  - 77ff7377: the reactive agent (`rt7-learn.js` `rt7ReactivePolicy`), `ag_eval --scenarios` and the supplement,
    `check_roboscenarios` row 10
  - 9a78eca5: the per-step reward (`rt7EvalStepReward`), `COL_FEATURE_SETS["amr-robots"]`, `rt6Dagger` `aliasingSets`,
    `col_eval`, `check_colearn`
  - 46013727: robot-run ratings on the teleop pad (`rt7RobotRun`, `rateRuns`/`rate`/`ratings`), `ag-feedback.js` in the
    parishes bundle, `check_colearn` consent lines, `tools/drive_rt7_ratings.mjs`
  - 28ab0904: the ablation's declaration; 72727125: the ablation (`amr-holders`)
  - then the docs (this file, `docs/consoles/ROBOTRAIN-7.md`, `tools/briefs/next/rt7-next.md`)
- Results, as measured (all in `docs/evals/colearn.json` unless named):
  - `preference.scenarios[].stepReward` (declared P < 0.25): AMR 0.550, AMR hard 0.017, against the rule filter 0.817 /
    0.050. The sweep's P < 0.5 gave 0.917 / 0.083; it was not declared, so it is not a result.
  - `dagger.robotFeatures`: 0.85 → 0.917 → 0.917 → 0.9 → 0.917 → 0.983. The AMR hard gap goes 0.583 → 0.017. Ceiling first,
    on the `amr-path` training rows: 0.745 → 0.959.
  - `dagger.holderFeatures` (ablation, no detour move): 0.517, gap 0.483, ceiling 0.796. The detour move carries most of the
    gain.
  - The supplement's `perScenario[].reactive`: drilling 3/3, port 3/3, AMR hard 1/3.
  - Ratings: refused and empty for K-12, demo, signed-out and after revoke; an opted-in adult's 2 ratings give 1 pair. The
    drive on the built page: page errors 0, external requests 0.
- Footguns met:
  - **The worktree guard** refuses a Bash command when a variable stands where an option may go (`sed -n 1,57p $SP/...`),
    when the command is a heredoc with a subshell, and when it chains `sleep`. Read files with the Read tool. Write edit
    scripts to the scratchpad and run them as single `python3 <file>` commands.
  - **A navigation can drop an in-flight write.** The first ratings drive clicked both thumbs and navigated 0.8 s later. The
    second IndexedDB write was still in flight on the loaded machine and was lost; an awaited run stored both. The drive now
    waits until both cards are marked (`dataset.rated`), and only then reads or navigates.
  - **`__parishTest.dx.stored()` and the pad's `ratings()` can disagree mid-write.** They read the same store, but at
    different moments.
  - **Bundles.** `ag_eval` and the drive need a parishes bundle that includes `ag-feedback.js` before `rt-teleop.js`. Rebuild
    with `python3 tools/bundle_webxr.py parishes` (about 30 s). Dist is tracked, but leave it to the coordinator's rebuild:
    the local rebuild was not committed.
  - **`check_parse` is slow** here: 184 s under load, because it parses every shipped module, dist included.
  - **Keep the byte-identity proof.** Save the base `colearn.json` to the scratchpad first, then compare the text before
    `"preference"` and count diff deletions (0).
  - `check_interface` loads the SOURCE page (`parishes/parishes.html`), not dist, and takes `UX_PORT` (9113 here). It
    scans only visible controls, so the thumbs (shown after "Rate two robot runs") are measured by the drive's step E
    instead. On this base its one failure, `me:vc-voice-character:244x36`, is a round-2 line already fixed on the head
    (d5054257).
