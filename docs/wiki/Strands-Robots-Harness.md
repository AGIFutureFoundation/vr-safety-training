# A Python robot harness on the strands-robots interface

This repository's own harness, simulated only: robots and models through the strands-robots Policy and tool interface, compared on the arena's scenarios with every step checked by the governor.

## A Python harness on the strands-robots interface

A Python-first harness for simulated robots that speaks the interface of the open strands-robots library: a tool that wraps a robot, and policies that return actions for an observation and an instruction. Here the robot is always simulated, every step goes through the safety governor, and the harness compares this project’s trained models on the arena’s scenarios. It is not affiliated with that library’s authors, it needs no hosted model, and it moves no real robot.

- 4 robot types a simulated tool maps to an arena scenario (an arm for pick-and-place, a cobot, an AMR carrier, a gantry); a request for real hardware is refused with the governor’s reason `docs/evals/strands-declared.json`

- 6 policies runnable through the policy interface, 13 weight files (154 KB) exported from the arena’s models `tools/ra_export_weights.mjs`

- 0 physical dispatches; the bridge also blocks and counts any network call `tools/ra_bridge.mjs`

### What is built

| Part | What it does | File |
|---|---|---|
| Simulated robot | Has the same actions and tool description shape as the real tool, runs the arena’s scenarios, and never opens a serial port or a camera. | `robotics/strands/sim_robot.py` |
| Policies | Adapters on the library’s policy interface for the clone, both DAgger variants, the small model, the scripted expert and random actions. When the library is installed they use its base class; otherwise an identical local one, and the data says which. | `robotics/strands/policies.py` |
| Harness | This project’s own create_harness: picks the scenario from the instruction by a fixed rule table (no language model) and runs the policy on the simulated robot; a comparison writes leaderboard rows with intervals. | `robotics/strands/harness.py` |
| Bridge | A small Node program, with one line of JSON in and out per step, that runs the arena scenario with the governor checking every step. | `tools/ra_bridge.mjs` |
| Runnable sample | The sample that was asked for, made to run against the simulated robot, with a comment showing how the same code would use the real library outside this repository. | `robotics/strands/examples/pick_red_cube.py` |

Source: the files named, and the console’s commit messages. Status: merged into the integration head.

### Development rows: the policies on the Strands interface

Run through the harness on the development seeds only (20 seeds, 6 gym scenarios, 720 episodes), in the same row shape as the arena’s leaderboard. The governor checked 32,801 steps, one at a time, with 0 physical dispatches and 0 network calls.

| Policy | Success | Rules broken | Episodes |
|---|---|---|---|
| scripted expert (an upper bound: it reads the simulator’s state) | 1.000 (0.969 to 1.000) | 0 | 120 |
| DAgger, 3 rounds | 0.742 (0.657 to 0.812) | 9 | 120 |
| behaviour clone | 0.708 (0.622 to 0.782) | 13 | 120 |
| DAgger, 1 round | 0.700 (0.613 to 0.775) | 9 | 120 |
| small language-conditioned model (the gym-only build) | 0.692 (0.604 to 0.767) | 22 | 120 |
| random actions (Python’s seeded generator) | 0.000 (0.000 to 0.031) | 134 | 120 |

These are development rows: nothing was tuned on them and no claim is made from them. The clone’s and DAgger’s intervals overlap, so the learned policies are not ranked. Source: `docs/evals/strands.json` (its dev block).

### The held-out comparison

The one held-out comparison was declared at 18:55 UTC, through the committed declaration of ARENA-2 (8ea01d3c), the only place its seeds may come from, and a seed gate refuses a second run. It ran once on seeds 7181 –7240: 2,160 episodes, 97,289 steps checked by the governor, 0 physical dispatches and 0 network calls.

| Policy | Success | Rules broken | Episodes |
|---|---|---|---|
| scripted expert (an upper bound: it reads the simulator’s state) | 1.000 (0.989 to 1.000) | 0 | 360 |
| DAgger, 3 rounds | 0.794 (0.750 to 0.833) | 13 | 360 |
| behaviour clone | 0.761 (0.714 to 0.802) | 23 | 360 |
| small language-conditioned model (the gym-only build) | 0.733 (0.685 to 0.776) | 45 | 360 |
| DAgger, 1 round | 0.731 (0.682 to 0.774) | 25 | 360 |
| random actions (Python’s seeded generator) | 0.003 (0.000 to 0.016) | 391 | 360 |

