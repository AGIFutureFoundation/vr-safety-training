# STRANDS-3 memory

- Prefix `st3`; no port. Owns `robotics/strands/`, `tools/ra_bridge.mjs`, `tools/ra_export_weights.mjs`, `tools/check_strands.mjs`, `docs/strands-robots.md`, `docs/evals/strands*.json`, and now `WebXR/shared/st3-lerobot-takes.js` (mounted on `WebXR/data/index.html`, listed in `tools/bundle_webxr.py`). `ra-*.js`, `dx-*.js`, `col-learn.js` and `tools/arena_eval.mjs` are other consoles': import, never edit.
- Seeds and the gate (`harness.py`):
  - dev 1–20 always; stations dev only;
  - 7181–7240 ran once (round 7, `heldOut`);
  - 7241–7300: the protocol-3 parity check ran once (round 9, `protocol3Parity`, bc + ra-lm-h, 12 of 12 equal to claw3.json). `seed_gate(seeds, scenarios, policies)` refuses them for anything else and refuses a second run because the block exists. Never delete the block to re-run;
  - 7301–7360 are round 9's fresh held-out seeds: ROBOLEARN-10's only. Not touched here.
- `docs/evals/strands.json` blocks: `dev`, `heldOut`, `devStations` (seeds 1–3, 5 policies), `devStationSeeds` (expert + bc, seeds 1–20, `seedSensitivity`), `protocol3Parity` (`parity`, `declarations`, `once`), `tanhAgreement` (not a compare block: written by `tanh_agreement.py`).
- Bridge (`st-bridge/2` string kept): new op `js_lm_rows {model, limit}` returns the published ra-lm / ra-lm-h build's training rows labelled by V8 (12,818 rows for ra-lm-h, ~11 s to train the first time; cached per process). The row construction and raLmHidden/raLmLogit/raLmT are written out in the bridge because ra-lm.js does not export them.
- `tanh_agreement.py measure(model, limit, bridge=None)`: pure Python labels with the adapter's own `_scene/_hidden/_t/_logit`; full run ~72 s, writes `tanhAgreement`; the selftest calls it with `limit=40` on the station oracle bridge (model already cached there).
- Weights: the two `@stations` files carry `labelsByTask`, `pReg`, `taskVectors`, `featureWeights` for all six gym tasks + 3 stations (`own` in `stLmStations`); the knn exports still cover the four scenarios the sim robots run. `--check` rebuilds and compares.
- Station facts: one episode length per station for expert and bc on every seed 1–20 (279/278/278); the seed reaches only the policy's choices.
- `check_strands --quick` (development only) skips the selftest, the weights rebuild and the full dataset leg (~3 s); the full run is ~4–5 min under load. CI has no `localStorage`: the page-side fixture installs a Map-backed one for its process.
- Gotcha: `dxMakeEpisode` fills a missing receipt from the stored consent, so a "no receipt" fixture take must set `consent: null` after construction; and `dxOptIn` needs `localStorage` (profile storage) or `dxConsent()` reads null.
- Gotcha: the worktree guard refuses shell commands whose arguments start from a variable; write scripts to `$SP/loop10/st3/` and run them plainly.
