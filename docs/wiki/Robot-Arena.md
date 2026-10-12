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

### Round seven: the retest, declared first, then run once

ARENA-2 committed its declaration at 18:48 UTC, before any run on the new held-out range: seeds 7181 –7240 on the gym and 7181 –7190 on the stations, 3 models on 12 scenarios. The one declared change to the small model is a hidden layer (24 units), as a new model id (ra-lm-h) beside the old one, whose published rows are unchanged. The declaration says that no claim is made from a difference whose interval spans zero, and that the claw and the Strands harness may use this range only through this file. Source: `docs/evals/arena-declared-r7.json`.

The retest ran once, at 19:03 UTC, after the declaration: 1,710 episodes and 83,756 steps, every step checked by the governor, 0 physical dispatches. The model with the hidden layer has 44,760 weights, against 26,640 for the first one.

| Comparison, on the fresh held-out seeds | Small model with a hidden layer | Behaviour clone | Difference |
|---|---|---|---|
| The declared gaps pooled (AMR routing and the port gantry) | 0.842 (0.766 to 0.896) | 0.908 (0.843 to 0.948) | −0.067 (−0.152 to 0.018) |
| AMR routing, base | 0.717 (0.592 to 0.815) | 0.817 (0.701 to 0.894) | −0.100 (−0.247 to 0.052) |
| Port gantry, base | 0.967 (0.886 to 0.991) | 1.000 (0.940 to 1.000) | −0.033 (−0.114 to 0.031) |
| Every scenario | 0.832 (0.799 to 0.860) | 0.849 (0.817 to 0.876) | −0.018 (−0.060 to 0.025) |
| Held-out tasks (the hard variants) | 0.589 (0.516 to 0.658) | 0.600 (0.527 to 0.669) | −0.011 (−0.111 to 0.089) |

As measured: the hidden layer made the small model better than it was, by 0.133 on the declared gaps (interval 0.028 to 0.235, clear of zero). It did not overtake the clone: its remaining difference on the gaps, and over every scenario, has an interval that spans zero, so no difference is claimed. On the cobot station of the new stations the first small model scored 0 of 10, the one with the hidden layer 10 of 10 and the clone 10 of 10. The cause was found on training data only: the small model answered the station’s time-limited interruption on 9 of 24 labels and released a button with the interruption still pending; with the interruption’s own text added to the instruction it answers on 21 of 24. The model is trained here and is not a large language model; it still trails the clone on AMR routing. Source: `docs/evals/arena.json` (its retest block) and the console’s note.

**The station tasks are in the dataset.** The trainable set now holds 441 episodes (35,102 steps), up from 351; 90 of them, 25,633 steps, come from the station tasks. Every episode is synthetic (441 of them), none is a person’s take (0 consented), and leakage between splits is 0. The export folder is 1,439 KB, under its cap of 1.5 MB. A button on the data page exports a learner’s own consented takes as a local file in the set’s format: signed out it exports 0, an opted-in adult 2 of 2, and after a revoke 0 remain. Source: `exports/robotics/arena/index.json`.

**Round seven ** of this loop is merged; its figures were read from the console branches with a read-only git show: `ARENA-2` (branch head `ee17455a`, 6 commits of its own; its console note is committed; merged). Each figure is checked against a committed file or a commit message, and a rebuild re-reads the final state.

### Protocol 3: declared first, run once on fresh held-out seeds

`ROBOLEARN-9` committed the protocol before any run, then ran it once on seeds 7241–7300: 36 declared comparisons, 5,220 episodes, 184,742 of 184,742 steps checked by the governor and 0 physical dispatches. There were 2 promotions, both of them the reactive rule policy. That policy is hand-written, not trained: the result says a simple rule beats the clone on those hard variants, not that a learned model improved. The clone stays the incumbent on 7 of 9 scenarios.

- the port gantry, hard variant: the reactive rule policy’s interval 0.94–1 lies above the clone’s 0.72–0.907, with no rule broken.
- AMR fleet routing, hard variant: the reactive rule policy’s interval 0.911–0.997 lies above the clone’s 0.009–0.114, with no rule broken.

The declared change for the AMR base gap, a small model with a wider hidden layer, did not close it: 32/60 against the clone’s 36/60 successes, a difference of −0.067 (interval −0.235 to 0.108), so no claim is made.

