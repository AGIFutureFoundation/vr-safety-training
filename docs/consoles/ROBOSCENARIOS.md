# ROBOSCENARIOS (`rs`, port 9061) — construction and port robots get real results

Loop 7 (SmartCiti.X Holodeck · Powered by AGI Corp). Base a8c677ed. Builds on ROBOTICS (`rb-env.js` gym, `RB_SCENARIOS`),
COLEARN (`col-learn.js` behaviour cloning, `docs/evals/colearn.json`), ROBOTRAIN-2 (`rt-teleop.js` `RT_TASKS`, `rtCompare`) and
AGENTGYM (`tools/ag_eval.mjs`). Read `ROBOTICS.md`, `COLEARN.md`, `ROBOTRAIN-2.md` and `AGENTGYM.md` first; this file adds to them.

The investor deck's robotics story had two "Not yet" cells: the construction robot station and the port automation yard had no
robot-side result. Both now have a gym scenario, a scripted expert, a random floor, a behaviour-cloned policy evaluated on 60
held-out seeds, a teleoperation task, and an AGENTGYM baseline for their stations. Robots stay simulated; every demonstration
is synthetic and labelled so.

## What is here

1. **Two gym scenarios** in `WebXR/shared/rb-env.js`, inside the existing scenario schema (`rb-robotics-data.js` `RB_SCENARIOS`,
   `kind: "game"`), deterministic by seed (`robot.js rng`), with the embodiment fields every rb-env observation carries:
   - `rb-construction-drilling` — **Ceiling-Drilling Robot Set-Up**, beside the catalog station `rp-construction-drilling-robot-setup`.
     Scan the deck, set the barricade, dust collection on, drill a 6–8 hole layout (seeded), change the bit when it wears (every
     3 holes) with the battery isolated, restore. A worker steps inside the barricade on a seeded schedule; while they are inside a
     drill command is held by the robot (`robot-held-person-inside`, rule `person-in-barricade`, −3) and never drills a hole.
     Rules: `person-in-barricade`, `drill-unscanned`, `no-barricade`, `dust-off`, `bit-change-live`. Actions: `scan`, `barricade`,
     `dust-on`, `drill`, `hold`, `isolate`, `change-bit`, `restore`, `estop`, `wait`. The expert holds while a person is inside;
     a lapse (skill < 1) takes the shortcut — drills or swaps the bit now, whatever is undone.
   - `rb-port-gantry` — **Port Automation Lane**, beside `ad-amr-fleet-traffic-and-estop-drill`. One automated stacking gantry in a
     two-lane container yard (travel lane and stack lane, 12 columns): two seeded container moves (bay → bay), a pedestrian
     crossing across both lanes at column 6 with a person on it on a seeded schedule, a 2-column stop zone either side, and a
     2-column keep-out in the stack lane around a pinned container (a lashing crew's space). Driving into the busy crossing is held
     (`held-at-crossing`, rule `crossing-stop-zone`, −3); driving into the keep-out is held (`pinned-keep-out`, −2). Actions:
     `move {dir}`, `hold`, `lift`, `set`, `estop`, `wait`. The expert is a BFS driver that treats the busy crossing and the keep-out
     as walls, drives up to the stop zone's edge on the travel lane and holds there (`held-in-stop-zone`) until the person is across.
   - Both are on the matching robot sites (`RB_SITES`): the West Oakland **Port Automation Yard** now runs `rb-port-gantry` (its
     gantry rig unchanged), and a new **Ceiling-Drilling Robot Deck (procedural)** sits on `la-meta-richland` beside the Data Hall
     Fit-Out (`rb-site-richland-drilling-robot`, cobot rig; dry ground, in bounds, 7 meshes — `check_robotics` 19/0). The ROBOPROG
     construction-robotics track (`RP_TRACKS`) points at the new scenario and site (it had `rbSites: []` and borrowed the cobot game).
2. **Behaviour cloning on both** (COLEARN's k-NN, `COL_FEATURES`): the drilling robot's set-up state as 7 booleans (one row per
   step; `hold` is the robot held for a person, so the clone learns it — plain waits are filtered as before); the gantry's 14
   features (bay direction, at the bay, carrying, free lanes, a busy crossing just east/west, the keep-out just east/west/below,
   the stop zone, and whether the keep-out or a busy crossing lies between the gantry and the bay). Port moves are labelled by
   direction (`move-E`…). Both are in `COL_SCENARIOS`, so `tools/col_eval.mjs` wrote them into `docs/evals/colearn.json`
   (the four earlier rows unchanged, byte for byte) and `check_colearn` compares them with a live run.
3. **Teleoperation tasks** in `RT_TASKS` (`rt-teleop.js`): the drilling robot's **pendant** (the pose is the hand over a panel
   of eight controls, `RT_DRILL_CONTROLS`; a closed trigger on a control is that command; the e-stop pose holds) and the gantry's
   **joystick** (`p[0]`/`p[2]` deflection → E/W/N/S, trigger = drive enable, stick centred with the trigger = hold, a squeeze works
   the spreader: lift when empty, set when loaded). Each has a scripted stand-in with lag and tremor, labelled synthetic
   (`RT_SYNTHETIC_LABEL`), so `rtCompare({ scenario })` and `rtCompareAll()` run recorded-vs-synthetic on them.
4. **AGENTGYM baselines**: `docs/perf/agent-baselines-robotics.json` regenerated with `node tools/ag_eval.mjs --seeds 3 --stations
   <every RP_ROBOT_STATIONS id>`: 16 stations × 3 seeds (was 10; the six ROBOTRAIN/VBRIDGE stations `check_bridge` listed as
   "not yet baselined" are in). The construction robot station: random 0/3, expert 3/3, retrieval 0/3, retrieval-ask 0/3. The port
   yard's station (`ad-amr-fleet-traffic-and-estop-drill`) was already in. There is no catalog port *robot* station beyond it.
5. **Checker** `tools/check_roboscenarios.mjs` (10 checks, ~0.3 s, no suite load): determinism; expert 60/60 clean vs random 0/60
   on the held-out seeds; the invariants scanned over every expert step (2,734 steps) plus a direct probe that the robot holds;
   the expert does hold for people (186 drill holds, 66 stop-zone holds); policy results present in `colearn.json`; RT_TASKS and
   the pose path; sites and the supplement; Kids rule and no model identifier. Listed in `check_all.mjs` after `check_robotrain`
   and in `docs/perf/checkers-baseline.json`.

## Evals (before → after)

| Measure | Before (a8c677ed) | After |
|---|---|---|
| Robot sites with a robot-side result (construction robot, port yard) | 0 of 2 | **2 of 2** |
| Gym scenarios (`RB_SCENARIOS`, games) | 4 | **6** |
| Construction drilling: random / BC (clean passes only) / expert, 60 held-out seeds | none | **0 / 1.000 / 1.000** (17/40 demos kept, 320 rows; BC 17.8 steps = expert) |
| Port lane: random / BC / expert, 60 held-out seeds | none | **0 / 1.000 / 1.000** (25/40 demos kept, 623 rows; BC 27.7 steps vs expert 27.8) |
| Unfiltered BC (every demonstration) | none | drilling 1.000, port 1.000 |
| `rtCompare` recorded (pose path) vs synthetic, 60 held-out seeds, N = 40 | n/a | drilling **1.0 / 1.0** (kept 27 / 17); port **1.0 / 1.0** (kept 28 / 25); random 0, expert 1 on both |
| Tasks `RT_TASKS` covers | 2 | **4** |
| Programme robot stations with an AGENTGYM baseline | 10 of 16 | **16 of 16** (on them: random 0, expert 1.000, retrieval 0.063, retrieval-ask 0.313; 48 episodes each) |
| Expert invariant violations (person inside barricade, busy crossing, pinned keep-out) over 60 seeds | n/a | **0** of 2,734 steps |

Read honestly: both scenarios are discrete and small, so the k-NN clone reaches the expert once the features name what the expert
looks at (the port clone sat at 0.38–0.92 until "keep-out below" and "keep-out between" were features; before that it drove into
the pinned keep-out on 37 of 60 seeds and was held there). The results are on simulated robots with synthetic demonstrations and
say nothing about a real drilling robot or a real terminal. The "holds" are the robot refusing the command, which is the point of
the rule; no person is ever harmed in the sim.

## Cycles

1. Reason: two scenarios are only real if a scripted expert finishes each clean on every seed and a novice does not; check =
   expert and novice rollouts, `check_robotics` → Act: `rbDrillSim`, `rbPortSim`, 7 rules, the port site's scenario, the Richland
   site → Observe: expert 60/60 clean on both (17.8 / 29.7 steps), novice (skill 0.3) 39 and 19 violations over 8 seeds, 0 for the
   expert; `check_robotics` 19 passed, 0 failed (6 sites on 5 maps, Richland 7 meshes). Committed 32960daf.
2. Reason: "stop in the stop zone" should be literal — the gantry held at column 0 when the crossing was busy far ahead → Act: the
   expert drives to the stop zone's edge on the travel lane, then holds → Observe: expert still 60/60 clean, 27.8 steps.
3. Reason: BC on both; check = success on 60 held-out seeds vs random and the expert → Act: `COL_FEATURES` for both, direction
   labels for port moves, random policies, phrase table → Observe: drilling 1.0 (random 0, expert 1); port 0.917 filtered, 0.933
   unfiltered — `check_colearn` would fail (filtered < unfiltered).
4. Reason: the port clone's failures were all `pinned-keep-out`, held forever above the pinned container; two guesses at a "between"
   feature made it worse (0.667, then 0.383) → Act: trace a failing seed (`colExplain` per step): at (4,0) with the keep-out at 3–4 the
   neighbours voted S straight into it — no feature saw the cell below → `keepOutS` (+ lane-independent `keepOutBetween`,
   `crossingBetween`) → Observe: port **1.0 / 1.0**, 27.7 steps; `col_eval` regenerated (43 s wall under load, 13 s CPU);
   `check_colearn` 46 passed, 0 failed (was 42).
5. Reason: teleop tasks for both; check = the skill-1 stand-in passes through the pose path and `rtCompare` matches synthetic →
   Act: `rtPoseToActionDrill` / `rtScriptedHumanDrill`, `rtPoseToActionPort` / `rtScriptedHumanPort`, `RT_TASKS` → Observe: drilling
   recorded 1.0 vs synthetic 1.0 (27 / 17 kept), port 1.0 vs 1.0 (28 / 25); `check_robotrain` ok 253 (its two hard-coded task counts
   now read `RT_TASK_IDS`).
6. Reason: baselines and neighbours; check = `ag_eval --seeds 3` over every programme robot station, `check_bridge`, `check_vbridge`,
   `check_robotics_programme`, `check_avatars` → Observe: 16 stations × 3 seeds in 4.0 s; `check_bridge` 135/139 and `check_vbridge`
   13/14 — both stale exports (`exports/shared/holodeck-shared.json`, `vb-game-functions.json`) → `export_shared.mjs` and
   `vb_export_game.mjs` re-run → `check_bridge` 139/139, `check_vbridge` 14/0; `check_robotics_programme` ok 714; avatars all pass.
   Also `vbProviderCompare` skips a site scenario the governor does not allowlist (`VB_TASKS`), so the port yard's new scenario does
   not become a job.
7. Reason: one checker proves it; check = `check_roboscenarios` → Act: the checker (the first run caught a wrong field for the
   synthetic label, and the model-name regex matching its own source) → Observe: 10 passed, 0 failed, 0.2–0.4 s.

## Seams

- `rbEnv("rb-construction-drilling" | "rb-port-gantry", { seed })` — `WebXR/shared/rb-env.js`; rules and scenario data in
  `rb-robotics-data.js` (`RB_RULES`: `person-in-barricade`, `drill-unscanned`, `no-barricade`, `dust-off`, `bit-change-live`,
  `crossing-stop-zone`, `pinned-keep-out`); sites `rb-site-west-oakland-port-automation` (scenario changed) and
  `rb-site-richland-drilling-robot` (new, la-meta-richland).
- `COL_SCENARIOS` now lists six; `COL_FEATURES["rb-construction-drilling"]`, `COL_FEATURES["rb-port-gantry"]`; `docs/evals/colearn.json`
  `policies[4..5]`.
- `RT_TASKS["rb-construction-drilling"]`, `RT_TASKS["rb-port-gantry"]`, `RT_DRILL_CONTROLS`, `rtPoseToActionDrill`, `rtScriptedHumanDrill`,
  `rtPoseToActionPort`, `rtScriptedHumanPort` — `rt-teleop.js`. `rtMountTeleop` still drives pick-and-place only (ROBOTRAIN-3 takes the task).
- `docs/perf/agent-baselines-robotics.json`: 16 programme robot stations, same harness, config and seeds as the full run.
- **WHITEPAPER-R2 / CAPTURE-R2**: every figure above is printed by `node tools/check_roboscenarios.mjs` (one line per check) and
  held in `docs/evals/colearn.json` and the supplement.
- **VBRIDGE**: the new scenarios are not in `VB_TASKS` (the governor's allowlist), so no agent job can dispatch them yet; adding
  them is VBRIDGE's call (`vb-shared-data.js`), with rig limits for the gantry and the cobot rig already present.

## Left

- The port yard's side game (`rbGamesFor`) is gone with the scenario change: `RB_GAME_MECHANICS` has no board for the lane scenario
  (4 games on 5 maps, was 5). A board for it, and one for the drilling robot, is the next small step.
- The drilling-robot site draws the cobot rig (an arm on a base); a mast-on-a-carrier rig type would need `rbDrawRig` and
  `check_robotics` 8b's type table.
- `rtMountTeleop` (the pad) drives pick-and-place only; the pendant and joystick tasks run in the eval and the API.
- No in-world (parishes) drive of the new site was run here (headless browser runs were left to the other consoles' budgets).
- Station wrappers for the two stations (`rb-station-*` over the catalog Session) were not added; the games stand in for them.
