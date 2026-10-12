# Roadmap and changelog

What is built, what is next, and what each build loop added, measured before and after.

## Now, next, then, scale

Built means it is in the repository and its checker passes today. Planned means a decision to build it; the date is not fixed. Open means a known gap.

 Now

### Simulated cells, in the repository

- **Built** Robot gym with 9 scenarios; behaviour cloning scored on 60 held-out seeds.
- **Built** Gym scenarios for a ceiling-drilling robot and a port gantry: both clones reach the expert on 60 held-out seeds (1.00 and 1.00), and the expert never breaks the barricade or stop-zone rule.
- **Built** Consent-first recorder; the scripted stand-in trains to 0.967, as well as synthetic takes.
- **Built** Governor: 200 of 200 unsafe jobs blocked, 0 of 200 safe jobs wrongly blocked.
- **Built** Programme: 30 of 30 track levels with a robot station; 4 of 4 gaps closed.
- **Built** Controller, touch and pointer pose sources, with the arm at a robot site following; the recorded-against-synthetic comparison on 2 tasks.
- **Built** A WebXR session loop in the parishes app that feeds the pad and does nothing outside a session; the pad drives 2 tasks and replays a ghost on the rig. Loop steps live in the app: 3 of 5 → 5 of 5.
- **Built** A learner's own consented takes can train the agent-jobs provider, with an honest label on its card, and revoking returns it to synthetic demonstrations.
- **Built** Agent-jobs panel with a cloned policy as provider, under the governor: 28 of 30 safe jobs completed.
- **Built** A K-12 version of the agent-supervision station, content score 95.
- **Built** 742 stations, 133 checkers in the gate.
- **Built** Each of the 6 gym scenarios has an exported synthetic dataset (LeRobot and RLDS layouts, licence CC0-1.0) with a dataset card, the cloned policy's parameters and an eval card that says what it is not.
- **Built** Hard variants of the drilling and port scenarios, seeded and scored on 60 held-out seeds: the drilling clone holds at 1.00 against the expert's 1.00, and the port clone falls to 0.717 against 1.00, a gap of 0.283 reported as it is.
- **Built** The cell-task ghost walks a figure to each control and poses the arm by the robot's mode: 1 → 2 ghost tasks that move the product's own scene.
- **Built** Learner-data terms (a draft for counsel), a bench protocol that is a method, with 0 hardware runs reported, and a static report card for each of 6 policies.
- **Built** A pilot kit: a map from a cohort pilot to what the repository holds, and what it does not (the pilot page of this whitepaper).
- **Built** The page-level proof, observed in the built page: an adult test profile opts in, makes 3 takes on the pad, and the agent-jobs card reads "your 3 takes"; after a revoke it reads synthetic demonstrations and the store holds 0 episodes, with 0 page errors. It had failed on the first drive: finding why took 3 fixes to the recorder's store write.
- **Built** The hard variants are pinned by checkers (0 → 3) and are teleop tasks: recorded-against-synthetic on 6 tasks, up from 4.
- **Built** A third hard variant, fleet routing with a second crossing and a blocked aisle cell, measured like the others: the clone reaches 0.05 against the expert's 1.00, a gap of 0.95, reported as it is.
- **Built** Governor with a per-agent rate limit (default 20 a minute) and a learned anomaly check beside its rules: refusal reasons 9 → 11; rule-legal injections caught 66 of 100 (the rules alone 0 of 100); 0 of 200 held-out safe jobs wrongly refused. Both add a refusal and never a permission.
- **Built** Registry export and import between devices as a file a person carries: a round trip of 200 of 200 seeded lineage graphs came back identical, and tampered files were refused 50 of 50, each with a named reason.
- **Built** Preference pairs train a reward model (a Bradley–Terry model on whole-run features; synthetic pairs from a synthetic rater, labelled so; a learner's own pairs join only while they opt in). Used to rank and keep the top half of the demonstrations before cloning, it did not beat the rule filter: fleet routing 0.483 against 0.817 rule-filtered and 0.600 unfiltered, its hard variant 0.05 against 0.05 and 0.117, on 60 held-out seeds, reported as it is.
- **Built** Software-agent baselines for the 3 hard variants: random 0 of 3 and the scripted expert 3 of 3 on each; the text-reading agents do not apply to a gym observation.
- **Built** The lineage as a figure on the policy report: consent → dataset → policy → eval → deployment (0 learner consents, 6 synthetic datasets, 6 clones, 12 measured evals, 6 simulated sites). Next

### Richer demonstrations

- *Planned* A real headset session for the recorder: the controller source is proven with stubbed sessions only.
- *Open* The fleet-routing hard variant: the clone completes only 3 of 60 runs, a gap of 0.95 to the expert. Five rounds of corrections labelled by the scripted expert (not a person) left it at 0.05: its features cannot express the expert's choices (the best any policy over them could agree is 0.696). With four route features the same rounds reach 0.417, a gap of 0.583. Closing the rest is open and measured as it is.
- *Planned* The page proof in the gate: the drive is a script (`tools/drive_robotrain_page.mjs`) that exits with an error when the proof fails, but it is not in the gate, because adding it needs the coordinator's idle-machine timing.
- *Planned* A per-agent cadence baseline for the anomaly check: it catches 17 of 50 fast repeats, and its history is a procedural stand-in, not any site's own accepted-job log. Then

### Sim to real

- *Planned* The first measured real learners, adults who opt in, so the tutor's figures stop being simulated.
- *Planned* The deployment's own proxy that would hold an agent protocol's SDK and keys, described in the docs and not built.
- *Open* No hardware result exists. No claim here depends on one.
- *Planned* Pilot cells with robot hardware: the same task scored the same way in the Holodeck and on the bench by the protocol in `docs/bench-protocol.md`, with the gap measured and published, whatever it is. Scale

### Cohorts and fleets

- *Planned* Consenting crews' practice keeps improving the policies their site uses, with lineage from consent to deployment.
- *Planned* Per-site policy evaluation dashboards.
- *Planned* A first cohort runs the 30 programme templates at a union hall, school or employer; the pilot page lists what it would bring and what is missing.
- *Planned* A lineage diagram instead of a table in the governance view (the policy report has one).

Only the Now column is built. Planned items come from the "Left" lists in the build consoles' own notes and from the pitch page's roadmap, not from a sales plan, and none of them is promised for a date. This page states no hardware result, price, valuation or revenue.


## Measured, loop by loop

What each loop added, with the measure before and after and the repository file the figure comes from. A row appears only when its console has committed the file; a result that is a gap stays a gap.

| Measure | Before → after | Source file | Loop · date committed |
|---|---|---|---|
| **Loop 7: `ROBOSCENARIOS` and `ROBOTRAIN-3`, merged before the next loop began** | | | |
| Robot sites with a robot-side result (construction robot, port yard) | 0 of 2 → 2 of 2 | `docs/consoles/ROBOSCENARIOS.md` | Loop 7 · 6 Oct 2026 |
| Gym scenarios (games) | 4 → 6 | `docs/consoles/ROBOSCENARIOS.md` | Loop 7 · 6 Oct 2026 |
| Ceiling-drilling robot, 60 held-out seeds: random / cloned / expert | none → 0.00 / 1.00 / 1.00 | `docs/evals/colearn.json` via `docs/consoles/ROBOSCENARIOS.md` | Loop 7 · 6 Oct 2026 |
| Port lane, 60 held-out seeds: random / cloned / expert | none → 0.00 / 1.00 / 1.00 | `docs/evals/colearn.json` via `docs/consoles/ROBOSCENARIOS.md` | Loop 7 · 6 Oct 2026 |
| Tasks the recorder compares recorded against synthetic takes on | 2 → 4 | `docs/consoles/ROBOSCENARIOS.md` | Loop 7 · 6 Oct 2026 |
| Programme robot stations with a software-agent baseline | 10 of 16 → 16 of 16 | `docs/consoles/ROBOSCENARIOS.md` | Loop 7 · 6 Oct 2026 |
| Expert invariant violations over the held-out steps | 0 of 2,734 | `docs/consoles/ROBOSCENARIOS.md` | Loop 7 · 6 Oct 2026 |
| Learning-loop steps live in the app without hand-wiring | 3 of 5 → 5 of 5 | `docs/consoles/ROBOTRAIN-3.md` | Loop 7 · 6 Oct 2026 |
| Tasks the teleoperation pad drives | 1 → 2 | `docs/consoles/ROBOTRAIN-3.md` | Loop 7 · 6 Oct 2026 |
| Ghost frames on the cell task; XR frames fed to the pad outside a session | 27; 0 | `docs/consoles/ROBOTRAIN-3.md` | Loop 7 · 6 Oct 2026 |
| Page errors in the headless drive | 0 | `docs/consoles/ROBOTRAIN-3.md` | Loop 7 · 6 Oct 2026 |
| Robotics checker checks | 253 → 291 | `docs/consoles/ROBOTRAIN-2.md` and `docs/consoles/ROBOTRAIN-3.md` | Loop 7 · 6 Oct 2026 |
| **Loop 8: `ROBOEXPORT` and `ROBOTRAIN-4`, both finished and committed at integration after their consoles ran out of budget** | | | |
| Gym scenarios with an exported synthetic dataset and a policy file with its eval card | 0 of 6 → 6 of 6 | `exports/robotics/index.json` via `docs/consoles/ROBOEXPORT.md` | Loop 8 · 12 Oct 2026 |
| Synthetic demonstration episodes exported; of them kept as clean passes | none → 240; 161 | `exports/robotics/index.json` | Loop 8 · 12 Oct 2026 |
| Policies with a static evaluation report card | 0 → 6 | `docs/perf/robot-policies.html` via `docs/consoles/ROBOEXPORT.md` | Loop 8 · 12 Oct 2026 |
| Documents the whitepaper FAQ marked missing (the learner-data terms, a draft for counsel) | 1 → 0 | `docs/learner-data-terms.md` via `docs/consoles/ROBOEXPORT.md` | Loop 8 · 12 Oct 2026 |
| Hardware runs reported by the bench protocol | 0 (a method, not a result) | `docs/bench-protocol.md` | Loop 8 · 12 Oct 2026 |
| Scenario variants with a random / clone / expert result | 2 → 4 | `docs/evals/colearn.json` via `docs/consoles/ROBOTRAIN-4.md` | Loop 8 · 12 Oct 2026 |
| Ceiling-drilling robot, hard variant, 60 held-out seeds: random / clone / expert | 0.00 / 1.00 / 1.00; gap 0.00 | `docs/evals/colearn.json` | Loop 8 · 12 Oct 2026 |
| Port lane, hard variant, 60 held-out seeds: random / clone / expert | 0.00 / 0.717 / 1.00; gap 0.283 | `docs/evals/colearn.json` | Loop 8 · 12 Oct 2026 |
| Ghost tasks that move the product's own in-world scene (the arm, and now the cell walker) | 1 → 2 | `docs/consoles/ROBOTRAIN-4.md` | Loop 8 · 12 Oct 2026 |
| Open page-level proof (the provider card after a take, in the headless page) | 1 open → 1 open: the store flush landed, the drive was not run | `docs/consoles/ROBOTRAIN-4.md` | Loop 8 · 12 Oct 2026 |
| **Loop 9: `ROBOTRAIN-5`, the open proof observed and the hard variants pinned** | | | |
| Open page-level proof (the provider card after a take, in the built page) | 1 open → 0: observed, with 0 page errors | `docs/consoles/ROBOTRAIN-5.md` | Loop 9 · 12 Oct 2026 |
| Takes on the store when the flush resolves, in the built page (the fix to the recorder's store write) | 1 → 3; the revoke leaves 0 | `docs/consoles/ROBOTRAIN-5.md` | Loop 9 · 12 Oct 2026 |
| Hard variants pinned by a checker | 0 → 3 | `docs/consoles/ROBOTRAIN-5.md` | Loop 9 · 12 Oct 2026 |
| Hard variants with a random / clone / expert result | 2 → 3 | `docs/evals/colearn.json` via `docs/consoles/ROBOTRAIN-5.md` | Loop 9 · 12 Oct 2026 |
| Fleet routing, hard variant, 60 held-out seeds: random / clone / expert | 0.00 / 0.05 / 1.00; gap 0.95 | `docs/evals/colearn.json` | Loop 9 · 12 Oct 2026 |
| Tasks the recorder compares recorded against synthetic takes on | 4 → 6 | `docs/consoles/ROBOTRAIN-5.md` | Loop 9 · 12 Oct 2026 |
| Hard port lane, recorded / synthetic through the pose path | 0.650 / 0.717 | `docs/consoles/ROBOTRAIN-5.md` | Loop 9 · 12 Oct 2026 |
| Robotics checker checks; roboscenarios rows | 291 → 334; 10 → 12 | `docs/consoles/ROBOTRAIN-5.md` | Loop 9 · 12 Oct 2026 |
| **Loop 9: `GOVERNOR-2`, a rate limit and an anomaly check for the governor, and the registry between devices** | | | |
| Governor refusal reasons (rate-limited, anomalous added) | 9 → 11 | `docs/consoles/GOVERNOR-2.md` | Loop 9 · 12 Oct 2026 |
| Burst of 40 requests from one agent: over-limit requests refused | 0 of 20 → 20 of 20 | `docs/consoles/GOVERNOR-2.md` | Loop 9 · 12 Oct 2026 |
| Rule-legal anomaly injections caught (the rules alone, then with the anomaly check) | 0 of 100 → 66 of 100 | `docs/consoles/GOVERNOR-2.md` | Loop 9 · 12 Oct 2026 |
| Safe jobs wrongly refused: held-out; sitting on a limit | 0 of 200; 0 of 200 | `docs/consoles/GOVERNOR-2.md` | Loop 9 · 12 Oct 2026 |
| Registry round trip, seeded lineage graphs: identical | 0 of 200 → 200 of 200 | `docs/consoles/GOVERNOR-2.md` | Loop 9 · 12 Oct 2026 |
| Tampered registry documents refused with a named reason | 0 of 50 → 50 of 50 | `docs/consoles/GOVERNOR-2.md` | Loop 9 · 12 Oct 2026 |
| Governor checker checks; enterprise checker checks | 14 → 18; 13 → 16 | `docs/consoles/GOVERNOR-2.md` | Loop 9 · 12 Oct 2026 |

Before values are those the consoles' own evaluation tables give for the head before the loop. Simulated: seeded simulator runs, synthetic demonstrations. The date is the commit date of the console note.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `bd748fca`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
