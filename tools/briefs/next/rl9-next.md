# ROBOLEARN-9 → next

Read `docs/consoles/ROBOLEARN-9.md` first, then `docs/evals/arena-declared-r8.json` and `docs/evals/claw3.json`.
Seeds 7121–7300 are spent. Declare any new held-out range (for example 7301–7360) in a committed file before any run.

1. **A real station pass, headless.**
   - Open `dist/smartcity-x.html?sim=robot-cell` with the test learner opted in.
   - Click only the pre-brief's "I've read it — start the run", never the guided tour.
   - Play through `__smartcityTest` (select / press / release / rotate), with `RobotAgent` from `/shared/robot.js` at
     skill 1.
   - Check: the page's own finish path writes a robot-cell record that passed. Parishes' side-by-side row for cell entry
     shows it passed, with `data-learner="local"`. `?demo` and `?k12` show `none`.
   - Start from `$SP/loop10/rl9/drive_rl9.mjs`. Its start-button loop is the bug.
2. **Port gantry programme station.**
   - Raise it with the programme's owner, or state why there is none.
   - Check: `check_claw` 10's map.
3. **Consented takes into training (ra2-next 5).**
   - Train ra-lm-h on the learner's own takes, on the device only, while `dxCollecting()` holds.
   - Record per-sample provenance. Never use held-out seeds.
   - Check: a drive with the fixture store (signed out 0, opted in N, after revoke 0) and `check_dataworks`.
4. **AMR base.** H 48 did nothing (32/60, the same as ra-lm-h). If you continue, declare the amr-robots features
   (`RA_LM_D` ≥ 19) as a new model id, on a fresh range.
5. **DATAWORKS seam.** Report that `dxRevoke`'s async clean-up stalled in the headless parishes page.

Before hand-back, run `check_arena`, `check_claw`, `check_dataworks`, `check_roboexport`, `check_newton`,
`check_imports` and `check_parse`. Rebuild the bundles before a drive, and restore the dist afterwards.