Sources: `docs/evals/claw3.json` (counts, promotions, promoted) and `docs/evals/arena.json` (retest8), at the merged head 112a4d68.

### Round 8: `ROBOLEARN-9`, protocol 3 on fresh held-out seeds, the arena and the claw together

Round 8: `ROBOLEARN-9`, tip 0466f56a (read at the merged head 112a4d68), 6 commits of its own since a10f1ff8, merged into the head of round 8, 112a4d68; its console note is committed, and the table below is that note’s own. Each figure is a token of the commit message or note row it is quoted from, checked when this page is built.

- declare protocol 3 on held-out seeds 7241-7300 before any run ()

- OC_PROTOCOL_3, ra-lm-h48 and claw_eval --protocol 3 (amendment 1), before the held-out run ()

- protocol 3 measured once on 7241-7300 (claw3.json, arena.json retest8) ()

- the claw's model per scenario and the retest7 / protocol-3 cards on the arena panel ()

- the claw's people blocks re-mount on opt-in and revoke without a reload ()

- console note, memory and next brief ()

| What | Before | After | Source |
|---|---|---|---|
| Declared comparisons, each run once | 90 | 126 (protocol 3: 36/36, 5,220 episodes) | claw3.json; check_claw 12 |
| Promotions only with a clear interval | 0 of 0 | 2 of 2, both the reactive rule policy: AMR hard 59/60 [0.911, 0.997 ] vs bc 2/60 [0.009, 0.114 ]; port gantry hard 60/60 [0.94, 1 ] vs 50/60 [0.72, 0.907 ]; 0 rule breaks | claw3.json promotions |
| AMR change: ra-lm-h48 − bc, AMR base | ra-lm-h − bc −0.100 [−0.247, 0.052 ] (7181–7240) | −0.067 [−0.235, 0.108 ], 32/60 vs 36/60. The interval spans 0, so no claim. | arena.json retest8.comparisons.amrHeadline |
| The change's effect, ra-lm-h48 − ra-lm-h, AMR | — | 0 [−0.173, 0.173 ] (32/60 each) | retest8.comparisons.changeOnAmr |
| ra-lm-h − bc, port base | −0.033 [−0.114, 0.031 ] (7181–7240) | −0.117 [−0.222, −0.033 ], 53/60 with 7 rule breaks: ra-lm-h falls short here | retest8.comparisons.lmHPort |
| Reactive − bc, hard variants pooled | not declared | +0.372 [0.300, 0.445 ] (179/180 vs 112/180) | retest8.comparisons.reactiveHardPooled |
| ra-lm-h / ra-lm-h48 verdicts | not run by the claw | not-better on 4 scenarios each; rule-broken on 5 each (teleop, AMR, port, port hard, AMR hard) | claw3.json challengerRows |
| Refusals exercised | 3 of 3 + not-held-out | 3 of 3 + not-held-out again; the probes ran nothing | check_claw 12 |
| Governor / physical | — | 184,742 of 184,742 steps, physical 0; chain intact (273 lines); world 960 minutes, 0 physical dispatches | check_claw 12 |
| Panel: the claw's model per scenario | 0 | 9 of 9 gym scenario cards, read from claw3.json (7 kept bc, 2 promoted reactive). The 3 station cards say they are not under the claw. | check_arena 8 |
| retest7 and protocol-3 cards | none | both, static HTML, figures compared with arena.json | check_arena 8; WebXR/robotics/programme.html |
| arena.json retest8 | — | 36 rows copied from claw3.json (not a second run), plus a live bc row that reproduces the file | check_arena 11 |
| People blocks on opt-in, no reload | needed a reload | none → local on opt-in; local → none on revoke; 0 navigations, 0 page errors | $SP/loop10/rl9/drive_rl9.mjs → drive-out.txt |
| A real station pass, headless | fixture | not done (see Left) | — |
| Page module oc-claw-record.js | 101,403 B (2 records) | 160,167 B (3 records, chains trimmed) | check_claw 10 |

Source: `docs/consoles/ROBOLEARN-9.md` at the merged head 112a4d68, the evaluation table as the console wrote it (before → after, with its sources).


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
