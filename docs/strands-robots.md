# strands-robots and this repository's simulated robots

STRANDS, loop 10 round 7; stations, the arena's published ra-lm build, ra-lm-h and a LeRobot-style JSONL exporter added by STRANDS-2 in round 8. Code: `robotics/strands/` (Python 3.11, standard library only, numpy optional), `tools/ra_bridge.mjs`, `tools/ra_export_weights.mjs`. Check: `node tools/check_strands.mjs`, which runs `python3 robotics/strands/selftest.py`.

## What strands-robots is

`strands-robots` 0.3.8 is a Python package on PyPI, licensed Apache-2.0. Its README calls it "Robot Control for Strands Agents": you control robots with natural language through the Strands Agents SDK, with LeRobot for robot support and a vision-language-action policy server. It depends on lerobot, torch and strands-agents. We read its interface from the wheel only (`pip download --no-deps`, read as data in scratch). It is not installed here, and none of its code is vendored. This project is **not affiliated** with strands-robots or its authors, and nothing here claims to be endorsed by them.

Its interface, as read from 0.3.8:

- `strands_robots.Robot(tool_name, robot, cameras=None, action_horizon=8, ...)` is a Strands `AgentTool`. It builds a LeRobot robot from a type string or config and connects to real hardware over a serial port, with optional cameras. Its `tool_spec` takes `action` (one of `execute`, `start`, `status` or `stop`) plus `instruction`, `policy_port`, `policy_host`, `policy_provider` and `duration`. Its loop gets an observation, calls `policy.get_actions(observation, instruction)` and sends up to `action_horizon` actions.
- `strands_robots.policies.Policy` is an abstract base with `async get_actions(observation_dict, instruction, **kwargs) -> list[dict]`, `set_robot_state_keys(keys)` and the property `provider_name`. `MockPolicy` returns 8 random actions, each `uniform(-0.1, 0.1)` per state key.

## Honesty notes

- **No `strands_harness` package exists.** The user's sample imported `strands_harness.create_harness`. That module is not in strands-robots 0.3.8 and not on PyPI. `create_harness` in `robotics/strands/harness.py` is **this repository's own harness**, named for the sample.
- **Simulated only.** `SimRobot` never opens a serial port, a camera or a socket, and never imports lerobot, torch, serial or cv2. A request for hardware is refused with the governor's own reason, `physical-target`. That covers `port=`, `cameras=`, `physical=True`, and `target: "physical"` in a tool use. The selftest patches device opens, `serial`, `cv2` and sockets to record and refuse, and checks that none of them was touched.
- **No hosted model.** By default a Strands `Agent` calls a hosted model, which needs credentials. Nothing here builds an Agent or calls any model service. The harness picks a scenario from the instruction with a fixed rule table, not a language model. The bridge is started with `PATH` as its only environment variable. The selftest guards `os.environ` and finds no credential-like read.
- **strands-robots is not installed.** `policies.py` subclasses `strands_robots.policies.Policy` when the package can be imported. Otherwise it uses an identical local abstract base, and `POLICY_BASE` says which (here: the local base). `strands_robots.MockPolicy` runs through the same adapter path when installed. Here it is skipped and the checks report it as skipped.
- **One scratch check against the real class.** This was not installed, not committed and not part of CI. We loaded only the wheel's `strands_robots/policies/__init__.py` (standard library plus numpy) by file path, so the package's own `__init__`, which imports lerobot, never ran. With it, `POLICY_BASE` read `strands_robots.policies.Policy (importable)`, and all 6 adapters were subclasses of the real `Policy`. bc and ra-lm gave the same results as with the local base (so100, seeds 1–3: 2 of 3 each). The real `MockPolicy` then ran on the simulated arm through the joint-key mapping: 0 of 3 succeeded (two ran to the 400-step cap, one was halted by the governor after a rule break). Physical was 0, every step was governor-checked, and the network count was 0. MockPolicy uses numpy's unseeded generator, so its runs are not deterministic.
- **The models are this repository's.** They are trained here by `ra-arena.js` on synthetic demonstrations: the behaviour clone, DAgger rounds 1 and 3, the small language-conditioned model (`ra-lm`, a masked softmax over task text × scene features, not a large language model), the scripted expert as an upper bound, and a random floor. The exported `ra-lm` is the gym-only build. Round 8 adds `ra-lm@stations`, the build the arena publishes (texts with the three stations' step and hazard texts, trained on the six gym tasks and the three station tasks), and ARENA-2's `ra-lm-h` (the same model plus one declared change, a hidden layer), in that published build. Each weights file states its build.

## Mapping

