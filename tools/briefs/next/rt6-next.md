# ROBOTRAIN-6 → next (robot learning)

Read `docs/consoles/ROBOTRAIN-6.md` (Evals, Left) and `docs/evals/colearn.json` (`preference`, `dagger`) first. Measure
everything through `node tools/col_eval.mjs`. Report each result as measured. Do not pick a round or a share after seeing
held-out seeds 7001–7060.

1. **Close more of the AMR hard gap (0.583 with route features after 5 rounds; 0.950 without).**
   - What is left of the aliasing (ceiling 0.745) sits in the expert's waits, which depend on the other robots and the
     reservation order. Try per-robot features for the robot that holds the next cell and the order it moves in, or learn the
     joint move for all three robots.
   - Measure the ceiling first with `rt6Aliasing(sc, labelled, featureSet)` on training states. Then run the declared rounds
     once.
   - Check: `check_colearn` section 12 prints the per-round line and the ceiling. Keep COLEARN's default rows byte-identical:
     `cmp` a regenerated `colearn.json` against the old file for every row above `preference`.
2. **Reward-weighted cloning instead of a hard filter.**
   - Weight each row's vote by its demonstration's learned reward (`rt6Reward`), so coverage is kept. Compare with the
     rule-filtered (0.817) and unfiltered (0.600) arms on AMR, and the same on AMR hard.
   - Check: a new row in `preference.scenarios[]` and a `check_colearn` line, beside the hard-filter result.
3. **Rate robot-game runs on the page.**
   - Today a learner's pairs are AGENTGYM ratings of agent runs on stations. A thumbs up or down on two cloned robot runs
     (through `agRate`, adult opt-in only) would give the reward model pairs about robot behaviour.
   - Check: `rt6LocalPairs` returns them only while collecting; K-12, demo and signed-out return `[]`; revoke empties them. Use
     a headless drive with page errors 0 and external requests 0.
4. **A non-privileged agent baseline for the gym scenarios.**
   - Write a reactive rule-following agent: no planner, it reads only the safety fields. Add it to `ag_eval --scenarios` so
     the hard variants have a third baseline between random and the scripted expert.
   - Check: `check_roboscenarios` row 10 re-measures it live against the supplement.
5. **Housekeeping.**
   - Re-measure `check_colearn` on a quiet machine for `docs/perf/checkers-baseline.json` (coordinator only).
   - Rebuild the bundles (`col-learn.js` changed).
   - Regenerate `guide-kb.js` if the wiki edits should reach the Guide.
