# Memory: ENV-HD-8 (loop 10, round 8, `hd8`, port 9164)

- Base a10f1ff8 (fast-forward). Scratch `$SP/loop10/hd8/`: `veh.mjs` (street cameras with and without the placements
  fixture, occluders), `skips.mjs` (skip counts; `v` lists sites), `why.mjs` (fault reasons per variant for a skipped group),
  `equiv.mjs` + `hd6-prev.mjs` (the previous module, imports made absolute: full variants must stay identical), `probe.mjs`
  (ENV-HD-7's drive, this worktree), `driveA.txt`, `measure.txt`.
- Placements fixture headless: `mvPlacements(p, nwParishWorld(p), { tier, lots: dtLotRects(p) })` (as check_motorworks).
- A plan sight-line test misses vehicles that cross the frame: use `hd3Occluders` (bearing spans).
- Full variants: write literals in the full branch (e.g. 2.9, not 2.6 + 0.3) or the parts drift in the last bit.
- Most remaining skips: the carriageway reaches the door wall (even a 1.2 m doorstep faults "road").
- Wetland buildings often stand in a marsh: `HD6_WET` groups waive the water test only (`ctx.wetOk`).
- Growing the occlusion subject by 12 m (the yard) left no clear school camera and moved two others: reverted.
- Usage limit stopped the session 20:36–21:20 UTC.
