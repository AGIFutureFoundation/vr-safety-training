# ROBOPROG memory

- Programme: `WebXR/shared/rp-programme-data.js` (data) + `rp-programme.js` (functions, imports competency.js only).
- Generator `tools/gen_robotics_programme.mjs` → `WebXR/robotics/programme.html`, `docs/robotics-programme.md`. Rerun after any
  data or catalog change; the gate fails on a stale coverage line.
- Gate `tools/check_robotics_programme.mjs` (684 checks; ~1.6 s). Eval: robot-station coverage 15/30 → 30/30.
- New stations: `rp-teleop-demonstration-collection` (98), `rp-robot-policy-evaluation-review` (98),
  `rp-construction-drilling-robot-setup` (99), `k12-rp-how-a-robot-knows-to-stop` (96, from `tools/k12-data/rp-robot-stop.json`).
- COLEARN loop is guarded: `rpLoop({ dx, col })`; 1/5 live until `col-learn.js` merges, then rerun the generator.
- Footgun: a `?fault=…-hit(&|$)` regex reads as a function call to check_imports — read the query with URLSearchParams.
- Homepage line lives in `tools/gen_home.mjs` (`#hm-robotics-programme`), not hand-edited in index.html.
