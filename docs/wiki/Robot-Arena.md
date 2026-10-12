# The robot arena: models compared on the same tasks

Every model family in the repository on the same scenarios and seeds through the governor, a small robot model trained here, and the trainable datasets, reported as measured.

## Robots compete: model against model

The arena is a harness in which every robot model family in the repository runs the same scenarios on the same seeds through the safety governor, so that they can be compared on one leaderboard. Every model is a policy or a small model built and trained in this repository, on the device, with no network call and no outside model. The robots are simulated and the governor’s rules stand.

- 8 × 12 model families on scenarios (9 gym scenarios, 3 of them hard variants, and 3 robot stations) `docs/evals/arena.json`

- 179,248 simulated steps in 4,260 episodes, every one checked by the governor, with 0 dispatches to a physical robot `docs/evals/arena.json`

- −0.093 the small language-conditioned model against the behaviour clone on held-out seeds (interval −0.139 to −0.047): it did not beat it `docs/evals/arena.json`

- 351 episodes in the trainable set, all synthetic, with 0 leakage between splits `exports/robotics/arena/`

### How a comparison is run

- **Declared first.** The protocol (models, scenarios, seeds, metric) was committed at 17:46 UTC and the held-out results at 17:48 UTC; the evaluation refuses a held-out run unless the declaration matches the code. Development used seeds 1 to 20 only.

- **Fresh seeds, measured once.** The gym scenarios run on the held-out seeds 7121 –7180 (60), the stations on 7121 –7130 (10).

- **Through the governor.** The governor monitors every step; a broken safe-practice rule halts the run with a protective stop, and the leaderboard counts it. Each run’s audit chain is checked (ok).

- **Intervals, not just rates.** Success is shown with a Wilson 95% interval.

### The leaderboard, gym scenarios

| Rank | Model | Success, 95% interval | Rules broken | Episodes |
|---|---|---|---|---|
| 1 | scripted expert (the upper bound: it sees the targets) | 1.000 (0.993 to 1.000) | 0 | 540 |
| 2 | reactive rule-follower (no search, no planner, no learning) | 0.939 (0.909 to 0.959) | 0 | 360 |
| 3 | DAgger, 3 rounds of 20 rollouts | 0.859 (0.827 to 0.886) | 19 | 540 |
| 4 | behaviour clone (k-nearest neighbours, k = 5, 40 demonstrations a task) | 0.837 (0.804 to 0.866) | 35 | 540 |
| 5 | DAgger, 1 round of 20 rollouts | 0.809 (0.774 to 0.840) | 37 | 540 |
| 6 | per-step-reward clone (drops steps below 0.25) | 0.802 (0.766 to 0.833) | 43 | 540 |
| 7 | small language-conditioned model, trained here | 0.757 (0.720 to 0.792) | 64 | 540 |
| 8 | random actions (the floor) | 0.000 (0.000 to 0.007) | 670 | 540 |

Source: `docs/evals/arena.json` (merged into the integration head); the scripted expert sees the targets, so it is an upper bound and not a competitor. A read-only Robot arena panel on the robotics programme page draws this leaderboard and a bar for each scenario (8 leaderboard rows and 12 scenario cards in its headless drive, page errors 0, off-host requests 0).

### The small language-conditioned model

A small model trained in this repository, with 26,640 learned parameters: a masked softmax over a task’s text and the scene’s features, trained for 6 epochs on the synthetic expert traces and the stations’ own step texts. It is not a large language model and does not call one.

| Test, measured once | Small model | Behaviour clone | Difference (95% interval) | Task text blanked |
|---|---|---|---|---|
| Held-out tasks: the hard variants, never trained on (180 episodes) | 0.600 (0.527 to 0.669) | 0.622 (0.550 to 0.690) | −0.022 (−0.122 to 0.078) | 0.606 |
| Held-out seeds, every arena scenario (570 episodes) | 0.753 (0.716 to 0.786) | 0.846 (0.814 to 0.873) | −0.093 (−0.139 to −0.047) | 0.719 |

