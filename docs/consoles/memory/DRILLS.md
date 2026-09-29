# DRILLS memory (Packs run, third wave)

- Base 039f09e. Modules: `WebXR/shared/dr-drills-data.js` (DR_DRILLS, DR_PLACES), `WebXR/shared/dr-drills.js` (registry, scoring,
  debrief, passport record, DEAN module shape, parishes mount). Checker `tools/check_drills.mjs` (pure Node, ~200 ms).
- Objectives are `{ station, step }` pairs: the step id must be a step (title + cue) in `WebXR/smartcity/js/sims/<station>.js`.
  The catalog's `sources` arrays are empty in this tree; the sourced standards live in each station's `certification`.
- Mounted in the parishes app (`#menu-drills`, `window.__parishTest.drills`); NEWTON's crash card offers `dr-traffic`.
- Eval before: 15 subjects, mean 98, 10 findings.
- Commits: 948460c (drills + checker + wiring), then the live pass and reduced-motion check, then the card-coverage check.
- `check_drills --live` takes ~110 s (two page loads); the plain run is pure Node (~0.4 s) and is what check_all runs.
- Eval after: 15 subjects, mean 98, 10 findings (unchanged).
