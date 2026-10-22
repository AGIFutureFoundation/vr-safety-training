# Next for ROBOTS-HD-3 (`rhd3`): brief for the next console

Read `docs/consoles/ROBOTS-HD-3.md` (Evals, Seams, Left) and `docs/consoles/memory/ROBOTS-HD-3.md`. Then read
`WebXR/shared/rhd-robots-hd.js` (`rhdAmr(…, room)`, `rhdStraddle`, `RHD_ROOM_ROBOTS`, `rhdDressRoom`'s relief),
`tools/check_robots_hd.mjs` §3c and §5, and `tools/drive_robots_hd.mjs` (`RHD_ONLY=rooms|port`).

Every rule of the loop holds:
- phone and headset never change, and balanced keeps today's rigs;
- assets are procedural and generic by kind;
- the light shows a state the page already has;
- the robot-room cap rule agreed with AVATARS-HD-5 stands: count every mesh that can be drawn, tag hidden meshes that a
  state can show with `userData.rhdCanShow`, and remove meshes hidden for good.

## Do
1. **A real view out of the port room** (with ENV-HD, which owns the shell). Cut the window opening in the north wall and
   put the yard picture 20–40 m out. Then stand the straddle carrier (`kind: "straddle"`, full size, no relief) in the yard
   at real scale, inside a stated budget.
   - Check: §5 port line (budget, room ≤ IX_BUDGET), and a still from the preset and from the window.
2. **The carrier moves.** It travels a lane in the yard view only while the port site is running, and holds when its
   beacons are amber or red (the room robots' rule for a moving robot).
   - Check: a headless walk of N steps where the carrier moves only when the light is green, N of N.
3. **Test the one known divergence of preview and real run.** A consented take recorded between `approve()` and `finish`
   could change the learned provider. Pin the provider model at `approve()`, or show that the cache already does.
   - Check: a §3c case with a take recorded mid-run, where the preview equals the real run.
4. **Re-measure `check_robots_hd` on a quiet machine** (load under 2) and replace the estimate in
   `docs/perf/checkers-baseline.json` (never commit `checkers-last.json`).

## How to check
- Headless: `node tools/check_robots_hd.mjs`.
- Built page: `python3 tools/bundle_webxr.py parishes && RHD_ONLY=<rooms|port|zone|jobs> node tools/drive_robots_hd.mjs
  <port> <dir>`.
- Then run `check_robo_interiors`, `check_agent_avatars`, `check_vbridge`, `check_hd4`, `check_imports`, `check_parse` and
  `check_newton`.
- Restore `WebXR/*/dist` and `docs/perf/phone-maps.json` after a drive.