Source: `docs/evals/arena.json`, its small-model block. Reported as measured: on the held-out tasks the model and the clone cannot be told apart (the interval holds zero); over every scenario the model is below the clone. Across the gym, blanking the task text changes little (−0.006, interval −0.106 to 0.095 on the held-out tasks; 0.033, −0.018 to 0.084 on all), and on the gym AMR hard is the only scenario where the blanked model differs (0.183 against 0.167). On the stations, whose step text changes as the drill moves on, the text matters: with it the model passes 10 of 10 robot-cell and 10 of 10 AMR-station seeds, and with it blanked 0 of 10 and 0 of 10. On the cobot station it passes 0 of 10 with or without the text, where the clone passes 10 of 10. Where it trails the clone: AMR routing 25 of 60 against 42 of 60, and the port lane 46 of 60 against 60 of 60; on AMR hard it leads, 10 of 60 against 4 of 60.

### The trainable set and its dataset card

The arena’s own episodes are exported in a documented, versioned format, one line per step (observation, the task’s instruction text, action, reward, rule flags, consent provenance, source scenario and split), with a card that says what the set is and is not. Every episode in this version is synthetic and carries no consent record, because no person’s data is in it; a consented learner take could be added only from the learner’s own device under the data rules (opt-in adults only, never K-12, demo or signed-out sessions, local, revoke deletes).

| Split | Episodes | Steps | Generator seed |
|---|---|---|---|
| train | 237 | 6,371 | 1 |
| validation | 57 | 1,547 | 3 |
| test | 57 | 1,551 | 5 |

- **Size.** 351 episodes and 9,469 steps over 6 scenarios: 351 synthetic, 0 consented; the 3 robot stations are in the arena but not in this version.

- **Fixed held-out splits.** Splits are fixed by generator seed, and the arena’s held-out seeds are in no split.

- **No leakage between splits.** An episode is keyed by its content; a later split’s copy of an earlier split’s episode is removed (6 removed in this build), and the leakage left in the written files is 0, re-measured by the checker. Duplicates inside a split are kept once (3 dropped).

- **Consent provenance per sample.** Every line carries its source and its consent field.

- **Class balance.** The same number of episodes is generated per scenario in each split (40 / 10 / 10 before dedup); action labels are not resampled, and their counts are in the index so that a trainer can weight them.

- **Versioning.** A schema id, a dataset version and a content hash; the checker rebuilds the set and compares it byte for byte. The synthetic data is licensed CC0-1.0. The committed folder holds the card, the schema, the instruction texts, the index and one sample episode per scenario and split (1,277 KB, under a 1.5 MB cap that was not loosened); the full set is written on demand.

Source: `exports/robotics/arena/dataset-card.md`, `exports/robotics/arena/index.json` and `exports/robotics/arena/schema.json`. Known gaps, from the card: one scripted generator, whose habits and lapses the demonstrations share, and simple simulated tasks with no sensor noise.

### Read honestly

- The small model did not beat the clone it was meant to improve on, and the page reports that. Its intervals against the clone are the evidence; one small model, one training run and synthetic demonstrations from one scripted generator say little about what language conditioning could do.

- The stations are run on 10 seeds each, so their intervals are wide, and the station tasks are not yet in the trainable set. The scripted expert is an upper bound, and the random floor is the lower one. A retest needs a fresh seed range, because this one has been seen once.

- No consented learner take was present in the headless run, and the page has no control yet for exporting a learner’s own takes into the set.

- Every demonstration is synthetic or the scripted expert’s label, no consented learner take was present in the headless run, and no person was measured. No hardware is involved and no claim here is about a real robot.

**Round six ** of this loop is merged into the integration head; its figures were read from the console branches (the same commits) with a read-only git show: `ROBO-ARENA` (branch head `19d8e631`, 9 commits of its own; its console note is committed; merged). Each figure is checked by phrase against that console’s note, a committed file or its commit messages, and a rebuild re-reads the final state.

Sources: `docs/evals/arena.json`, `docs/evals/arena-declared.json`, `exports/robotics/arena/dataset-card.md` and the console’s commit messages, read from its branch with git show; the figures are read by the script that built this page.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `e196829d`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
