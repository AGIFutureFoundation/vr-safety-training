# Omega Claw: the agents that run robot training and testing

Five software agents that declare each comparison before it runs, run it once on held-out seeds, audit it and promote a model only on a clear result.

## The agents that run robot training and model testing

The Omega Claw is a small group of 5 software agents that run robot training and model testing the way the hive runs robot jobs: each has an invented name and a role, none is a language model, and every decision goes into a hash chain. A planner declares each comparison before it runs, a trainer schedules training on training data only, an evaluator runs the arena once on held-out seeds, an auditor checks for leakage and reused seeds, and a promoter may promote a model only if it clearly beats the incumbent without breaking a rule. The robots are simulated and the governor’s rules stand.

- 45 declared comparisons (9 gym scenarios by 5 challengers), each run once on the held-out seeds 7121 –7180 `docs/evals/claw.json`

- 0 models promoted: no challenger beat the incumbent clone with a clear interval and no broken rule `docs/evals/claw.json`

- 3 of 3 refusal kinds exercised on purpose (an undeclared comparison, a reused held-out seed, a model whose run broke a rule) `docs/evals/claw.json`

- 960 simulated minutes the persistent world ran, with 163 jobs completed and 0 dispatches to a physical robot `docs/evals/claw.json`

### The agents

| Name | Role |
|---|---|
| Tevi, software agent | Test planner: declares every comparison before it runs |
| Okko, software agent | Trainer: schedules training rounds on training data only |
| Ressa, software agent | Evaluator: runs the arena once on held-out seeds |
| Hald, software agent | Auditor: checks leakage, seed reuse and the chain |
| Varn, software agent | Promoter: promotes only a clear, rule-clean win |

Names are invented and belong to no person. Source: `docs/evals/claw.json` (its agents block), read by the page builder; the agents are code, with no model call and no network call.

### What the comparative system did

- **Declared, run once, audited.** The protocol was declared before the run; 45 of 45 declared comparisons ran once, over 3,600 episodes and 133,061 steps, every step checked by the governor, with 0 physical dispatches. The audit finds the declaration first, each seed used once, held-out seeds only (ok), and the hash chain of 228 lines intact on a re-walk.

- **No promotion.** The incumbent is the behaviour clone. The one clear win was DAgger on fleet routing, 55 of 60 seeds against the clone’s 42 of 60 with the intervals apart (0.819 against 0.801), but its runs broke 5 rules, so the promoter refused it. Elsewhere no challenger beat the clone. Promotions: 0.

- **Refusals, with reasons.** 47 refusals: the challenger did not beat the incumbent (18), a rule was broken (18), the model did not apply to the scenario (9), an undeclared comparison (1) and a reused held-out seed (1). The last pair were probes, exercised to show that the system refuses them; the probes added no runs.

Source: `docs/evals/claw.json`; the read-only Omega Claw panel (declarations, a leaderboard per scenario with intervals, each comparison’s verdict, refusals with their reasons, the chain re-walked in the browser) is on the parishes page and in the instructor console’s Omega Claw tab. merged into the integration head.

### Robots that keep working in one world

A persistent simulation loop on the parishes page keeps the 6 robot sites running the hive’s jobs between the learner’s visits, with the promoted model per scenario, deterministic for a seed, paused while the tab is hidden, with nothing uploaded and the governor on every step.

| Measure (seed 1, 2 simulated days) | Result |
|---|---|
| Simulated minutes; jobs completed; refused by the governor; vetoed by the steward | 960; 163; 28; 8 |
| Jobs dispatched, all checked; steps monitored by the governor; dispatches to a physical robot; jobs waiting for the learner’s supervision | 190; 3,839; 0; 14 |
| Jobs completed at each of the 6 sites (port yard, warehouse aisle, campus lab, distribution aisle, drilling deck, fabrication cell) | 29; 36; 35; 37; 29; 24 |
| Scenarios run with a promoted model; runs that fell back to a scripted policy | 4; 0 |
| In the built page: simulated minutes run; jobs completed; steps checked by the governor; seconds hidden, which gave no steps | 613; 119; 2,562; 4 |
| The checker’s own run: simulated minutes, deterministic and replay-equal; catch-up after a pause capped at | 700; 480 |
| In the built page: page errors; simulation steps run while the tab was hidden; the pause control’s height on a phone, px | 0; 0; 44 |

Source: `docs/evals/claw.json` (its world block) and the console’s commit messages.

### People and robots in the same loop

The panel also shows where people and robots each need practice. For robots it names 4 scenarios (teleop pick-and-place and AMR routing, where rules were broken; the port lane’s hard variant, below its threshold; and AMR hard, where rules were broken). The learners’ own drill values reach the panel only through the data layer’s gate, are shown only when the learner is eligible, stay on the device, and the chain receives counts only. No learner was measured in this work, so the page states no figure for people.

### Read honestly

- Nothing was promoted: the claw’s record is a record of refusals. The gate is strict by design, since any rule break blocks a promotion and the clone is already perfect on 4 scenarios, where nothing can clear its interval; the promotion path is shown working only on a stub arena, where a clear win is promoted and each of the 11 refusal reasons fires for its own case. Every robot in the persistent world ran the behaviour clone, the incumbent.

- In the committed run the arena’s small model was only the contract stub, so it was not applicable in any comparison; a later run on the merged arena may differ.

- The persistent world is a simulation of the hive’s own seeded jobs, not of any real site, and its figures show that the loop runs and the governor checks it, not how well a robot works. The checker passes on the tree (8 checks) and failed on the base before this work (0 passed).

