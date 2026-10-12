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
- **Built** Each of the 6 gym scenarios has an exported synthetic dataset (LeRobot and RLDS layouts, licence CC0-1.0) with a dataset card, the cloned policy's parameters and an eval card that says what it is not. Next

### Richer demonstrations

- *Planned* A real headset session for the recorder: the controller source is proven with stubbed sessions only.
- **Built** The page-level proof of a learner's own takes training the provider, observed in the built page (headless, loop 9): an adult test profile opts in on the Me tab, makes 3 takes, the provider card reads "your 3 takes", and revoking returns it to "synthetic demonstrations" with 0 episodes stored; page errors 0, external requests 0. The drive's output is in `docs/consoles/ROBOTRAIN-5.md`.
- **Built** A cell-entry ghost on the rig with the walker drawn (loop 8), pinned by `check_robotrain` section 9 (loop 9).
- *Planned* A learned anomaly check and a per-agent rate limit beside the governor's rules.
- *Open* Preference ratings are recorded and paired; nothing trains on them yet. Then

### Sim to real

- *Planned* Pilot cells with robot hardware: the same task scored the same way in the Holodeck and on the bench, with the gap measured and published, whatever it is.
- *Planned* The first measured real learners, adults who opt in, so the tutor's figures stop being simulated.
- *Planned* The deployment's own proxy that would hold an agent protocol's SDK and keys, described in the docs and not built.
- *Open* No hardware result exists. No claim here depends on one. Scale

### Cohorts and fleets

- *Planned* Cohorts run the 30 programme templates at union halls, schools and employers.
- *Planned* Consenting crews' practice keeps improving the policies their site uses, with lineage from consent to deployment.
- *Planned* Registry export and import between devices; a lineage diagram instead of a table.
- *Planned* Per-site policy evaluation dashboards.

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

Before values are those the consoles' own evaluation tables give for the head before the loop. Simulated: seeded simulator runs, synthetic demonstrations. The date is the commit date of the console note.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `be2f2b68`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
