# Memory: ROBOTS-HD-3 (loop 10, round 8, `rhd3`, port 9165)

- Base a10f1ff8 (fast-forward). Branch `worktree-agent-a2c59da11f968a95e`. Commits: 6f9bc857 (§3c preview vs real),
  2085508a (cap rule + AMR room level), c1d96403 (port carrier), ed54ad3d (pane move + drive legs), b03f4517 (tolerant
  stills), then the docs commit.
- **The panel headless**: `vbMountDispatch` only needs `document.createElement`; a stand-in object (style, dataset,
  appendChild, setAttribute) is enough. With `reducedMotion: true` nothing auto-advances, so `step()` and `estop()` drive
  it. Of the 10 queued jobs, 5 reach TRANSACTION (101, 103, 106, 107, 108); 102, 104, 105, 109 and 110 are refused by the
  governor.
- **Why the preview and the real run agree**: `monitor()` depends only on the sample plus `held` (`setEstop`), and the
  panel never calls `setEstop`. The provider model is cached per scenario. One way they could diverge: a consented take
  recorded mid-run changes `vbLocal.demosFor` before `finish`. This is untested.
- **The room cap**: AVATARS-HD-5's `capLevel` uses each figure's actual crowd triangles, and the budget (540) only for
  the figures still to come. The robot-room rule is that every hidden mesh carries `rhdCanShow`.
- **The port window**: the picture plane is at z −5.99, 13 × 2 m, centred at y 2.0. The mullions are at x = −6.5 + i ×
  1.625, 0.08 wide, z −5.99 to −5.87. The hanging name sign covers the centre pane from the preset, and orange blocks of
  the window dressing sit at about x −3.6 and 2.3. The leftmost pane (x −6.5 to −4.875) is clear.
- **The relief**: a holder with the scale (s, s, depth / boxDepth) wraps the robot group, which carries the yaw; the
  squeeze comes after the turn.
- **Drives**: at load 30–47 a page screenshot can exceed 30 s. Use `shot(page, file)` (120 s, not fatal). Each leg opens
  a fresh page for about 1–3 minutes.
- **Sandbox**: loops over shell variables and `cd` into other folders are refused; run each command plainly from the
  worktree. Helper scripts live in `$SP/loop10/rhd3/` (hidden.mjs, figtris.mjs, portbox.mjs) and take the worktree path
  as their argument.
