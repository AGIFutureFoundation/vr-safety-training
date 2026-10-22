# ROBOTRAIN-8 → next (robot learning)

Read `docs/consoles/ROBOTRAIN-8.md` first: the declarations and their amendment, the Evals and the Left section. Also read
`docs/evals/colearn.json` `rt8`.

The ranges 7001–7060 and 7061–7120 have both been seen. **Use a fresh held-out range, for example 7121–7180.** Write every
rule, threshold, share and round count in your notes and commit them before any run on it. Measure the training-side
properties first (pair shares, aliasing ceilings, training-seed passes), and amend in a commit if they miss the intent. Report
each held-out result once, as measured. Never trace held-out failures.

1. **Why does ROBOTRAIN-7's per-step reward beat the rule filter on AMR when the oversampled one does not?**
   - At P < 0.5 on 7061–7120, ROBOTRAIN-7's pairs give 0.883 and the oversampled pairs 0.467 (rule filter 0.650).
   - The two models give waits opposite signs (+0.27 and −0.86).
   - On training data only, compare which steps each drops: waits, stalls, rule breaks.
   - Then declare one rule and test it once on the fresh range.
   - Check: a new arm beside `rt8.stepReward`, and a `check_colearn` line. The rows above stay byte-identical (the old body
     must be a prefix of the new file).
2. **Close the route gap without search.**
   - `amr-local`'s ceiling is 0.910, but its rounds end at 0.317 and swing 0.20–0.45.
   - Declare one change first: more rollouts a round, keeping every round's model and scoring a fixed choice, or feature
     weights. Run it once.
   - Report it beside `amr-holders-local` (0.750) and `amr-robots` (0.933).
   - Check: a `check_colearn` section 13 line with the per-round figures.
3. **A ceiling for single-row scenarios, then the port lane.**
   - `rt6Aliasing` reads per-robot rows only, so the port rounds (ending at 0.717, gap 0.283) have no ceiling.
   - Extend it, or add `rt9Aliasing`, for `F.of(obs)` scenarios, and measure the port ceiling on the rounds' training states.
   - If it is low, declare a feature for the second pedestrian's timing and run the rounds once.
4. **The reactive agent's last stalls** (5 of 60 fresh seeds, untraced).
   - One known case: a robot boxed in by a parked robot, with shelves on both sides (training seed 123).
   - Trace training seeds only (for example 131–230), declare the rule, then measure once on the fresh range.
   - Check: `check_roboscenarios` row 10, and `rt8.reactive`, or a new key.
5. **Housekeeping.**
   - Re-measure `check_colearn` quiet for `docs/perf/checkers-baseline.json` (coordinator only); it now also runs the `rt8`
     retests.
   - Add the round-5 rows to `docs/wiki/Roadmap-and-Changelog.md`, then regenerate `guide-kb.js`.