| strands-robots | Here | Notes |
|---|---|---|
| `Robot(tool_name, robot="so100", port=...)` | `SimRobot("so100", tool_name=None)` | `port`/`cameras`/`physical=True` refused (`physical-target`) |
| robot type `so100` / `so101` (`_follower`) | arena desktop arm, `rb-teleop-pick-place` | a generic six-joint arm by kind; the sim drives the effector in metres |
| (no equivalent type) | `cobot` → `rb-cobot-zone-setup`; `amr` → `rb-amr-fleet-routing` (+`#hard`); `gantry` → `rb-port-gantry` (+`#hard`) | any other type refused with a reason |
| `tool_spec` (`action` enum execute/start/status/stop, `instruction`, `policy_port`, ...) | same shape; `policy_port`/`policy_host` accepted and ignored; `seed` added | policies run in-process |
| `execute` / `start` / `status` / `stop`, `stream(tool_use, ...)` | same four actions; `stream` yields one result dict | |
| `robot.get_observation()` | bridge `obs`: `features` (COLEARN's named scene features) or `robots` (AMR, per robot); `state` on the arm (`ee.x`, `ee.y`, `ee.z`, `gripper.pos`) | |
| `robot.send_action(action_dict)` | bridge `step`: an env action, `{label, params}`, `{moves}` (AMR) or `{expert: true}` | a joint-key dict (MockPolicy) maps to a move/grip on the arm |
| `Policy` | `KnnClonePolicy` (bc, dagger-r1, dagger-r3), `SmallLmPolicy` (ra-lm, ra-lm@stations, ra-lm-h), `ScriptedExpertPolicy`, `RandomPolicy` | weights from `tools/ra_export_weights.mjs` |
| (no equivalent) | the three robot stations: `cobot` → `rb-station-cobot`, `amr` → `rb-station-amr-fleet`, `cell` → `rb-station-robot-cell` | the bridge loads the headless station suite with `tools/arena_eval.mjs` `raStations()`; station observations add `text_keys` (drill step, pending interruption) |
| safety | VBRIDGE governor `monitor()` on every step in the bridge, as `raEpisode` | `physical: 0` on every reply; network calls blocked and counted (0) |

The Python adapters reproduce the arena's own `raRun` per seed: the same success, steps and rule breaks for bc, dagger-r1, ra-lm and the expert on all four robot types (16 of 16 on seeds 1–3 in the selftest; also checked on seeds 1–5 during the build). Each exported clone's content hash equals `raBuild`'s.

Round 8 (STRANDS-2), on development seeds 1–3:

- **Stations.** bc, ra-lm@stations, ra-lm-h and the expert reproduce `raRun` on all three robot stations: 12 of 12 (model × station). The station clones' hashes equal `raBuild`'s.
- **The published ra-lm build and ra-lm-h on the gym scenarios.** 8 of 8 (two models × four robot types) in the selftest, and 12 of 12 including the two hard variants during the build. The instruction vector on a station follows the drill step (and, for ra-lm-h, a pending interruption's text). The exporter writes those vectors with `raLmT`'s own arithmetic (`tCombos`), so Python does not re-normalise them. ra-lm-h's `tanh` is Python's `math.tanh`; no argmax flipped on these seeds.
- On these seeds the station episodes have the same length for every seed (for example 279 steps on the cobot station for bc). The stations appear to vary little with the seed, so three station seeds are weak evidence.

## Results (docs/evals/strands.json)

`compare(policies, scenarios, seeds)` writes rows in `docs/evals/arena.json`'s leaderboard shape, with Wilson 95% intervals. It ran 6 policies × 6 gym scenarios:

| Policy | Dev 1–20 (120 episodes) | Held-out 7181–7240, once (360 episodes) |
|---|---|---|
| expert (upper bound) | 1.000 [0.969, 1.000] | 1.000 [0.989, 1.000] |
| dagger-r3 | 0.742 [0.657, 0.812] | 0.794 [0.750, 0.833] |
| bc | 0.708 [0.622, 0.782] | 0.761 [0.714, 0.802] |
| dagger-r1 | 0.700 [0.613, 0.775] | 0.731 [0.682, 0.774] |
| ra-lm (gym-only build) | 0.692 [0.604, 0.767] | 0.733 [0.685, 0.776] |
| random | 0.000 [0.000, 0.031] | 0.003 [0.000, 0.016] |

Stations (`devStations`, dev seeds 1–3, 9 episodes per policy): bc 1.000 [0.701, 1]; expert 1.000 [0.701, 1]; ra-lm-h 1.000 [0.701, 1]; ra-lm@stations 0.667 [0.354, 0.879] (the cobot station 0 of 3, one rule break in each episode); random 0.000 [0, 0.299]. 10,660 of 10,660 steps were governor-checked, physical 0, network 0. Development seeds only: the stations were not in the held-out declaration, and the seed gate refuses a held-out seed on a station. Round 8's protocol-3 seeds (7241–7300) belong to ROBOLEARN-9; the gate refuses them here.

On the held-out seeds, 97,289 of 97,289 steps were governor-checked, with 0 physical dispatches and 0 network calls. The held-out run used ARENA-2's committed declaration (`docs/evals/arena-declared-r7.json`, 8ea01d3c) and this harness's own declaration (`docs/evals/strands-declared.json`, committed in e38fa35c before the run). It ran once, and the seed gate refuses a second run. The learners' intervals overlap, so no ranking claim is made between them. This run checks the harness: the Python path reproduces the arena. It is not a new model.

## How an owner with hardware would connect it

This is outside this repository and not run here. Install strands-robots in the owner's own environment (it pulls in lerobot and torch). Build `Robot(tool_name="arm", robot="so100", port="/dev/ttyACM0", cameras={...})`. Run a policy server for the arm, then call `robot.start_task(instruction, policy_port=..., policy_host=..., policy_provider=...)`, or let a Strands Agent call the tool. A Strands Agent needs a model provider and its credentials. The adapters in `policies.py` subclass the real `Policy` once the package is importable, so an owner could pass one to the robot's policy path. They would then need to map the arm's joint state to the scene features these models read, which this repo does not do for real arms. In this repository, the governor's physical path stays disabled (`VB_PHYSICAL.enabled === false`). A physical target needs a named human approver, and that path does not exist here.

## LeRobot-style dataset mapping (from tools/ra_dataset.mjs)

The arena dataset (`exports/robotics/arena/`, schema `smartcitix.robotics.arena-episode@2` since ARENA-2; station lines carry `step`) has one JSONL line per step. In a LeRobot-style episode table, the fields would map like this:

| ra_dataset field | LeRobot-style field | Note |
|---|---|---|
| `episode` | `episode_index` (+ an episodes table keyed by it) | string id → integer index |
| `t` | `frame_index` | step from 0; `timestamp` = `t` × the scenario's step time |
| `split` | split lists in the dataset's metadata | train/validation/test fixed by generator seed |
| `instruction` (key into `instructions.json`) | `task_index` (+ a tasks table with the text) | |
| `observation.f` / `observation.robots` | `observation.state` (feature names in `schema.json`) | AMR is per robot: one row per robot, or a padded vector |
| `action` | `action` | the env action as taken; discrete labels need an index table |
| `reward` | `next.reward` | |
| `done` | `next.done` | |
| `rules.unsafe`, `rules.outcome` | extra columns | safe-practice flags |
| `source`, `consent` | extra columns + dataset card | every line in this version is synthetic, with `consent: null` |
| (none) | `observation.images.*` | the sim has no cameras |

**The exporter (round 8): `robotics/strands/lerobot_jsonl.py`, standard library only.** LeRobot's own format stores frame tables in Parquet, which needs a dependency this repository does not take. So the exporter writes LeRobot's layout with JSON Lines in place of Parquet: `meta/info.json`, `meta/tasks.jsonl`, `meta/episodes.jsonl`, `meta/actions.jsonl` and `data/chunk-000/episode_NNNNNN.jsonl`. It is LeRobot-style, and LeRobot's loader will not read it as it is. Frame fields: `index`, `episode_index`, `frame_index`, `timestamp` (stations: `t` × 0.05 s; the gym games are turn-based, so `timestamp` = `frame_index`), `task_index`, `observation.state` (AMR: the robots' vectors concatenated, a delivered robot zero-filled, plus `observation.robots_active`), `action` (the env action as taken), `action.label` and `action.index` (a per-scenario table), `next.reward`, `next.done`, `rules.unsafe`, `rules.outcome`, `station.step`, `source`, `consent` and `split`.

```
node tools/ra_dataset.mjs --full --out /tmp/ds        # the full set, outside the repo
python3 robotics/strands/lerobot_jsonl.py --check /tmp/ds /tmp/ds-lerobot
python3 robotics/strands/lerobot_jsonl.py --check exports/robotics/arena /tmp/sample-lerobot --sample
```

The check compares the read-back with `index.json`. Full set: 441 of 441 episodes and 35,102 of 35,102 frames, per split and scenario. Every row has the documented fields, and leakage is 0: no episode is in two splits, and none comes from an arena held-out seed (7121–7300). The committed sample gives 21 episodes and 761 frames. `check_strands` runs both.
