# Next for ROBOTS-HD-2 (`rhd2`): brief for the next console

Read `docs/consoles/ROBOTS-HD-2.md` (Seams, Cycles, Left), `docs/consoles/memory/ROBOTS-HD-2.md`, then
`WebXR/shared/rhd-robots-hd.js`, `WebXR/shared/vb-panel.js` (`state().run`), `WebXR/shared/vb-bridge.js` (`vbRun`),
`tools/check_robots_hd.mjs` (§3b, §5b) and `tools/drive_robots_hd.mjs` (`RHD_ONLY=still|jobs|rooms|zone`).
Every rule of the loop holds: phone and headset never change, balanced keeps today's rigs, procedural and generic by kind,
the light shows a state the page already has and never invents one.

## Do
1. **The preview and the real run agree.** The light follows the panel's preview frames while a job plays, and the real run
   (the panel's own governor) is what the audit keeps. Check, for every job in `VB_PANEL_QUEUE` and every E-stop step, that
   the preview's governor decisions equal the real run's step for step up to the stop; if one differs, light from the real
   run's decisions instead. Check: N of N steps in `check_robots_hd` §3b.
2. **The combined robot rooms after the merge.** Re-run `RHD_ONLY=rooms` with AVATARS-HD-4's figures merged (the seam in
   brief-r7): every room inside `IX_BUDGET` with the HD robots, the zones and the agents. Check: the drive's room table, 6 of 6.
3. **The port control room's robot**: a straddle carrier or a yard crane seen through the window (rooms only), inside a
   stated budget, or a written reason why it stays empty. Check: §5 table and a still.
4. **Re-measure `check_robots_hd` on a quiet machine** (load under 2) and replace the estimate in
   `docs/perf/checkers-baseline.json` (never commit `checkers-last.json`).

## How to check
`node tools/check_robots_hd.mjs`; `python3 tools/bundle_webxr.py parishes && RHD_ONLY=<part> node tools/drive_robots_hd.mjs
<port> <dir>`; then `check_vbridge`, `check_robotics`, `check_robo_interiors`, `check_hd4`, `check_imports`, `check_parse`,
`check_newton`. Restore `WebXR/*/dist` and `docs/perf/phone-maps.json` after a drive.
