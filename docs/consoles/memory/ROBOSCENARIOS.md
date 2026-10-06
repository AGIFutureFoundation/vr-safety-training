# ROBOSCENARIOS memory

- Two gym scenarios in `rb-env.js`: `rb-construction-drilling` (rbDrillSim) and `rb-port-gantry` (rbPortSim); data, rules and sites in
  `rb-robotics-data.js`. The port yard site runs the lane scenario; a drilling-robot deck sits on `la-meta-richland` (cobot rig).
- COLEARN clones both (`COL_FEATURES`); `docs/evals/colearn.json` holds them (BC 1.0 / random 0 / expert 1 on 60 held-out seeds).
  The port clone needs the `keepOutS` and `keepOutBetween` features — without them it drives into the pinned keep-out and is held.
- `RT_TASKS` has four tasks (pendant and joystick added); `check_robotrain` reads `RT_TASK_IDS` for its counts.
- `docs/perf/agent-baselines-robotics.json` covers all 16 `RP_ROBOT_STATIONS` (regenerate with `ag_eval --seeds 3 --stations <ids>`).
- Changing `RB_SCENARIOS`/`RB_SITES` stales `exports/shared/holodeck-shared.json` and `vb-game-functions.json`: re-run
  `tools/export_shared.mjs` and `tools/vb_export_game.mjs` or `check_bridge`/`check_vbridge` fail.
- Side-game boards for both scenarios live in `rb-world.js` `RB_GAME_MECHANICS` (6 games on 5 maps).
- Checker: `tools/check_roboscenarios.mjs` (10 checks, no suite load).
