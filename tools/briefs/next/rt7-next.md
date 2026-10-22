# ROBOTRAIN-7 → next (robot learning)

Read `docs/consoles/ROBOTRAIN-7.md` first: the declarations, the Evals and the Left section. Also read
`docs/evals/colearn.json` (`preference.scenarios[].stepReward`, `dagger.robotFeatures`, `dagger.holderFeatures`).

Measure everything through `node tools/col_eval.mjs`. Before you run anything, write every share, threshold and round
count in your notes and commit them. Do not pick a round, share or threshold after seeing held-out seeds 7001–7060. Report
each result as measured.

1. **Test the per-step reward properly.**
   - Under the declared rule (P < 0.25) the per-step reward gave 0.550 on AMR and 0.017 on AMR hard, below the rule filter.
     The fit saw few windows with a broken rule.
   - Declare two changes before running anything:
     - pair windows so that about half the pairs contain a broken rule (from the same synthetic runs);
     - a fresh held-out range, 7061–7120, on which the P < 0.5 hint from the sweep (0.917 on AMR) is tested once beside the
       declared threshold.
   - Check: a new `stepReward` arm and a `check_colearn` line. COLEARN's rows stay byte-identical: compare the text before
     `"preference"` and count diff deletions (0).
2. **Learn the route instead of being given it.**
   - `amr-robots` reaches 0.983 on AMR hard, but mostly through its detour move, a hand-written shortest path around the
     robots. Without it (`amr-holders`) the same rounds end at 0.517.
   - Try a local feature the clone can use without a planner: the free cells within two steps and the other robots' last
     moves. Measure the ceiling on training states first, then run the declared rounds once.
   - Check: `check_colearn` section 12 prints the per-round line and the ceiling.
3. **Make a rated pair carry information.**
   - On the pad, both rated runs of the synthetic clone passed in 26 steps, so the pair's features are identical.
   - Rate the clone against a second policy (for example the reactive agent's style of run or a lapsing stand-in), each
     labelled for what it is, or let the learner pick two different seeds.
   - Check: re-run `node tools/drive_rt7_ratings.mjs 9113` on a rebuilt page; it must keep page errors 0 and external
     requests 0. In `check_colearn`, the pair's two feature rows must differ.
4. **A reactive agent that does not deadlock on AMR hard** (1/3 today, 2 at the step cap).
   - A wait-then-sidestep rule when the same robot has blocked the next cell for k ticks, with k declared first.
   - Measure on training seeds 101–130, then once on seeds 1–3. Check: `check_roboscenarios` row 10 re-measures it live.
5. **Housekeeping.**
   - Rebuild the bundles (`rt-teleop.js`, `col-learn.js` and the parishes list changed).
   - Re-measure `check_colearn` quiet for `docs/perf/checkers-baseline.json` (coordinator only).
   - Add the loop-10 round-3 rows to `docs/wiki/Roadmap-and-Changelog.md`, then regenerate `guide-kb.js`.
