# Memory: ENV-HD-7 (loop 10, round 7, `hd7`, port 9155)

- Base 40d97421 (fast-forward). Scratch `$SP/loop10/hd7/` (stills; `driveA.txt`, `driveB.txt`; `probe.mjs` shoots presets
  and non-preset kind sites — for a non-preset site it wraps `npRenderer.render` because the app re-applies the preset
  camera every frame; `measure.mjs` gives per-tier cue mesh counts and per-kind fit counts; `cams.mjs` compares cameras
  with ENV-HD-6's `before-cameras.json`; `dbg*.mjs` show why a group is skipped).
- **Fitting** (`hd6FitCue`): groups, preferred side away from the board, then flipped, else skipped. Free-standing groups
  (`yard`, `pavilion`, `shed`, `bed`, `compound`) also keep clear of each other within a site; paths, lanes and roofs may
  meet them. `HD6_ON_BUILDING` (roof, trim, wallsign, entry) are exempt from the road and water faults only. Fallbacks
  (`wallsign`, `entry`) are built only when `canopy` was skipped.
- Fit order: presets first, then station count, then catalog order; a map-wide `taken` list keeps sites' cues apart.
- The school yard on the camera's side does not fit at mission-school-campus (board). The solver fix was NEWTON's cars
  (`mvPropPoints` slice(-3, -1) = the two car points); the bus (MOTORWORKS) is not reachable from the solver.
- Drive A ran before the utility/substation commit (orleans in-page 6,420 tris / 13 sites; headless now 6,888 / 14).
- `check_hd6` now ~20–34 s on a loaded machine (46 maps); baseline row raised to an estimate of 20 s.
