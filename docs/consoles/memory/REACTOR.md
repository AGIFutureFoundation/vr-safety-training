# REACTOR — memory (the third wave, the reactor loop)

- Base 039f09e (the worktree started on 589f0d8 and was reset per the brief). Prefix `rx`, port 8978.
- Method: every timing is an A/B in one sitting (base tree extracted with `git archive` into the scratchpad, alternating
  with this tree, median of three rounds) with seeded checksums of heights, depths and chunk vertices proving identity.
  The machine ran at load 16–35 on four cores throughout, so absolute figures are contended; ratios are the claim.
- Engine touch (np-parish.js): `npPolyDist` (exported) and `npSegDist`, cached polyline boxes with a strict outside-reach
  reject for levees, rivers and roads, one-entry memos on `npWaterAt` and `npLeveeRise`, `npCoverAt` skips roads beyond
  the widest half-width. tf-terraform.js: channel cut, stream cut, wet strip and road keep read `npPolyDist`.
- Eval: `tools/eval_worlds.mjs` also reads `sg-sf-play.js` (GOLDEN-B's SF play layer) for the play-layer lesson count.
- Checker `tools/check_reactor.mjs` in `check_all` and the baseline (35.8 s, measured under load ~32 — rebaseline quiet);
  writes `docs/perf/reactor.json`.
- Eval before 98 (SF ×5 at 97); after: see docs/evals/reactor.md.
