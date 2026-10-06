# ROBOTRAIN-2 → next

- Give the parishes app a WebXR session loop and call `window.__parishTest.teleop.xr(frame, refSpace)` from its frame callback;
  then drive the pad headlessly on port 9052 with a cobot site in view and capture the rig following (CAPTURE's clip).
- Put the cell-entry pose path on the pad (a `scenario` option on `rtMountTeleop`: the pad's y axis is the body along the
  approach, the hand snaps to the nearest `RT_CELL_CONTROLS` entry).
- Wire `colLocalDemos` through `vbColearnProvider({ demosFor })` so a consented adult learner's own takes can train the provider
  (local only; revoke must retrain or drop the cached model — add a `vbColearnForget()`).
- A learned anomaly check beside the governor's rules on COLEARN-driven runs (VBRIDGE's "Left"), measured on the two AMR halts.
- `rtCompare` on the cobot zone set-up task (a pose that turns the dials and walks the zone) for a third task.
