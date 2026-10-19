# Memory: ROBOTS-HD-4 (loop 10, round 9, `rhd4`, port 9174)

- Base 61d85871 (fast-forward, confirmed). Branch `worktree-agent-a3e2b429027c88d66`. Commits: b3c947b0 (items 1 and 3, one
  commit because `check_robots_hd.mjs` carries both sections), 149a33ca (merge of ENV-HD-9's 7d24e92f only), then the docs.
- **The lane.** `rhdLaneDrive(lane, mover, scale)`: `mover` is the relief holder (or the robot's group at full size); the lane
  runs along the room's x in yard metres, the holder's scale maps it to the pane. The carrier's relief is 0.80 m wide in a
  1.545 m clear pane (mullions at x = −6.5 + i × 1.625, 0.04 m margins): 5.81 m each way touches, 5.5 m is 19 mm short.
  `rhdRoomLights(room, state, pose, dt)`: pass dt in a check; the page passes none, so `room.rhd.clock` (seconds) drives it,
  capped at 0.1 s. `room.rhd.reducedMotion` comes from `matchMedia` at dress time; set it in a check.
- **Why the pin was needed.** `vbColearnModel`'s key is `${sc}|${n}|${seed}|${skill}|${tag}` and the local source's tag is
  `own:${ids.length}:${ids}`; `vbLocal.refresh()` runs on the consent panel's change and after a take, so between `approve()`
  and `finish` the provider can hand back a different model. Un-pinned, the real run's actions differed from the preview's in 4
  of 8 runs with a synthetic own-take (skill 1, n 6). `pinProvider()` memoises `(policyId, scenario, seed)` for one job.
- **§3c's mid-run case** compares steps BEFORE the supervisor's stop (the stop step itself is "estop" in the real run and
  "continue" in the preview, by design); my first draft compared `k + 1` steps and read 6 false mismatches.
- **check_hd9 §3** (ENV-HD-9) requires something non-void within `ray.far = 10` of z −3 through the hole on every tier; the yard
  picture at 20–40 m out would fail it. Posted at 01:45; the fix is theirs (far ≥ 45).
- **Load.** 5–28 all round; `check_parse` was killed at 590 s when run beside four other checkers; alone it passes.
- **Sandbox.** Shell variables in paths, heredocs with `cd`, and `for` loops are refused; write helper scripts with the Write
  tool into `$SP/loop10/rhd4/` and run `node <script> <worktree>` plainly. `git config user.*` can hit a lock held by another
  console's worktree; `git -c user.email=… -c user.name=… commit` works regardless.
