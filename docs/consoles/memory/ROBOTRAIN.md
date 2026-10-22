# ROBOTRAIN memory (loop 5, `rt`, port 9042)

- Base c472f079. Branch `worktree-agent-a99e59f6edcbebcd3`. Commits: bfd08410 (teach pendant), 10ddc29c (PFL check), 0cde5208
  (e-stop recovery), e32d9b22 (SSM set-up), 4671a4fc (rt-teleop.js, programme), then the checker + docs commit.
- Stations: `rt-teach-pendant-safe-jogging` 97, `rt-cobot-power-force-limit-check` 98, `rt-robot-estop-recovery-and-restart` 96,
  `rt-speed-separation-monitoring-setup` 98 (`eval_content --station`). Registered with `add_station.mjs` (729 sims).
- Programme: `RP_GAP_STATIONS`, `RP_TELEOP_RECORDER`, `rpGapCoverage` 0/4 → 4/4, `rpRecorder` guarded; page regenerated, loop 5/5 live.
- Recorder: `rt-teleop.js` over `rb-teleop-pick-place`, through `dxRecorder` (inert unless collecting). Eval `rtCompare`: recorded
  0.967 vs synthetic 0.967, random 0, expert 0.983 on 60 held-out seeds, N = 40; the "human" is a scripted stand-in labelled synthetic.
- Checker `tools/check_robotrain.mjs` (in check_all's list, baseline 1800 ms). Neighbours: check_robotics_programme ok 699;
  check_imports all 1093 modules ok.
- Footguns met: game.js `turn` steps take `{ turns, label, readout }`; a checker scanning itself for the patterns it greps fails itself;
  move actions round to 3 decimals, so a cap comparison needs a 0.002 tolerance.