- The agents are software, with no model call; the hash chain (229 lines with the audit’s own) is the claw’s own and proves what it logged, not that its decisions were right. The trainer schedules and records, and the training itself happens inside the arena when a model is first built. In the page the world advanced more slowly than its target on a loaded machine. The panels add 233,356 and 152,007 bytes to the parishes and instructor bundles, draw nothing in the scene, and leave the phone and headset tiers unchanged (the pause control is 67 by 44 px on a phone).

**Round six ** of this loop is merged into the integration head; its figures were read from the console branches (the same commits) with a read-only git show: `OMEGA-CLAW` (branch head `3216bff4`, 7 commits of its own; its console note is committed; merged). Each figure is checked by phrase against that console’s note, a committed file or its commit messages, and a rebuild re-reads the final state.

Sources: `docs/evals/claw.json` and the console’s commit messages, read from its branch with git show; the figures are read by the script that built this page.

### Round seven: the claw’s second comparison, with the small model in it

The claw declared a second protocol at 18:51 UTC, after the arena’s declaration of the new held-out range and before running it, and ran it once at 18:53 UTC. Its seeds come only from that committed declaration, and the first protocol’s spent seeds are refused as not held out. This time the arena’s small model is really in it: 45 declared comparisons (9 scenarios by 5 challengers) on seeds 7181 –7240, 4,140 episodes and 155,744 steps, every step checked by the governor, 0 physical dispatches, and promotions: 0. There were 48 refusals: not better (23), a rule broken (22), and one each undeclared, a reused seed and a range that was not held out, exercised on purpose (4 of 4). The audit finds the declaration first and each seed once (ok), and the hash chain of 230 lines intact.

| Scenario | Small model (of 60 seeds) | Behaviour clone (the incumbent) |
|---|---|---|
| Robot-cell entry | 60 of 60, 0 | 60 of 60, 0 |
| Cobot zone setup | 57 of 60, 3 | 60 of 60, 0 |
| Teleop pick-and-place | 57 of 60, 3 | 57 of 60, 3 |
| AMR fleet routing | 40 of 60, 20 | 49 of 60, 11 |
| Drilling deck | 60 of 60, 0 | 60 of 60, 0 |
| Port gantry | 45 of 60, 0 | 60 of 60, 0 |
| Drilling deck, hard | 60 of 60, 0 | 60 of 60, 0 |
| Port gantry, hard | 40 of 60, 0 | 44 of 60, 0 |
| AMR fleet routing, hard | 7 of 60, 12 | 4 of 60, 9 |

As measured: equal to the clone on cell entry and on the drilling deck, base and hard; below it on the port gantry and its hard variant; and it breaks more rules on AMR routing and on AMR hard, as the clone also does. The one DAgger result worth a look is on AMR routing, 57 of 60 against the clone’s 49 of 60, but its lower bound (0.863) is not above the clone’s upper bound (0.894) and its runs broke 2 rules, so nothing was promoted. Source: `docs/evals/claw2.json`.

**People and robots side by side.** For each robot scenario the panel now lists the learner stations that match it, at the operator and technician levels of the programme tracks, next to the robot’s model, success and gap. A learner’s own passes appear only through the data layer’s gate, on that device. The port gantry and its hard variant have no matching station and are shown as a gap in the programme (ok). The panel has a protocol select (44 px high) for both records, and the checker passes 10 checks with 0 failing.

In all the small model ties the clone on 4 scenarios, falls short on 2 and breaks rules on 4. Both protocols together declare 90 comparisons, each run once. DAgger’s interval on AMR routing overlaps the clone’s and it broke rules. The arena’s hidden-layer model was not compared by the claw: it measured its own comparison on the same seeds, once each, and the next claw protocol would declare it first. The hand-written reactive agent is not a declared challenger, so nothing is claimed for it. The side-by-side panel has 9 rows and shows robot gaps on 4 scenarios, including the port gantry’s hard variant, where the clone reaches 0.733. On the learner side the traffic drill was played through its own buttons; the one station pass is a fixture, not a played station. The claw checker now runs 11 checks.

The persistent world ran on: 960 simulated minutes over 2 days (seed 2), 141 jobs completed, 40 refused by the governor, 11 vetoed by the steward, 173 dispatched and all checked, 3,024 steps monitored and 0 dispatches to a physical robot, every scenario still on the incumbent clone. Source: `docs/evals/claw2.json`.

**Round seven ** of this loop is merged; its figures were read from the console branches with a read-only git show: `CLAW-2` (branch head `7940a087`, 6 commits of its own; its console note is committed; merged). Each figure is checked against a committed file or a commit message, and a rebuild re-reads the final state.

### Protocol 3: declared first, run once on fresh held-out seeds

`ROBOLEARN-9` committed the protocol before any run, then ran it once on seeds 7241–7300: 36 declared comparisons, 5,220 episodes, 184,742 of 184,742 steps checked by the governor and 0 physical dispatches. There were 2 promotions, both of them the reactive rule policy. That policy is hand-written, not trained: the result says a simple rule beats the clone on those hard variants, not that a learned model improved. The clone stays the incumbent on 7 of 9 scenarios.

- the port gantry, hard variant: the reactive rule policy’s interval 0.94–1 lies above the clone’s 0.72–0.907, with no rule broken.
- AMR fleet routing, hard variant: the reactive rule policy’s interval 0.911–0.997 lies above the clone’s 0.009–0.114, with no rule broken.

The declared change for the AMR base gap, a small model with a wider hidden layer, did not close it: 32/60 against the clone’s 36/60 successes, a difference of −0.067 (interval −0.235 to 0.108), so no claim is made.

Sources: `docs/evals/claw3.json` (counts, promotions, promoted) and `docs/evals/arena.json` (retest8), at the merged head 112a4d68.

Round 8: the claw’s next protocol was run by `ROBOLEARN-9` together with the arena; its commits and evaluation table are in the arena section ([Arena]).


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