As measured: the intervals of the learned policies overlap, so no ranking among them is claimed; the scripted expert, which reads the simulator’s state, is the upper bound, and random actions are the floor. Source: `docs/evals/strands.json` (its held-out block).

### Read honestly

- **No such package.** The sample that was asked for imports strands_harness. That package is not part of the library and is not on its package index, so this project provides its own create_harness, named as its own.

- **Simulated only.** No real robot is driven, no port or camera is opened, no hosted model is called and no credential is read. How the same code would connect to real hardware is described, not run.

- **The small model is a different build.** The harness uses the gym-only build of the small language-conditioned model, which did not train on the station tasks, so its rows are not the arena’s published ones. The scripted expert reads the simulator’s state and is an upper bound, not a model of a learner.

- **A check, not a new model.** The harness reproduces the arena from Python: on development seeds 5 and below, every adapter matches the arena’s own run seed by seed (16 model-by-scenario pairs in the self-test). It adds no new model and no claim about performance. The self-test passes 27 checks and deliberately trips 5 guards (a credential-like name, a device, a socket, a serial port) to prove each fires; the sample runs, with 51 steps checked by the governor.

- **The real interface, checked in scratch only.** When the library’s own policy module was loaded by file path, outside the repository and without installing anything, the adapters subclassed its real policy class and its mock policy ran on the simulated arm; the library is not installed here and is never vendored, so that mock is skipped in the repository’s own checks.

**Round seven ** of this loop is merged; its figures were read from the console branches with a read-only git show: `STRANDS` (branch head `68b76914`, 9 commits of its own; its console note is committed; merged). Each figure is checked against a committed file or a commit message, and a rebuild re-reads the final state.

Sources: `docs/evals/strands.json`, `docs/evals/strands-declared.json` and the console’s commit messages, read from its branch with git show.

### Round 8: `STRANDS-2`, stations through the Python harness

Round 8: `STRANDS-2`, tip 5cd8950d (read at the merged head 112a4d68), 3 commits of its own since a10f1ff8, merged into the head of round 8, 112a4d68; its console note is committed, and the table below is that note’s own. Each figure is a token of the commit message or note row it is quoted from, checked when this page is built.

- STRANDS-2 items 1-3: stations through the bridge, the arena's ra-lm build, ra-lm-h adapter ()

- station rows in strands.json (devStations, dev seeds 1-3) ()

- STRANDS-2 item 5: LeRobot-style JSONL exporter (stdlib), check legs, docs and notes ()

| Eval | Before → after | Source |
|---|---|---|
| Station scenarios through the bridge | 0 → 3 (cobot, AMR, robot cell; expert 3 of 3, every step governor-checked) | selftest "station scenarios through the bridge" |
| Parity with the arena per seed, stations | 0 → 12 of 12 (bc, ra-lm@stations, ra-lm-h, expert × 3 stations, dev 1–3) | selftest; $SP/loop10/st/parity_st2.py |
| Parity, published ra-lm build and ra-lm-h on gym | 0 → 8 of 8 in the selftest (4 robot types × 2); 12 of 12 with the hard variants in scratch | selftest; $SP/loop10/st/parity_gym.txt |
| Policies through the interface | 6 → 8 (adds ra-lm@stations, ra-lm-h) | selftest "8 of 8 " |
| Station compare rows | 0 → 5 rows (45 episodes): bc, expert, ra-lm-h 1.000 [0.701, 1 ]; ra-lm@stations 0.667 [0.354, 0.879 ]; random 0.000 [0, 0.299 ] | docs/evals/strands.json devStations |
| Exporter rows valid | 0 → 35,102 of 35,102 (full set); 761 of 761 (sample) | lerobot_jsonl.py --check; check_strands |
| Exporter round-trip vs index.json | 441 of 441 episodes, 35,102 of 35,102 frames, per split and scenario; leakage 0 | same |
| Physical dispatches | 0 → 0 | bridge replies; strands.json totals |
| Network calls | 0 → 0 (Python sockets 0, bridge 0) | selftest |
| Selftest | 27 → 33 pass | python3 robotics/strands/selftest.py |
| check_strands | 22 → 29 checks | node tools/check_strands.mjs |

Source: `docs/consoles/STRANDS-2.md` at the merged head 112a4d68, the evaluation table as the console wrote it (before → after, with its sources).


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
