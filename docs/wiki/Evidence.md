# Evidence: every measured number with its file

The single table of every number the whitepaper uses, with the repository file it comes from and what kind of number it is.

## Every measured number, with its file

Every number in this whitepaper is in the table below with the repository file it comes from. The right-hand column says what kind of number it is. Nothing here comes from hardware or from measured learners.

| Measure | Value | Source file | Kind |
|---|---|---|---|
| **COLEARN: behaviour cloning on held-out seeds (random / cloned / scripted expert)** | | | |
| Robot Cell Entry, success on 60 seeds; demonstrations kept 24 of 40 | 0.00 / 1.00 / 1.00 | `docs/evals/colearn.json` | simulated |
| Cobot Safety-Zone Setup; kept 39 of 40 | 0.05 / 1.00 / 1.00 | `docs/evals/colearn.json` | simulated |
| Teleop Pick-and-Place; kept 19 of 40. Cloned from every demonstration: 0.00 | 0.00 / 0.967 / 0.983 | `docs/evals/colearn.json` | simulated |
| AMR Fleet Routing; kept 37 of 40. With the reservation rule: 0.867. From every demonstration: 0.60 | 0.00 / 0.817 / 1.00 | `docs/evals/colearn.json` | simulated |
| Ceiling-Drilling Robot Set-Up, success on 60 seeds; demonstrations kept 17 of 40 | 0.00 / 1.00 / 1.00 | `docs/evals/colearn.json` | simulated |
| Port Automation Lane (gantry), success on 60 seeds; demonstrations kept 25 of 40 | 0.00 / 1.00 / 1.00 | `docs/evals/colearn.json` | simulated |
| Teleoperation tasks the recorded-against-synthetic comparison covers, before and after the construction and port tasks | 2 → 4 | `docs/consoles/ROBOSCENARIOS.md` | count |
| Drilling pendant and port joystick through the pose path, N = 40: recorded takes kept 27 of 40 and 28 of 40; recorded against synthetic | 1.0 / 1.0 | `docs/consoles/ROBOSCENARIOS.md` | simulated |
| Scripted-expert steps that break a rule (person inside the barricade, busy crossing, pinned keep-out), out of 2,734 steps | 0 | `docs/consoles/ROBOSCENARIOS.md` | simulated |
| Programme robot stations with a software-agent baseline, before and after | 10 of 16 → 16 of 16 | `docs/consoles/ROBOSCENARIOS.md` | count |
| Construction and port scenarios with a robot-side result, before and after | 0 → 2 | `docs/evals/colearn.json` | count |
| The catalog's robot stations as tasks, 10 held-out seeds; kept 13 of 20, 6 of 20, 12 of 20 | 0.00 / 1.00 / 1.00 | `docs/evals/colearn.json` | simulated |
| Adaptive tutor against static hints, 300 simulated learners: mistakes saved per learner (interval 0.66 to 2.10) | 1.38 | `docs/evals/colearn.json` | simulated |
| The same, steps to pass (interval 0.25 to 9.11) | 4.68 | `docs/evals/colearn.json` | simulated |
| Where one static hint suits everyone, steps to pass (interval −7.64 to −0.03): the adaptive tutor is worse | −3.84 | `docs/evals/colearn.json` | simulated |
| **ROBOTRAIN: recorded against synthetic takes, Teleop Pick-and-Place** | | | |
| Pose-driven recorded takes (scripted stand-in for a human), N = 40: kept 18 of 40; mean steps 83.9 | 0.967 | `docs/consoles/ROBOTRAIN.md` | simulated |
| Synthetic demonstrations, N = 40: kept 19 of 40; mean steps 62.6 | 0.967 | `docs/consoles/ROBOTRAIN.md` | simulated |
| Programme gaps with a robot station of their own, before and after | 0 of 4 → 4 of 4 | `docs/consoles/ROBOTRAIN.md` | count |
| Robot Cell Entry through the pose path, N = 40: recorded takes kept 28 of 40; synthetic | 1.0 / 1.0 | `docs/consoles/ROBOTRAIN-2.md` | simulated |
| Tasks the recorded-against-synthetic comparison covers | 2 | `docs/consoles/ROBOTRAIN-2.md` | count |
| Seeded safe agent jobs completed with the cloned-policy provider; with the scripted expert | 28 of 30 / 30 of 30 | `docs/consoles/ROBOTRAIN-2.md` | simulated |
| Governor verdicts on the steps of the cloned-policy jobs | 413 of 413 | `docs/consoles/ROBOTRAIN-2.md` | simulated |
| Learning-loop steps live in the app without hand-wiring (demonstrate, consent, train on own takes, evaluate, demonstrate back), before and after | 3 of 5 → 5 of 5 | `docs/consoles/ROBOTRAIN-3.md` | count |
| Provider trained on a consented learner's own takes, Node run: takes; governor verdict on the job's steps | 12 · 31 of 31 | `docs/consoles/ROBOTRAIN-3.md` | simulated |
| Tasks the teleoperation pad drives, before and after; ghost frames on the cell task | 1 → 2 · 27 | `docs/consoles/ROBOTRAIN-3.md` | count |
| XR frames fed to the pad outside a session; page errors in the headless drive | 0 · 0 | `docs/consoles/ROBOTRAIN-3.md` | count |
| Pose sources for the teleoperation pad, before and after | 1 → 3 | `docs/consoles/ROBOTRAIN-2.md` | count |
| **AGENTGYM: software agents on the stations (pass = finished, 2 or more stars, no hazard hit)** | | | |
| Stations usable as agent tasks; seeds each; episodes per baseline | 721 · 3 · 2,163 | `docs/perf/agent-baselines.json` and `docs/consoles/AGENTGYM.md` | count |
| Random: pass rate (95% interval); hazard hits per episode 70.95 | 0.0% (0.0–0.2%) | `docs/perf/agent-baselines.json` and `docs/consoles/AGENTGYM.md` | simulated |
| Retrieval over the station's sourced text: hazard hits per episode 0.79 | 0.6% (0.4–1.0%) | `docs/perf/agent-baselines.json` and `docs/consoles/AGENTGYM.md` | simulated |
| Retrieval that asks for hints: hazard hits per episode 0.36; hints per episode 9.92 | 11.5% (10.2–12.9%) | `docs/perf/agent-baselines.json` and `docs/consoles/AGENTGYM.md` | simulated |
| Scripted expert (sees the targets; an upper bound): hazard hits per episode 0 | 100% (99.8–100.0%) | `docs/perf/agent-baselines.json` and `docs/consoles/AGENTGYM.md` | simulated |
| Robot stations only: 16 stations, 48 episodes per baseline. Random, retrieval, retrieval that asks, expert | 0% / 6.3% / 31.3% / 100% | `docs/perf/agent-baselines-robotics.json` | simulated |
| **VBRIDGE: the safety governor between software agents and simulated robots** | | | |
| Seeded unsafe agent jobs blocked, before the governor existed | 0 of 200 | `docs/consoles/VBRIDGE.md` | simulated |
| Seeded unsafe agent jobs blocked after, each for the intended reason | 200 of 200 | `docs/consoles/VBRIDGE.md` | simulated |
| Seeded safe jobs wrongly blocked | 0 of 200 | `docs/consoles/VBRIDGE.md` | simulated |
| Safe jobs run end to end to COMPLETED | 50 of 50 | `docs/consoles/VBRIDGE.md` | simulated |
| Refusal reasons that fire alone as the primary reason, in the VBRIDGE note (the original reasons); in the current checker every one of the 11 reasons fires: 11 of 11 | 9 of 9 | `docs/consoles/VBRIDGE.md` | simulated |
| Bad provider configurations refused | 12 of 12 | `docs/consoles/VBRIDGE.md` | simulated |
| Governor refusal reasons in the shared export; job phases; GAME-style functions across 4 workers | 11 · 7 · 24 | `exports/shared/holodeck-shared.json` and `exports/shared/vb-game-functions.json` | count |
| Checker checks passed, failed, in the VBRIDGE console's own note (the checker now passes 18, see the `GOVERNOR-2` rows) | 14, 0 | `docs/consoles/VBRIDGE.md` | count |
| **`ENTERPRISE-3`: consent revoke marks dependent policies stale** | | | |
| Seeded random lineage graphs; deployments flagged correctly | 200 · 797 of 797 | `docs/consoles/ENTERPRISE-3.md` | simulated |
| Stale-marking precision and recall | 1.000 · 1.000 | `docs/consoles/ENTERPRISE-3.md` | simulated |
| Checker checks passed, in the `ENTERPRISE-3` note (the checker now passes 16) | 13 | `docs/consoles/ENTERPRISE-3.md` | count |
| **Programme coverage** | | | |
| Tracks × levels, each level with a robot station of its own | 6 × 5 = 30 of 30 | `docs/robotics-programme.md` and `docs/consoles/ROBOPROG.md` | count |
| The same measure before the programme was built | 15 of 30 | `docs/robotics-programme.md` and `docs/consoles/ROBOPROG.md` | count |
| Robot-station places per level: awareness, operator, technician, integrator, AI-training | 12 · 13 · 17 · 21 · 24 | `docs/robotics-programme.md` | count |
| Module score required per level, in the same order | 60 · 75 · 80 · 85 · 85 | `docs/robotics-programme.md` | count |
| Learning-loop steps live on the programme page | 5 of 5 | `docs/consoles/ROBOTRAIN.md` | count |
| **Platform: counts and content scores** | | | |
| Scored training stations; programmes | 742 · 61 | `docs/investor/platform-summary.json` | count |
| Content evaluation over 742 stations: mean; scoring 95 or more; 90 to 94; below 90 | 95.8 · 612 · 126 · 4 | `docs/investor/platform-summary.json` | content score |
| Quality-gate checkers in the full run | 133 | `tools/check_all.mjs` | count |
| Robotics facets ready in the shared export; robot sites; gym scenarios | 6 of 6 · 6 · 9 | `exports/shared/holodeck-shared.json` | count |
| Character registry entries with a sprite; figure fits the role, before and after | 57 · 23 of 57 → 57 of 57 | `docs/consoles/AVATARS.md` | count |
| **Robot-training stations: content score (steps, hazards, interruptions)** | | | |
| Teaching a robot from the pendant (`rt-teach-pendant-safe-jogging`) | 96 (13, 4, 2) | `docs/investor/stations.csv` | content score |
| Measuring a cobot's contact forces (`rt-cobot-power-force-limit-check`) | 98 (13, 4, 2) | `docs/investor/stations.csv` | content score |
| Bringing a robot back after an e-stop (`rt-robot-estop-recovery-and-restart`) | 96 (13, 4, 2) | `docs/investor/stations.csv` | content score |
| Setting up speed-and-separation monitoring (`rt-speed-separation-monitoring-setup`) | 98 (13, 4, 2) | `docs/investor/stations.csv` | content score |
| Collecting a robot demonstration safely (`rp-teleop-demonstration-collection`) | 97 (13, 4, 2) | `docs/investor/stations.csv` | content score |
| Reviewing a robot policy's evaluation (`rp-robot-policy-evaluation-review`) | 98 (13, 4, 2) | `docs/investor/stations.csv` | content score |
| Ceiling-drilling robot set-up (`rp-construction-drilling-robot-setup`) | 98 (12, 4, 2) | `docs/investor/stations.csv` | content score |
| Supervising robots dispatched by software agents (`vb-supervising-agent-dispatched-robots`) | 98 (13, 4, 2) | `docs/investor/stations.csv` | content score |
| Concrete drilling and silica dust cues (`sil-concrete-drilling-and-silica-dust-cues`) | 97 (14, 4, 2) | `docs/investor/stations.csv` | content score |
| K-12: how a robot knows to stop (`k12-rp-how-a-robot-knows-to-stop`) | 95 (13, 4, 2) | `docs/investor/stations.csv` | content score |
| K-12: dust you cannot see at a building site (`k12-sil-dust-you-cannot-see-at-a-building-site`) | 95 (13, 4, 2) | `docs/investor/stations.csv` | content score |
| AMR fleet traffic and e-stop drill (`ad-amr-fleet-traffic-and-estop-drill`) | 95 (14, 4, 2) | `docs/investor/stations.csv` | content score |
| Cobot risk assessment and speed-and-separation (`ad-cobot-risk-assessment-and-speed-separation`) | 96 (14, 4, 2) | `docs/investor/stations.csv` | content score |
| Robot cell lockout and safe re-entry (`ad-robot-cell-lockout-and-safe-reentry`) | 93 (14, 4, 2) | `docs/investor/stations.csv` | content score |
| AMR traffic-zone entry and lockout (`tw-amr-traffic-zone-entry-and-lockout`) | 96 (12, 4, 2) | `docs/investor/stations.csv` | content score |
| **ROBOEXPORT: labelled synthetic datasets and policy cards for the gym scenarios** | | | |
| Gym scenarios exported, each with a dataset card, the cloned policy's parameters and an eval card | 6 | `exports/robotics/index.json` | count |
| Synthetic demonstration episodes across them; episodes kept as clean passes for training | 240 · 161 | `exports/robotics/index.json` | count |
| Steps in those episodes | 6,395 | `exports/robotics/index.json` | count |
| Licence of the simulated data; held-out evaluation seeds | CC0-1.0 · 7001–7060 | `exports/robotics/index.json` | count |
| **`ROBOTRAIN-4`: hard variants of the drilling and port scenarios (random / cloned / scripted expert)** | | | |
| Ceiling-Drilling Robot Set-Up, hard (a second person enters the barricade; the bit wears at a random rate), success on 60 seeds; demonstrations kept 20 of 40 | 0.00 / 1.00 / 1.00 | `docs/evals/colearn.json` | simulated |
| Port Automation Lane, hard (a second pedestrian with random timing and a lane obstruction), success on 60 seeds; demonstrations kept 24 of 40. The gap to the expert is reported as it is | 0.00 / 0.717 / 1.00; gap 0.283 | `docs/evals/colearn.json` | simulated |
| Ghost tasks that move the product's own in-world scene (the arm; now the cell walker too), before and after | 1 → 2 | `docs/consoles/ROBOTRAIN-4.md` | count |
| **`ROBOTRAIN-5`: the page-level proof, the hard variants pinned** | | | |
| Open roadmap proofs (the provider card after a take, in the built page), before and after | 1 → 0 | `docs/consoles/ROBOTRAIN-5.md` | observed |
| Takes on the store when the flush resolves, built page, before and after the fix; page errors | 1 → 3; 0 | `docs/consoles/ROBOTRAIN-5.md` | observed |
| Fleet Routing, hard (a second walkway crossing with random timing; one blocked aisle cell), success on 60 seeds; demonstrations kept 32 of 40. With the reservation rule: 0.067; cloned from every demonstration: 0.117. The gap to the expert is reported as it is | 0.00 / 0.05 / 1.00; gap 0.95 | `docs/evals/colearn.json` | simulated |
| Hard variants pinned by a checker, before and after; hard variants with a measured result, before and after | 0 → 3; 2 → 3 | `docs/consoles/ROBOTRAIN-5.md` | count |
| Teleop tasks the recorded-against-synthetic comparison covers, before and after the hard variants joined | 4 → 6 | `WebXR/shared/rt-teleop.js` via `docs/consoles/ROBOTRAIN-5.md` | count |
| Hard drilling through the pose path, N = 40: recorded against synthetic | 1.000 / 1.000 | `docs/consoles/ROBOTRAIN-5.md` | simulated |
| Hard port lane through the pose path, N = 40: recorded against synthetic. The lagging stand-in's clone does worse | 0.650 / 0.717 | `docs/consoles/ROBOTRAIN-5.md` | simulated |
| Robotics checker checks; roboscenarios rows, before and after | 291 → 334; 10 → 12 | `docs/consoles/ROBOTRAIN-5.md` | count |
| **`GOVERNOR-2`: a per-agent rate limit, a learned anomaly check, the registry between devices** | | | |
| Governor refusal reasons, before and after (`rate-limited`, `anomalous`); default limit per agent per minute | 9 → 11; 20 | `exports/shared/holodeck-shared.json` via `docs/consoles/GOVERNOR-2.md` | count |
| A burst of 40 requests a second apart from one agent: over-limit requests refused, before and after | 0 of 20 → 20 of 20 | `docs/consoles/GOVERNOR-2.md` | simulated |
| Rule-legal anomaly injections caught, before (the rules alone) and after; of them by payload; by a fast repeat | 0 of 100 → 66 of 100; 49 of 50; 17 of 50 | `docs/consoles/GOVERNOR-2.md` | simulated |
| Safe jobs wrongly refused: held-out accepted-distribution jobs; jobs sitting on a limit. The injections are rule-legal by construction | 0 of 200; 0 of 200 | `docs/consoles/GOVERNOR-2.md` | simulated |
| Anomaly detector: z-score threshold in standard deviations; features; seeded accepted-job history it is fitted to (a stand-in, not a site's data) | 4; 4; 480 | `docs/consoles/GOVERNOR-2.md` | count |
| Registry export and import, 200 seeded lineage graphs: round trip identical, before and after | 0 of 200 → 200 of 200 | `docs/consoles/GOVERNOR-2.md` | simulated |
| Tampered registry documents refused with the expected named reason, before and after; forked documents refused | 0 of 50 → 50 of 50; 20 of 20 | `docs/consoles/GOVERNOR-2.md` | simulated |
| Governor checker checks; enterprise checker checks, before and after | 14 → 18; 13 → 16 | `docs/consoles/GOVERNOR-2.md` | count |

Simulated: produced by the simulator on seeded runs, with synthetic demonstrations or simulated learners. Count: read from the data the repository ships. Content score: the platform's own station evaluation, scored out of 100. Each value is re-checked against its file by the build script that wrote this table. The scripted expert sees the targets, so it is a ceiling and not a competitor.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `bd748fca`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
