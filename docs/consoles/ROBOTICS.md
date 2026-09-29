# ROBOTICS (`rb`, port 8994) — robotics training, human–robot interaction and a gym API

Environment & robotics wave. Base 9914455.

## What is here

- `WebXR/shared/rb-robotics-data.js` — plain, dependency-free data for TQ-BRIDGE: `RB_SCHEMA`, `RB_FORCE_N`, `RB_SSM`,
  `RB_RULES` (safe-practice rules and reward weights), `RB_SCENARIOS` (4 games + 3 station wrappers), `RB_SITES`
  (5 sites on 4 maps), `RB_SITE_PRACTICES`, and `rbSharedData()` (all of it as one object).
- `WebXR/shared/rb-env.js` — `rbEnv(scenarioId, { seed, station })` → `reset(seed?)` / `step(action)` →
  `{ observation, reward, done, info }`; `rbPolicy(env, { skill, seed })` (scripted expert at skill 1, lapses below);
  `rbRollout(env)`; `rbSsmMode(distance)`. Deterministic by seed (robot.js `rng`; station scenarios lend the engine a
  seeded `Math.random` for the length of each call, because shared/game.js draws track wobble from it).
- `WebXR/shared/rb-world.js` — the parish mount (`rbMountRobotics`): moving rigs (AMR loop, cobot arm, gantry, fenced
  cell) that slow in the warning zone and hold a stop in the stop zone as the player nears, an e-stop post, lockout at
  the gate, restart from outside, scored /100 on safe practice; panel listed under the drills (`menu-drills`, no new
  mount id). The three robotics games (`RB_GAME_MECHANICS`) play in the shared side-game panel, registered into
  `QM_MECHANICS` by key only (items name `mechanic`; the twelve family mechanics and their matching are untouched).
- `tools/rb_rollout.mjs` — headless rollouts in the dataset layer's format (+ LeRobot/RLDS layouts).
- `tools/check_robotics.mjs` — 18 checks.

## Seams (for the coordinator at merge)

- **DATAWORKS' DX schema.** `tools/rb_rollout.mjs` does `await import("../WebXR/shared/dx-data.js")` in a try/catch.
  When dx-data.js is in the tree it writes every episode through `dxMakeEpisode()` (`source: "synthetic"`,
  `consent: null`, `sessionHash: null`, `world: "robotics"`, `kind: "robot-game"` for games / `"station"` for station
  wrappers, deterministic `episodeId`, fixed timestamps so shards stay byte-reproducible, `provenance.seed/policy`,
  `notes` carrying `envSchema` and the rules broken) and validates each with `dxValidateEpisode()` (throws on a bad
  one). Otherwise it writes the current export_dataset.mjs v1 shape. `manifest.writtenSchema` records which.
  Verified both ways here (v1 in-tree; DX with a temporary copy of the dataworks branch's dx-data.js: 42/42 valid).
  `check_robotics` validates whichever was written. Nothing else to wire; optionally switch `dxExportFiles` in for
  the manifest/card once merged.
- **TQ-BRIDGE**: export `rbSharedData()` from `rb-robotics-data.js` (no imports; JSON round-trips — checked).
- **Bundle**: `robot.js` and `robot-embodiment.js` were added to the parishes list (after game.js), then
  `rb-robotics-data.js`, `rb-env.js`, `rb-world.js` after `dr-drills.js`.

## Cycles

1. Reason: a gym API over four games is only real if a scripted expert finishes each clean and a novice does not →
   Act: rb-env.js + data → Observe: expert 3/3 seeds pass on amr/cobot/cell; teleop stuck (teammate zone covered the
   bin) → fixed the zone placement and added a re-route after a protective stop: teleop expert 51 steps, pass.
2. Reason: rollouts must land in the dataset format → Act: rb_rollout.mjs → Observe: 42 episodes / 5,856 steps in 3 s;
   station experts pass (2/6 = the skill-1 seeds). Committed 3873aba.
3. Reason: sites need robots that move, slow and stop, on dry ground, within budget → Act: rb-world.js + parishes mount
   + bundle lists → Observe: bundle builds (124 modules); check_robotics budgets 6 meshes/site (West Oakland 12 for
   two sites), phone ≤ 3; all 5 sites dry across the pad.
4. Reason: the checker must prove the safe-practice rewards and determinism → Act: check_robotics.mjs → Observe:
   15/18; station episodes differed run to run (game.js track wobble uses Math.random; props moved by a drag) and the
   AMR conflict probe was wrong; a game board had digits.
5. Reason: fix those three → Act: seeded Math.random loan + rebuild per reset; swap-conflict probe; words not
   digits → Observe: check_robotics 18/18.
6. Reason: coordinator asked for DATAWORKS' DX schema → Act: guarded import + dxMakeEpisode/dxValidateEpisode →
   Observe: v1 in-tree and DX (temporary copy) both write 42 valid episodes; check_robotics 18/18. Committed 08d62a5.
7. Reason: evals and neighbours after → Observe: eval_worlds 27 subjects, mean 97, 18 findings before and after, every subject line identical; check_robot all pass; check_parishes 30924 passed, 0 failed; check_gates 7674 checks, 0 failed.

## Left

- A browser pass (sv_survey stills) of the four maps with the rigs; the in-world e-stop is a panel button, not yet a
  ray-hit on the post (the post carries `userData.rbSite` for that).
- The robotics games are side-game boards over the env; a direct-manipulation teleop view on the gym is the next step.
- rb-world's rigs are small Groups (≤ 6 meshes/site); instancing across sites is unnecessary at one or two per map.
