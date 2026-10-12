# Evidence: every measured number with its file

The single table of every number the whitepaper uses, with the repository file it comes from and what kind of number it is.

## Every measured number, with its file

Every number in this whitepaper comes from the repository file named beside it; the measured ones are in the table below. The right-hand column says what kind of number it is. Nothing here comes from hardware or from measured learners.

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
| Quality-gate checkers in the full run | 153 | `tools/check_all.mjs` | count |
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
| **`OMEGA-HIVE`: software agents with personalities, over the robot job stream** | | | |
| Agents with a persona, voice and avatar, before and after | 0 → 7 | `docs/consoles/OMEGA-HIVE.md` | count |
| Speaker named from a line by a naive-Bayes classifier, 5,686 held-out lines (chance 0.143; always guessing the most common speaker 0.269; the same events in one neutral style 0.870) | 0.950 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Agents whose words per sentence sit inside their declared band; sentences inside (full by construction) | 7 of 7; 1,529 of 1,529 | `docs/consoles/OMEGA-HIVE.md` | count |
| Lines whose every number, id and site name is in their event | 954 of 954 | `docs/consoles/OMEGA-HIVE.md` | count |
| Governor: jobs allowed for simulation before dispatch; run steps monitored; dispatches to a physical robot | 161 of 161; 3,631 of 3,631; 0 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Steward vetoes; vetoed jobs that moved past negotiation | 7; 0 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Approvals requested wherever the physical path is named; approved requests that ran only as a new simulated job; declined jobs that ran | 10 of 10; 7; 0 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| With the e-stop held at a site: runs there; requests refused as `estop-held` | 0; 40 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Audit lines for a 40 -job day, chain intact; in the built page, lines in the governance log of them the hive’s and the governor’s | 162; 121: 88, 33 | `docs/consoles/OMEGA-HIVE.md` | count |
| A seeded 200 -job day: jobs completed, hive and one dispatcher; mean steps from announcement to award; mean steps from arrival to completion | 159 / 159; 0.034 / 13.715; 4.398 / 18.478 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Contested awards resolved; duplicate awards; site conflicts resolved, hive and one dispatcher | 207; 0; 19 of 19 / 15 of 15 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Voice, stubbed speech engine with one on-device and one network voice: utterances, all on the on-device voice; network voice chosen. With voice off in the built page: captions; utterances | 22; 0. 43; 0 | `docs/consoles/OMEGA-HIVE.md` | simulated |
| Headless drive of the panel, 5 loads: page errors; requests to other hosts | 0; 0 | `docs/consoles/OMEGA-HIVE.md` | observed |
| What the panel adds to the world on the desktop or phone tier: meshes, lights, triangles, draw calls and texture bytes | 0 | `docs/consoles/OMEGA-HIVE.md` | observed |
| Checker checks, before (on the base tree, which has no hive) and after | 1 passed, 13 failed → 15 passed, 0 failed | `docs/consoles/OMEGA-HIVE.md` | count |
| **`AGENT-AVATARS`: the agents in the world** | | | |
| Agents embodied, before and after: hive agents through a fixture of the hive; agent-jobs personas in the built page | 0 → 3; 0 → 4 | `docs/consoles/AGENT-AVATARS.md` | count |
| Meshes and sprites in the heaviest figure, against the budget | 11 of 12 | `docs/consoles/AGENT-AVATARS.md` | count |
| Talk light on exactly while a line is spoken: sampled; in real frames of the built page. A caption bubble for every line: sampled; built page | 6 of 6; 5 of 5. 6 of 6; 5 of 5 | `docs/consoles/AGENT-AVATARS.md` | observed |
| Phone tier, draw calls and triangles before → after (it builds no figures) | 153 → 153; 56,490 → 56,490 | `docs/consoles/AGENT-AVATARS.md` | observed |
| Balanced tier with 4 figures: draw calls; triangles drawn | 192 → 228; 117,852 → 121,332 | `docs/consoles/AGENT-AVATARS.md` | observed |
| High tier with 4 figures: draw calls; triangles drawn | 190 → 226; 159,668 → 163,148 | `docs/consoles/AGENT-AVATARS.md` | observed |
| The layer’s own cost with 4 figures: meshes, sprites and triangles; texture bytes | 36 meshes, 8 sprites and 4,048 triangles; 262,144 | `docs/consoles/AGENT-AVATARS.md` | observed |
| Portrait atlas bytes, unchanged, against the budget | 155.9 KiB of 160 KiB | `docs/consoles/AGENT-AVATARS.md` | count |
| World evaluation (headless): subjects, mean score and findings, unchanged | 51 subjects, mean 100, 5 findings | `docs/consoles/AGENT-AVATARS.md` | count |
| **`ROBO-INTERIORS`: a walk-in room at every robot site** | | | |
| Robot sites with a walk-in robotics room, before and after; room styles | 0 of 6 → 6 of 6; 6 | `docs/consoles/ROBO-INTERIORS.md` | count |
| Per room as built: meshes (budget 120); triangles on high (budget 6,000) and low (budget 3,000); lights | 18 to 20; 1,016 to 2,340; 780 to 1,696; 2 and 1 | `docs/consoles/ROBO-INTERIORS.md` | count |
| Texture bytes per room: high (budget 24 MiB); balanced and low (budget 3 MiB) | 17.33 to 22.67 MiB; 2.33 to 2.67 MiB | `docs/consoles/ROBO-INTERIORS.md` | count |
| Station pads and agent spots reachable on foot from the door, high and low | 70 of 70 | `docs/consoles/ROBO-INTERIORS.md` | observed |
| Interiors checker, before and after; Louisiana-room and classroom checkers, unchanged | 733 → 925; 3,787; 2,057 | `docs/consoles/ROBO-INTERIORS.md` | count |
| Page errors in the walk-through, both tiers | 0 | `docs/consoles/ROBO-INTERIORS.md` | observed |
| **`ROBO-EXTERIORS`: the robotics buildings from outside** | | | |
| Robot sites with a dedicated exterior kit, before and after; kits; establishing-shot presets, before and after | 0 → 6 of 6; 5; 0 → 12 of 12 | `docs/consoles/ROBO-EXTERIORS.md` | count |
| Kit per site, meshes and triangles on the phone, balanced and high tiers (budget 1 mesh and 1,500 triangles; 2 meshes and 7,000 triangles; 2 meshes and 7,000 triangles) | 1 mesh and 36 to 180 triangles; 2 meshes and 450 to 804 triangles; 2 meshes and 880 to 1,296 triangles | `docs/consoles/ROBO-EXTERIORS.md` | count |
| Worst robot-site chunk, facades alone → facades plus kit: low; high | 2 / 1,056 → 3 / 1,092; 3 / 4,918 → 5 / 5,798 | `docs/consoles/ROBO-EXTERIORS.md` | count |
| Texture bytes per map: balanced (allocated, not driven); high (measured in the page), against budgets of 1,572,864 and 6,291,456 | 1,485,483; 5,941,931 | `docs/consoles/ROBO-EXTERIORS.md` | count |
| Draw calls added by the kit per site in view; triangles added per site | 2; 880 to 1,908 | `docs/consoles/ROBO-EXTERIORS.md` | observed |
| Detail-generation median (CPU), before → after, against a budget of 12 ms; the load was 8.5 to 8.7 then 5.3 to 6.9 (judged only on a quiet machine) | 11.2 ms → 10.8 ms | `docs/consoles/ROBO-EXTERIORS.md` | observed |
| Exterior checker; facades, palette, walkable and detail checkers, unchanged | 259; 2,860; 684; 2,720; 479 | `docs/consoles/ROBO-EXTERIORS.md` | count |
| Drive in the built page: shots, failed, page errors; maps lit at night | 12, 0, 0; 5 of 5 | `docs/consoles/ROBO-EXTERIORS.md` | observed |
| **`ROBOTRAIN-6`: preference pairs, corrections and the hardest gap** | | | |
| Roadmap Open items on preference learning, before and after; models trained on preference pairs, before and after | 1 → 0; 0 → 1 | `docs/consoles/ROBOTRAIN-6.md` | count |
| Reward model, held-out pair accuracy on 50 pairs (chance 0.5): fleet routing, with the synthetic rater’s own ceiling; its hard variant, with its ceiling. Pairs: 200 synthetic per task, 0 from any person | 0.61 (0.584); 0.60 (0.651) | `docs/evals/colearn.json` | simulated |
| Fleet routing, clone success on 60 held-out seeds: reward-filtered (top 50%, 20 demonstrations) / rule-filtered / unfiltered; reward-weighted votes. The reward filter did not beat the rule filter | 0.483 / 0.817 / 0.600; 0.600 | `docs/evals/colearn.json` | simulated |
| Its hard variant, the same arms and the weighted votes | 0.050 / 0.050 / 0.117; 0.067 | `docs/evals/colearn.json` | simulated |
| Hard fleet routing, 5 rounds of corrections labelled by the scripted expert (rollouts a round: 20), clone success by round, default features | 0.05 → 0.117 → 0 → 0.05 → 0.183 → 0.05 | `docs/evals/colearn.json` | simulated |
| The gap to the expert after the last round, default features; the best any policy over those features could agree with the expert’s labels (across 20,525 visited states, 94% on feature vectors with more than one label) | 0.950; 0.696 | `docs/evals/colearn.json` | simulated |
| The same rounds with 4 opt-in route features, by round; the gap after the last; the ceiling | 0.15 → 0.233 → 0.35 → 0.133 → 0.4 → 0.417; 0.583; 0.745 | `docs/evals/colearn.json` | simulated |
| Hard variants with a software-agent baseline, before and after; random; scripted expert (seeds 3 each) | 0 → 3; 0 of 3; 3 of 3 | `docs/perf/agent-baselines-robotics.json` | simulated |
| Nodes of the lineage figure on the policy report: learner consents; synthetic datasets, clones and simulated sites; measured evals | 0; 6; 12 | `docs/consoles/ROBOTRAIN-6.md` | count |
| Evaluation tool, same output: seconds before → after; DAgger rounds: before → after | 23.4 s → 15.2 s; 74 s to 3.2 s | `docs/consoles/ROBOTRAIN-6.md` | observed |
| Colearn checker checks; roboscenarios checker checks, before and after | 46 → 55; 12 → 13 | `docs/consoles/ROBOTRAIN-6.md` | count |
| **`HIVE-IN-WORLD`: the hive in person (its committed console note)** | | | |
| Real hive in the avatar checker (seed 1, 152 steps: 350 spoken lines, 30 moves, 22 refusals, 56 completions): talk light exact; a caption for each line; moves ending at the named site | 350 of 350; 350 of 350; 30 of 30 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs`) | simulated |
| Calm stop gesture on each refusal; nod on each completion; hive agents embodied, before and after | 22 of 22; 56 of 56; 0 → 7 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs`) | simulated |
| Agents standing at their room spots, rooms by agents; room-tiers inside the room budget with the agents and captions in | 7 of 7; 18 of 18 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_hive_world.mjs`) | simulated |
| One door: rooms that open at their exterior building’s door; door spots clear of every exterior collider; stations that return into the same room | 6 of 6; 6 of 6; 6 of 6 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_hive_world.mjs`) | simulated |
| “Supervise every job” on a seeded 200 -job day: dispatches without the learner’s approval, setting off → on; every dispatch follows an approve line; refusals and vetoes, the same either way | 150 of 155 → 0 of 116; 116 of 116; 31 and 9 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_hive_world.mjs`) | simulated |
| Agents’ walks: walk points inside a building’s collider, before → after routing round buildings; walks that took a route round one; standing slots inside a building, before → after | 1,082 of 11,000 → 0 of 11,424; 8; 1 of 42 → 0 of 42 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_hive_world.mjs`) | simulated |
| Avatar checker checks; hive-world checker checks | 70; 35 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs`), `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_hive_world.mjs`) | count |
| **`VOICES`: every character speaks, in its own voice (its committed console note)** | | | |
| Characters with a voice profile, before and after; inside the band (rate 0.85 to 1.05, pitch 0.85 to 1.15); distinct pairs; closest pair as a share of the band | 0 → 34; 34 of 34; 34 of 34; 0.100 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | count |
| Stubbed speech engine with an on-device and a network voice: lines spoken verbatim from the pack; network voices chosen (of 136 utterances); overlapping lines | 136 of 136; 0; 0 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | simulated |
| Utterances with voice off; dialogues identical with voice on and off | 0; 102 of 102 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | simulated |
| Languages the hive speaks, before and after; a seeded Spanish day: agents inside their band; sentences inside; lines grounded; strings flagged by the calm-text scan; speaker accuracy on 2,269 held-out lines | 1 → 2; 7 of 7; 1,536 of 1,536; 954 of 954; 0; 0.959 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | simulated |
| Talk light exact while a line is spoken; meshes in the heaviest speaking figure against the budget; voice checker checks | 34 of 34; 9 of 12; 10 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | simulated |
| **`ENV-HD-2`: high detail beyond the robot sites** | | | |
| Sheds and towers within 150 m of a robot site with a robotics variant, before and after; beyond the radius; the phone tier builds what it built before | 0 → 68 of 68; 0 | `docs/consoles/ENV-HD-2.md` | count |
| Worst robot-site chunk on the high tier, facades plus kit: before; after (budget 6 meshes, 24,000 triangles) | 3 + 2 meshes, 4,918 + 880 triangles; 4 + 2 meshes, 4,158 + 880 triangles | `docs/consoles/ENV-HD-2.md` | count |
| Scattered props inside a robotics building lot, before and after, on every tier | 834 → 0 | `docs/consoles/ENV-HD-2.md` | count |
| Detail-generation median (CPU, high), paired runs back to back, before (load 6.6 → 7.1) and after (load 6.4 → 5.5), against a budget of 12 ms; judged only on a quiet machine | 10.6 ms → 9.9 ms | `docs/consoles/ENV-HD-2.md` | observed |
| Room styles with the high-detail texture set, before and after; site doors that open into the new ones | 6 → 15; 807 of 863 | `docs/consoles/ENV-HD-2.md` | count |
| Meshes, triangles and lights identical with and without the skin, across every added style on every tier | 27 of 27 | `docs/consoles/ENV-HD-2.md` | count |
| Texture bytes per room: before (the shell’s signs); high; balanced and low | 1.33 MiB → 17.33 MiB; 2.33 MiB | `docs/consoles/ENV-HD-2.md` | count |
| Stills at 1920 by 1080 pixels from the built page; page errors | 13; 0 | `docs/consoles/ENV-HD-2.md` | observed |
| Facades checker; detail checker; room-skin checker; exteriors checker unchanged | 2,860 → 2,957; 479 → 485; 164; 259 | `docs/consoles/ENV-HD-2.md` | count |
| **`ENV-HD-3`: high detail everywhere a learner walks (its committed note)** | | | |
| Room styles with the high-detail texture set, before and after; meshes, triangles and lights on every tier with it on | 15 → 25; unchanged | `docs/consoles/ENV-HD-3.md` | count |
| Room-skin checker passes, before and after; Louisiana rooms over the balanced texture budget before the skin | 164 → 382; 6 | `docs/consoles/ENV-HD-3.md` | count |
| Texture bytes per room, the worst room in budget (shell signs and Louisiana name signs counted): high; balanced; low | 17.33 MiB; 2.33 MiB; 2.86 MiB | `docs/consoles/ENV-HD-3.md` | count |
| Louisiana rooms on the balanced tier before any skin: texture MiB over the room budget of 3 MiB (name-sign canvases, 6 to 15 a room); bytes the skin adds there: none | 3.21 to 6.02 | `docs/consoles/ENV-HD-3.md` | count |
| Chunks drawn one mesh per kind where the generic and robotics kits meet; robotics towers with an entrance canopy; the worst robotics-variant chunk on the high tier | 0 → 14; 0 → 28 of 28; 4 meshes / 5,204 triangles → 3 meshes / 5,066 triangles | `docs/consoles/ENV-HD-3.md` | count |
| Worst robot-site chunk on the high tier, meshes before and after (generic + robotics meshes in the San José chunk); entrance canopies on the robotics towers | 6 → 5 (4 + 2 → 2 + 2) | `docs/consoles/ENV-HD-3.md` | count |
| Facades checker passes; exteriors checker passes; shared-export check | 2,957 → 2,977; 259 → 278; 139 of 139 | `docs/consoles/ENV-HD-3.md` | count |
| Establishing-shot presets, before and after; non-robot sites framed (stations at each: the bridge yard, the port terminal, the construction site); shots each; exteriors checker passes | 12 → 18; 3 (7, 6, 6); 2; 259 → 278 | `docs/consoles/ENV-HD-3.md` | count |
| Stills at 1920 by 1080 from the capture drive (each preset by day and by night); page errors; external requests | 12; 0; 0 | `docs/consoles/ENV-HD-3.md` | observed |
| Vehicles parked inside a robotics building lot, before and after; motorworks checker passes | 2 → 0; 37 → 69 | `docs/consoles/ENV-HD-3.md` | count |
| Animals and people inside a lot; chased agents that stepped in; menagerie checker passes | 0; 0 of 6; 93,998 → 94,048 | `docs/consoles/ENV-HD-3.md` | simulated |
| **`HIVE-3`: the hive’s day (its committed note)** | | | |
| Agents the hive sent to a robot site, shown inside that site’s room, before and after; room-steps inside the room and texture budgets; most figures in one room | 0 of 108 → 108 of 108; 5,760 of 5,760; 3 | `docs/consoles/HIVE-3.md` | simulated |
| Hive settings remembered for a signed-in adult profile (3): after a reload; demo, K-12 and signed-out sessions | back after a reload under the profile's own key only; demo, K-12 and signed-out sessions store nothing | `docs/consoles/HIVE-3.md` | observed |
| The hive panel in Spanish: English UI strings left in it | no English UI string | `docs/consoles/HIVE-3.md` | observed |
| Talk light in the rooms with a stubbed speech engine (one on-device and one network voice): on for each line; off after; network voices chosen | 15 of 15; 14 of 14; 0 of 94 | `docs/consoles/HIVE-3.md` | simulated |
| “A day in the hive”: seconds; page errors; requests to another host | 27; 0; 0 | `docs/consoles/HIVE-3.md` | observed |
| **`ROBOTRAIN-7`: the robot-learning roadmap, next (its committed note)** | | | |
| Declared before any held-out seed was run (written at 13:17 UTC): the step window, in steps; the drop threshold; the number of correction rounds (of 20 rollouts each) | 3; 0.25; 5 | `docs/consoles/ROBOTRAIN-7.md` | count |
| Per-step reward, clone success on 60 held-out seeds: fleet routing at the declared threshold; the rule filter; unfiltered; the whole-run reward | 0.550; 0.817; 0.600; 0.483 | `docs/evals/colearn.json` | simulated |
| Per-step reward, the hard variant: at the declared threshold; the rule filter; unfiltered; the whole-run reward | 0.017; 0.050; 0.117; 0.050 | `docs/evals/colearn.json` | simulated |
| Steps dropped of all demonstration steps: fleet routing; the hard variant (rule-breaking steps dropped: 2 of 4; 2 of 9) | 3 of 560; 18 of 839 | `docs/evals/colearn.json` | count |
| Window model, accuracy on the held-out window pairs with the synthetic rater’s own ceiling beside it: fleet routing; the hard variant | 0.66 (0.65); 0.72 (0.671) | `docs/evals/colearn.json` | simulated |
| Threshold sweep, reported beside the declared threshold and not chosen from (success at 0.1 and at 0.5): fleet routing; the hard variant | 0.600, 0.917; 0.117, 0.083 | `docs/evals/colearn.json` | simulated |
| Aliasing ceiling on the same training states: route features; features that read the other robots (ambiguous vectors 32 → 6) | 0.745 → 0.959 | `docs/evals/colearn.json` | count |
| Hard fleet-routing variant, clone success after 5 declared rounds of 20 rollouts, round by round (the final round is the result, not the best) | 0.85 → 0.917 → 0.917 → 0.9 → 0.917 → 0.983 | `docs/evals/colearn.json` | simulated |
| The gap to the expert: with the default features; with route features; with the other robots in view | 0.95; 0.583; 0.017 | `docs/evals/colearn.json` | simulated |
| Ablation declared at 13:36 UTC, after the result above was seen: holder and order features without the detour move; aliasing ceiling on the same states; clone success after the same rounds; the gap; round by round | 0.796; 0.517; 0.483; 0.217 → 0.783 → 0.467 → 0.6 → 0.25 → 0.517 | `docs/evals/colearn.json` | simulated |
| Robot runs a learner can rate on the pad, collected only for an opted-in adult (never K-12, demo or signed-out; a revoke empties them); built-page drive: page errors; external requests | 2; 0; 0 | `docs/consoles/ROBOTRAIN-7.md` | observed |
| Ratings an opted-in adult makes → pairs they become; ratings collected before opt-in, for K-12, for demo, signed out, and after a revoke | 2 → 1; 0 | `docs/consoles/ROBOTRAIN-7.md` | observed |
| Colearn checker checks, before and after; roboscenarios checker checks | 55 → 61; 13 | `docs/consoles/ROBOTRAIN-7.md` | count |
| Reactive agent that reads only the safety fields, passed of 3 seeds: drilling; port; fleet routing (random 0 of 3 and the expert 3 of 3 on each); hard variants with a third baseline | 3 of 3; 3 of 3; 1 of 3; 0 → 3 | `docs/perf/agent-baselines-robotics.json` | simulated |
| **`HIVE-4`: the hive’s voices, memory and console (its committed note)** | | | |
| Agent-to-agent exchanges in a seeded 200 -job day, before and after (handoffs 173, questions 45, reports 40); 5 further seeds at 120 jobs | 0 → 258; 174, 163, 162, 156, 158 | `docs/consoles/HIVE-4.md` | simulated |
| Exchange lines grounded; sentences inside the speaker’s band; replies directly after their opener; lines overlapping on the floor (of 1,294) | 516 of 516; 776 of 776; 258 of 258; 0 | `docs/consoles/HIVE-4.md` | count |
| Exchange lines spoken with a stubbed speech engine (one on-device and one network voice): in order, on the on-device voice only, one line at a time | 56 of 56 | `docs/consoles/HIVE-4.md` | simulated |
| Memory references per seeded day, before and after; grounded in the chain; planted errors caught | 0 → 36; 36 of 36; 3 of 3 | `docs/consoles/HIVE-4.md` | simulated |
| Spanish (the panel’s Spanish hive, same seed): exchanges and memory references per day, before and after; lines grounded (exchange; memory); sentences in the speaker’s band; English fragments but names | 0 → 258; 0 → 36; 516 of 516; 36 of 36; 869 of 869; 0 | `docs/consoles/HIVE-4.md` | simulated |
| The steward’s question cooldown (at most one question every 6 hive minutes) with more variants: questions a day before and after; the steward’s distinct-2 before the cooldown, with it, and the default hive | 103 → 45; 0.097 → 0.159 (default 0.145) | `docs/consoles/HIVE-4.md` | simulated |
| Governor with the talk on: jobs checked; run steps monitored; physical dispatches | 161 of 161; 3,631 of 3,631; 0 | `docs/consoles/HIVE-4.md` | simulated |
| Declared at 14:14 UTC before the held-out run: trait recovery from 8 text features, ridge regression fitted on seeds 1 to 50, scored by Spearman rank correlation on held-out seeds 51 to 100 | 51 –100 | `docs/consoles/HIVE-4.md` | count |
| Trait recovery, now (after the steward’s question cooldown): warmth; formality; verbosity; caution | 0.959; 0.832; 0.977; 0.799 | `docs/consoles/HIVE-4.md` | simulated |
| Trait recovery, the first run right after the declaration: warmth; formality; verbosity; caution | 0.963; 0.812; 0.979; 0.804 | `docs/consoles/HIVE-4.md` | simulated |
| Trait recovery after a fix that changed the padding only: warmth; formality; verbosity; caution | 0.958; 0.795; 0.980; 0.798 | `docs/consoles/HIVE-4.md` | simulated |
| The 7 real agents, as a secondary check: warmth; formality; verbosity; caution | 0.964; 0.929; 1; 0.643 | `docs/consoles/HIVE-4.md` | simulated |
| Distinct-2 per agent (fact-masked), the default hive → the panel’s configuration: Orrin; Selka; Brann; Ivo; Tamsa; Quen; Lio; agents above their default figure with the talk on; agents that rise with wording variety alone on the same events | 0.057 → 0.075; 0.145 → 0.159; 0.078 → 0.161; 0.237 → 0.320; 0.060 → 0.110; 0.116 → 0.155; 0.050 → 0.115; 7 of 7; 7 of 7 | `docs/consoles/HIVE-4.md` | simulated |
| The console’s Omega Hive tab in a headless drive: cards; lines (exchange turns; memory); refusals listed; eval rows from the committed JSON; buttons; page errors; stills at 1920×1080 taken and looked at | 7; 65 (32; 3); 20; 12; 0; 0; 4 | `docs/consoles/HIVE-4.md` | observed |
| Checker checks (`check_hive4`); neighbours: omega-hive; voices; hive-world; modules importing only what they declare; shipped modules that parse; interface | 11; 15; 10; 35; 1,119; 2,698; 21 | `docs/consoles/HIVE-4.md` | count |
| **`AVATARS-HD`: the agents in high resolution (its committed note)** | | | |
| Triangles per figure on the high tier, before → after (mean; worst; the console’s budget); meshes and sprites (3 + 2, of 12); draw calls silent / speaking, before → after | 1,012 → 2,693; 2,774; 3,000; 9 / 11 → 3 / 5 | `docs/consoles/AVATARS-HD.md` | count |
| The built page at `sf-downtown` with 6 figures in view: draw calls without → with the agents (balanced; high); triangles (balanced; high); the phone tier | 195 → 249; 194 → 212; 116,754 → 121,974; 163,576 → 179,864; 154 / 56,062 unchanged | `docs/consoles/AVATARS-HD.md` | observed |
| Distinct silhouettes among the 21 pairs (front-view overlap at most 0.9); most alike pair; median overlap | 18 of 21 → 21 of 21; 1.000 → 0.844; 0.828 → 0.677 | `docs/consoles/AVATARS-HD.md` | count |
| Personality in the body, Spearman ρ over the 7 agents: caution with an upright posture; warmth with an open stance; verbosity with hand motion while speaking; formality with a tidy silhouette | 0.89; 1.00; 1.00; 0.93 | `docs/consoles/AVATARS-HD.md` | simulated |
| Mouth timing: with a stubbed voice, ms from a word boundary and boundaries inside 25 ms; with the voice off, ms from a caption word onset and onsets in time; gaps in which the mouth closes | 15.3; 20 of 20; 20.0; 20 of 20; 19 of 19 | `docs/consoles/AVATARS-HD.md` | simulated |
| Gestures in a real hive run of 120 steps (a seeded stand-in learner who approves): bids; awards; refusals; approvals; completions; each gesture’s pose measured on the bones | 200 of 200; 67 of 67; 20 of 20; 47 of 47; 45 of 45; 5 of 5 | `docs/consoles/AVATARS-HD.md` | simulated |
| A refusal’s stop hand held for its full 1.8 s, every frame sampled in the same run, before → after the console’s fix | 15 of 20 → 20 of 20 | `docs/consoles/AVATARS-HD.md` | simulated |
| Portraits drawn from the figure, at 96 px and 144 px, distinct; roster cards drawn from it in the built console; head and hands against the game’s 12 skin tones, the closest (the floor was 0.15) | 22 of 22; 11 of 11; 11 of 11; 0.177 | `docs/consoles/AVATARS-HD.md` | observed |
| Word boundaries the real voice controller forwards to the figure; page errors and off-host requests in the console’s drive of the built pages | 0; 0; 0 | `docs/consoles/AVATARS-HD.md` | observed |
| Checker checks (`check_agent_avatars`), before → after; neighbours: `check_hive_world`; `check_hive3`; modules importing only what they declare; shipped modules that parse | 70 → 92; 35; 32; 1,119; 2,698 | `docs/consoles/AVATARS-HD.md` | count |
| **`ENV-HD-4`: scenes inside and out, and an opt-in Ultra setting (its committed note)** | | | |
| Ultra: facade atlas px, robot-room floor and wall px (high tier → Ultra); facade texture MiB a map at Ultra against its limit | 1,024 → 2,048; 1,024 → 2,048; 22.67 of 24 | `docs/consoles/ENV-HD-4.md` | count |
| Ultra at the 6 robot sites: triangles added (against a limit of 6,000); at the robot rooms: triangles added (limit 2,500), texture MiB a room (limit 64) | 1,344 –2,892; 912 –1,944; 49.33 –54.67 | `docs/consoles/ENV-HD-4.md` | count |
| Looks; exterior presets before → after; site lights on the West Oakland map: triangles (limit 1,200 a site), real lights, texture bytes | 6; 0 → 36; 880; 0; 0 | `docs/consoles/ENV-HD-4.md` | count |
| Robot rooms with lighting before → after; lights a room on the high tier (before → after; limit 3); phone, balanced and headset builds of the rooms (18 of 18 unchanged) | 0 → 6 of 6; 2 → 3; identical | `docs/consoles/ENV-HD-4.md` | count |
| Frame time on the console’s capture machine (a shared software renderer: not a graphics-card budget), median ms, high → Ultra: the West Oakland warehouse at night (240 draw calls in both); the cell hall (25 → 27 draw calls) | 1,490 → 1,424; 864 → 894 | `docs/consoles/ENV-HD-4.md` | observed |
| The hive operations room on the high tier: meshes; triangles; lights; texture MiB; consoles and agent spots | 25; 2,022; 3; 18.67; 7 | `docs/consoles/ENV-HD-4.md` | count |
| Stills at 1920 × 1080, every frame looked at (36 of 36 exterior presets, 7 lit rooms, 8 with Ultra); page errors and external requests in the console’s capture drives | 51; 0; 0 | `docs/consoles/ENV-HD-4.md` | observed |
| Checker checks (`check_hd4`); neighbours: interiors; room skins; robot interiors; exteriors; Louisiana rooms; modules importing only what they declare; the interface check | 118; 925 → 957; 382 → 401; 302; 278; 3,787; 1,122; 21 | `docs/consoles/ENV-HD-4.md` | count |
| **`AVATARS-HD-2`: the bodies follow the voices (its committed note)** | | | |
| Word boundaries the real voice controller forwards to the figure, before → after; forwarded boundaries with the mouth open within 25 ms and shut before the next (a stub whose word times follow the word’s length) | 0 → 20; 20 of 20 | `docs/consoles/AVATARS-HD-2.md` | simulated |
| Spoken lines of the real hive (seed 1, 60 seconds) with the talk light off before the voice starts and on from its start to its end, and with a mount that does not wait; lines with a caption; words over which the mouth opens and closes | 11 of 11; 0 of 11; 11 of 11; 159 of 159 | `docs/consoles/AVATARS-HD-2.md` | simulated |
| The room-level figure: triangles against its stated budget; the full figure (unchanged); agent-avatar checker checks | 898 –962 of 1,000; 2,618 –2,770; 92 → 99 | `docs/consoles/AVATARS-HD-2.md` | count |
| Robotics rooms built on high as the page builds them, with room-level figures standing in them (3 a room): rooms inside the triangle and texture budgets; the busiest room’s triangles, with today’s figure beside it; meshes a room, with today’s figure beside it | 6 of 6; 5,562 (5,804); 31 –33 (49 –51) | `docs/consoles/AVATARS-HD-2.md` | count |
| The worst figure in a room: triangles against the stated budget, with today’s figure beside it; meshes, with today’s; rooms the outdoor figure would put over their budget (its triangles a room) | 962 of 1,000 (1,008); 3 (9); 6 of 6 (9,438 –10,858) | `docs/consoles/AVATARS-HD-2.md` | count |
| Stop hand seen from the front: distance from the bid’s raised hand in body heights, the earlier pose → the new one; how square the palm is to the front; the raised hand’s height in metres; stop gestures held their full 1.8 s | 0.38 → 0.68; 1.00; 1.96; 20 of 20 | `docs/consoles/AVATARS-HD-2.md` | simulated |
| Built-page drive with a stubbed speech engine (outside the gate): network voice chosen; word boundaries reaching the figures; spoken lines with the light off before the voice, on from its start and off after its end; the room built with an agent speaking in it (meshes; triangles); page errors; off-host requests | 0; 48 of 48; 3 of 3; 30; 3,964; 0; 0 | `docs/consoles/AVATARS-HD-2.md` | observed |
| **`ENV-HD-5`: budgets kept, more scenes (its committed note)** | | | |
| Louisiana rooms on the balanced tier: texture MiB a room, before → after (budget 3); rooms inside the budget, measured; name-sign canvas px on balanced, before → after | 3.21 –6.02 → 2.47 –2.86; 6 of 6; 512 × 120 → 256 × 60 | `docs/consoles/ENV-HD-5.md` | count |
| Balanced tier: a light-weight form of the robot rooms’ lighting (emissive panels in one instanced mesh, no real light, no texture): meshes and triangles added a room (limit 400); builds of the rooms unchanged on the phone tier and in a headset browser; `check_hd4` checks before → after | +1; +132 –228; 18 of 18; 118 → 127 | `docs/consoles/ENV-HD-5.md` | count |
| Establishing-shot presets before → after (a wide and a street shot at the busiest park, fire station, hospital and school); exteriors checker checks before → after | 18 → 26; 278 → 309 | `docs/consoles/ENV-HD-5.md` | count |
| Stills re-shot after the dawn-sky and sign-fit fixes (San José and West Oakland dawn and fog-at-dawn, the lit rooms), every frame looked at: captures; failed; page errors; external requests | 13; 0; 0; 0 | `docs/consoles/ENV-HD-5.md` | observed |
| Street cameras at least 12 m from the site’s own building, before → after; the hospital campus’s camera, in metres; new stills taken and looked at; rejected by eye and re-shot; captures in all the drives (none failed; page errors and external requests zero) | 6 of 7 → 7 of 7; 8.3 → 19.7; 25; 2; 38 | `docs/consoles/ENV-HD-5.md` | observed |
| Room-skin checker checks, before → after; builds of the Louisiana rooms whose measured textures equal the checker’s model; checks that failed when only the sign size was changed (the model still assumed the old one) | 401 → 480; 18 of 18; 24 | `docs/consoles/ENV-HD-5.md` | count |
| **`HIVE-5`: the hive in its own room, live (its committed note)** | | | |
| Operations-room screens painted from the hive’s own data (a console for each agent and the wall), before → after; words on the agents’ cards and on the wall at hive minute 150; refusals the wall lists; texture bytes the screens add | 0 → 8 of 8; 93; 22; 4; 0 | `docs/consoles/HIVE-5.md` | simulated |
| Agents standing at their consoles on entering the room, before → after; walks out and back in a seeded day (seed 1, 480 steps); steps inside the room’s budgets; agent-steps at the console exactly while holding no job | 0 → 7 of 7; 107, 107; 480 of 480; 3,360 of 3,360 | `docs/consoles/HIVE-5.md` | simulated |
| The room with 7 figures on high: meshes; triangles; texture MiB (limits 120; 6,000; 24); on balanced: meshes; triangles; texture MiB (limit 3); triangles 7 standard figures would have made; a figure, standard → lightened | 88; 4,878; 21.58; 84; 4,190; 2.77; 9,078; 1,008 → 408 | `docs/consoles/HIVE-5.md` | count |
| Console tab on the learner’s own hive, local and with no network: lines in a snapshot after 40 steps, headless; in the page at hive minute 261: lines; refusals; storage keys (before, the tab could only replay a seeded day) | 140; 52; 36; 0 | `docs/consoles/HIVE-5.md` | observed |
| Home moves after the last job, outdoors too, before → after; lines grounded; outdoor figures where the hive says; idle agents home at the day’s end | 0 → 89 of 89; 89 of 89; 7 of 7; 7 of 7 | `docs/consoles/HIVE-5.md` | simulated |
| Governor with the home move on: dispatched jobs checked; steps monitored; physical dispatches; jobs completed with and without it | 150 of 150; 3,061 of 3,061; 0; 144 | `docs/consoles/HIVE-5.md` | simulated |
| Built page at hive minute 159 (high, a software renderer): agents standing; screens painted; meshes built; triangles built (equal to the checker’s); triangles drawn; texture MiB; page errors; off-host requests; the toggle on a 390 × 844 touch phone in pixels | 7 of 7; 8 of 8; 88; 4,878; 4,292; 19.25; 0; 0; 284 by 44 | `docs/consoles/HIVE-5.md` | observed |
| The operations room on the merged head, triangles built against the room’s limit of 6,000: with the high-detail line’s room-level figures in it (measured by the video review’s capture, cut 12; 46 meshes) → after the integration fix, measured in the built page with `HIVE-5` ’s drive; page errors; checkers on the merged tree passing | 8,508 → 4,470; 0; 43 of 43 | `docs/consoles/COORDINATOR.md` | observed |
| **`ROBOTRAIN-8`: the declared retests, measured once on fresh seeds (design committed at 16:08 UTC and amended from training-side evidence at 16:15 UTC, before any run on the fresh seeds; its committed note and data file)** | | | |
| Fresh held-out seeds, never tuned on: first to last (how many); the earlier range, already seen by earlier rounds | 7061 –7120 (60); 7001 –7060 | `docs/consoles/ROBOTRAIN-8.md` | count |
| Per-step reward on fleet routing, clone success on the fresh seeds: the declared rule (oversampled pairs at the declared threshold); the same pairs at the sweep’s hinted threshold; the older pairs at the hinted threshold; the rule filter; no filter | 0.517; 0.467; 0.883; 0.650; 0.533 | `docs/evals/colearn.json` | simulated |
| The same on the hard variant of fleet routing | 0.050; 0.067; 0.117; 0.083; 0.033 | `docs/evals/colearn.json` | simulated |
| Pairs with a broken rule in a window, of 200: the older pairs → the oversampled ones (fleet routing; its hard variant); the penalty the reward model puts on a broken rule (the size of a negative weight), before → after (fleet routing) | 11 → 104; 17 → 105; 0.81 → 2.66 | `docs/evals/colearn.json` | simulated |
| Held-out pair accuracy of the reward model, with the synthetic rater’s own ceiling beside it, older pairs → oversampled pairs (fleet routing; its hard variant) | 0.660 (0.650) → 0.780 (0.828); 0.720 (0.671) → 0.900 (0.856) | `docs/evals/colearn.json` | simulated |
| Steps dropped by the declared rule, of all demonstration steps, and rule-breaking steps among them dropped (fleet routing; its hard variant) | 14 of 560, 4 of 4; 24 of 839, 6 of 9 | `docs/evals/colearn.json` | count |
| Aliasing ceiling on the same labelled training states (no held-out seed scored): route features; holder features; robot-order and detour features; local features only; route plus local view | 0.745; 0.796; 0.959; 0.910; 0.911 | `docs/evals/colearn.json` | count |
| Hard fleet-routing variant, clone success after 5 declared rounds of 20 rollouts, round by round (the final round is the result): local features only | 0.217, 0.450, 0.200, 0.383, 0.367, 0.317 | `docs/evals/colearn.json` | simulated |
| The same rounds on the same fresh seeds: route plus local view; holder features, run again; detour feature, run again | 0.233, 0.817, 0.783, 0.717, 0.767, 0.750; 0.200, 0.633, 0.400, 0.600, 0.217, 0.317; 0.783, 0.850, 0.850, 0.850, 0.850, 0.933 | `docs/evals/colearn.json` | simulated |
| The gap to the expert (which passes every one of the fresh seeds, 1.00) after the final round: local features only; route plus local view; holder features, run again; detour feature, run again | 0.683; 0.250; 0.683; 0.067 | `docs/evals/colearn.json` | simulated |
| Port-lane hard variant, clone success after 5 declared rounds of 20 rollouts, round by round; the gap after the final round; clean runs in the one round where a rule was broken | 0.783, 0.517, 0.867, 0.750, 0.967, 0.717; 0.283; 0.850 | `docs/evals/colearn.json` | simulated |
| Reactive agent on the hard fleet-routing variant, passed of its training seeds (101 –130), first rule → amended rule; of the supplement’s seeds, earlier agent → new agent (mean steps 15.3 for the new one); of the fresh seeds, earlier agent → new agent; rules broken in any of them | 16/30 → 29/30; 1 of 3 → 3 of 3; 26 of 60 → 55 of 60; 0 | `docs/perf/agent-baselines-robotics.json` and `docs/evals/colearn.json` | simulated |
| Colearn checker checks, before → after (it re-runs the new retests and compares the file byte for byte); roboscenarios checker checks; lines the results added to the data file, and lines they deleted (every earlier row is byte-identical) | 61 → 69; 13; 747; 0 | `docs/consoles/ROBOTRAIN-8.md` | count |
| A timing run on the earlier range, disclosed before the design was written (not a result, and the round count was not chosen from it): port-lane hard variant before → after one correction round; the holders features after one round | 0.717 → 0.583; 0.783 | `docs/consoles/ROBOTRAIN-8.md` | simulated |
| **`AVATARS-HD-3`: the operations room at full detail (its committed note)** | | | |
| Crowd-level figure: triangles a figure against its stated budget of 540; meshes a figure | 496 –524; 3 | `docs/consoles/AVATARS-HD-3.md` | count |
| Operations room on high with all 7 agents standing in it: meshes; triangles, against the room-level figure’s 8,508; steps of a seeded day inside the room’s budgets | 46; 5,586; 480 of 480 | `docs/consoles/AVATARS-HD-3.md` | simulated |
| Walks over a seeded day that clear every console and collider; walks crossing a console in the go-round test case, before → after | 214; 7 → 0 | `docs/consoles/AVATARS-HD-3.md` | simulated |
| Word boundaries stamped with their own time; mouth checked at 1 and 2 frames a second | 20 of 20 | `docs/consoles/AVATARS-HD-3.md` | simulated |
| **`HIVE-6`: moods from the day, a morning briefing, words on the balanced screens (its committed note)** | | | |
| Mood changes in a seeded day of 480 minutes (the panel’s hive, 5 seeds), before → after; changes traced to the hive’s own events | 0 → 168, 178, 198, 163, 155; 862 of 862 | `docs/consoles/HIVE-6.md` | simulated |
| Lines that carry the speaker’s mood; mood phrases in register, language and band (share of lines); safety lines with a mood phrase | 7,137 of 7,137; 1,163 of 1,163 (16.3%); 0 of 1,076 | `docs/consoles/HIVE-6.md` | simulated |
| Mood voice inside the gentle band (rate 0.85 –1.15, pitch 0.85 –1.2): lines of seed 1; rate seen; pitch seen; safety lines never faster or higher | 1,434 of 1,434; 0.87 –1.15; 0.92 –1.2; 220 of 220 | `docs/consoles/HIVE-6.md` | simulated |
| Briefing lines grounded, before → after; first jobs equal to the day’s first awards; overlapping lines | 0 → 35 of 35; 15 of 15; 0 | `docs/consoles/HIVE-6.md` | simulated |
| Balanced operations-room screens with words, before → after; the balanced room: meshes; triangles; texture MiB (limit 3) | 0 of 8 → 8 of 8; 85; 4,394; 2.77 | `docs/consoles/HIVE-6.md` | count |
| The hive’s output with the options off, byte-identical; governor with them on: jobs checked; steps monitored; physical dispatches | 3 of 3; 154 of 154; 3,196 of 3,196; 0 | `docs/consoles/HIVE-6.md` | simulated |
| Built page, entering the operations room at hive minute zero: briefing turns; agents standing; screens painted; meshes and triangles built; mood changes after 90 minutes; the tab’s moods panel rows and buttons; checker checks | 7; 7 of 7; 8 of 8; 88, 4,878; 35; 7, 0; 7 | `docs/consoles/HIVE-6.md` | observed |
| **`ENV-HD-6`: buildings that read as their kind (its committed note)** | | | |
| Kinds of place with a cue of their kind, before → after; cue triangles at each site, balanced / high (park; fire station; hospital; school), against a stated 1,200 / 3,600 | 0 → 4 of 4; 276 / 420; 192 / 384; 156 / 180; 480 / 1,968 | `docs/consoles/ENV-HD-6.md` | count |
| Cue and lamp meshes a map on balanced and high; triangles on the Orleans map, balanced / high; cue parts in a bad place (carriageway, water, another building, within 1.5 m of the board) | 1; 2,028 / 2,244; 0 | `docs/consoles/ENV-HD-6.md` | count |
| Night lamp bars floating, before → after (90 of 90 boards now with a post, arm and housing) | 90 → 0 | `docs/consoles/ENV-HD-6.md` | count |
| Street cameras clear of every tree, before → after; the park’s nearest crown edge, metres, before → after | 6 of 7 → 7 of 7; 0.2 → 11.0 | `docs/consoles/ENV-HD-6.md` | count |
| Ultra hero buildings, before → after; atlas px; texture MiB a map against 24; triangles a building | 0 of 4 → 4 of 4; 2048; 21.33; 8 | `docs/consoles/ENV-HD-6.md` | count |
| Checks: exteriors, before → after; the new buildings checker; facades and room-lighting, unchanged; page errors and external requests in the drives | 309 → 316; 118; 2,977, 127; 0, 0 | `docs/consoles/ENV-HD-6.md` | observed |
| **`ROBOTS-HD`: the robots themselves in high detail (its committed note)** | | | |
| High-detail robot, draw calls / triangles, today → now (budget): cobot; AMR; gantry; fenced cell | 3 / 100 → 8 / 1,336 (8 / 2,000); 3 / 72 → 5 / 1,132 (5 / 1,600); 4 / 48 → 6 / 1,392 (6 / 3,000); 4 / 48 → 10 / 1,948 (10 / 3,600) | `docs/consoles/ROBOTS-HD.md` | count |
| Balanced, phone and headset mounts that build nothing (maps); rooms identical; robot rooms inside the room budget with the high-detail robots (rooms carrying them); the busiest room, meshes and triangles | 15 of 15 (5); 18 of 18; 6 of 6 (4); 29, 4,668 | `docs/consoles/ROBOTS-HD.md` | count |
| Status-light states shown, before → after; seeded steps in which the light matches the site’s state; governor decisions shown right; no state shown dark; floor zone exactly inside the warning distance | 0 of 3 → 3 of 3; 360 of 360; 6 of 6; 7 of 7; 360 of 360 | `docs/consoles/ROBOTS-HD.md` | simulated |
| Motion: key poses eased with zero joint speed; worst joint step in a 60 Hz frame, radians; AMR metres travelled → metres rolled by the wheels | 4 of 4; 0.003; 1.23 → 1.21 | `docs/consoles/ROBOTS-HD.md` | simulated |
| In the built page: cell view draw calls / triangles drawn, old rig → new robot; sites with the right light in every state; robot rooms inside the budget with the hive’s agents; page errors; checker checks | 151 / 158,196 → 156 / 159,992; 4 of 4; 6 of 6; 0; 42 | `docs/consoles/ROBOTS-HD.md` | observed |
| **`ROBO-ARENA`: robots compete, model against model (its committed note and data files)** | | | |
| Model families compared on the same scenarios and seeds, before → after; scenarios (gym; hard variants; stations); episodes; steps checked by the governor; dispatches to a physical robot | none → 8; 12 (9; 3; 3); 4,260; 179,248; 0 | `docs/evals/arena.json` | simulated |
| Protocol committed, UTC, and held-out results committed, UTC; held-out seeds for the gym and for the stations; development seeds | 17:46; 17:48; 7121 –7180, 7121 –7130; 1 –20 | `docs/consoles/ROBO-ARENA.md` | count |
| Gym leaderboard, pooled success (Wilson 95% interval): expert; reactive; DAgger (3 rounds); clone; DAgger (1 round); per-step-reward clone; small model; random | 1.000 (0.993 to 1.000); 0.939 (0.909 to 0.959); 0.859 (0.827 to 0.886); 0.837 (0.804 to 0.866); 0.809 (0.774 to 0.840); 0.802 (0.766 to 0.833); 0.757 (0.720 to 0.792); 0.000 (0.000 to 0.007) | `docs/evals/arena.json` | simulated |
| Rules broken on the gym, each a protective stop, in the same order | 0; 0; 19; 35; 37; 43; 64; 670 | `docs/evals/arena.json` | simulated |
| Small model (26,640 parameters) against the clone on the held-out hard variants (180 episodes): small model; clone; difference (interval); task text blanked | 0.600; 0.622; −0.022 (−0.122 to 0.078); 0.606 | `docs/evals/arena.json` | simulated |
| The same over every scenario on held-out seeds (570 episodes) | 0.753; 0.846; −0.093 (−0.139 to −0.047); 0.719 | `docs/evals/arena.json` | simulated |
| Small model on the stations, with its task text and with it blanked: robot cell; AMR fleet; cobot (the clone passes 10 of 10 and 10 of 10 on the cell and the cobot) | 10 of 10, 0 of 10; 10 of 10, 0 of 10; 0 of 10, 0 of 10 | `docs/evals/arena.json` | simulated |
| Trainable set: episodes; steps; synthetic; consented; train, validation and test episodes; cross-split copies removed; duplicates dropped; leakage left | 351; 9,469; 351; 0; 237, 57, 57; 6; 3; 0 | `exports/robotics/arena/index.json` | count |
| Arena checker checks; the panel’s headless drive: rows; scenario cards; page errors; off-host requests | 8; 8; 12; 0; 0 | `docs/consoles/ROBO-ARENA.md` | observed |
| **`OMEGA-CLAW`: the agents that run robot training and model testing (its committed note and record)** | | | |
| Declared comparisons run once on held-out seeds, before → after; gym scenarios by challengers; seeds; episodes; steps checked by the governor; physical dispatches | none → 45 of 45; 9 by 5; 7121 –7180; 3,600; 133,061; 0 | `docs/evals/claw.json` | simulated |
| Promotions; refusals in all, by reason: not better; rule broken; not applicable; undeclared; seed reused; kinds exercised on purpose | 0; 47: 18; 18; 9; 1; 1; 3 of 3 | `docs/evals/claw.json` | count |
| The one clear win, DAgger (3 rounds) on fleet routing, refused: successes of the challenger and of the clone; lower bound against upper bound; rules the challenger broke | 55 of 60; 42 of 60; 0.819 against 0.801; 5 | `docs/evals/claw.json` | simulated |
| Audit: hash-chain lines re-walked (with the audit’s own line); declared first, each seed once, held-out seeds only | 228 (229); ok | `docs/evals/claw.json` | count |
| Persistent world, seed 1: simulated minutes; jobs completed; refused; vetoed; dispatched, all checked; steps monitored; physical dispatches; waiting for the learner | 960; 163; 28; 8; 190; 3,839; 0; 14 | `docs/evals/claw.json` | simulated |
| In the built page: simulated minutes; jobs completed; steps checked; seconds hidden, which gave no steps; page errors | 613; 119; 2,562; 4; 0 | `docs/consoles/OMEGA-CLAW.md` | observed |
| Claw checker checks, before → after the console’s work; bundle growth of the parishes and instructor pages, bytes | 0 → 8; 233,356; 152,007 | `docs/consoles/OMEGA-CLAW.md` | count |
| **`STRANDS`: a Python harness on the strands-robots interface, simulated only (merged into the integration head)** | | | |
| Robot types simulated; policies runnable through the interface; weight files, kilobytes | none → 4; none → 6; 13, 154 | `docs/consoles/STRANDS.md` and its commits and `docs/evals/strands.json` | count |
| Development comparison: episodes; steps checked by the governor; physical dispatches; network calls | 720; 32,801; 0; 0 | `docs/evals/strands.json` | simulated |
| Held-out run, once: episodes; steps checked by the governor; physical dispatches; network calls | none → 2,160; 97,289; 0; 0 | `docs/evals/strands.json` | simulated |
| Held-out success, with its interval: scripted expert; DAgger (the longer run); behaviour clone | 1.000 (0.989 to 1.000); 0.794 (0.750 to 0.833); 0.761 (0.714 to 0.802) | `docs/evals/strands.json` | simulated |
| Development success, with its interval: scripted expert; DAgger (the longer run); behaviour clone | 1.000 (0.969 to 1.000); 0.742 (0.657 to 0.812); 0.708 (0.622 to 0.782) | `docs/evals/strands.json` | simulated |
| **`ECOSYSTEM`: the seams with SmartCiti.X and Cognition.X (merged into the integration head)** | | | |
| Union and trade stations mapped to a block; of which unmatched and listed; robotics skills mapped; skills left out as school-age | 214 of 670; 456; 24 of 24; 6 | `docs/ecosystem/blocks-match.json` | count |
| Blocks in the committed extract, kilobytes; licence; the Cognition.X commit read | 91, 73; CC BY 4.0; 47c1820 | `docs/ecosystem/blocks-match.json` | count |
| Seams documented, before → after; declared rules for stations and for programme skills | none → 11; 15; 6 | `docs/ecosystem.md` | count |
| **`CLAW-2`: the claw’s second comparison and people beside robots (merged into the integration head)** | | | |
| Declared comparisons run once on the new held-out seeds; episodes; steps checked; physical dispatches; promotions | 45 of 45; 4,140; 155,744; 0; 0 | `docs/evals/claw2.json` | simulated |
| Refusals in all, by reason: not better; rule broken; undeclared; seed reused; not held out | 48: 23; 22; 1; 1; 1 | `docs/evals/claw2.json` | count |
| Small model against the clone on the port gantry; its hard variant (successes of the small model against the clone’s) | 45 of 60 against 60 of 60; 40 of 60 against 44 of 60 | `docs/evals/claw2.json` | simulated |
| Persistent world, seed 2: simulated minutes; jobs completed; steps monitored; physical dispatches; hash-chain lines, intact | 960; 141; 3,024; 0; 230 | `docs/evals/claw2.json` | simulated |
| **`ARENA-2`: the retest, declared first, run once (merged into the integration head)** | | | |
| Declared gaps pooled: small model with a hidden layer; clone; difference with its interval | 0.842 (0.766 to 0.896); 0.908 (0.843 to 0.948); −0.067 (−0.152 to 0.018) | `docs/evals/arena.json` | simulated |
| The effect of the hidden layer on the gaps (same seeds); every scenario, difference with the clone | 0.133 (0.028 to 0.235); −0.018 (−0.060 to 0.025) | `docs/evals/arena.json` | simulated |
| Cobot station: first small model; with a hidden layer; clone | 0 of 10; 10 of 10; 10 of 10 | `docs/evals/arena.json` | simulated |
| Episodes; steps checked by the governor; physical dispatches; dataset episodes from stations; leakage | 1,710; 83,756; 0; 90; 0 | `docs/evals/arena.json` and `exports/robotics/arena/index.json` | simulated |
| Bus events validated against the documented shape, all of them; telemetry messages; audit entries; network calls | none → 2,189; 11; 2,178; 0 | `tools/check_eco.mjs` | count |
| **`HIVE-7`: moods on the figures and on the live link (merged into the integration head)** | | | |
| Figure moods equal to the hive’s own mood (high and balanced); geometry added by the moods, at sampled minutes | none → 1680 of 1680; 12 of 12 equal | `docs/consoles/HIVE-7.md` | simulated |
| Combined operations room in the built page: meshes and triangles built, high; balanced | 46, 5,586; 85, 4,394 | `docs/consoles/HIVE-7.md` | observed |
| Live moods equal to the hive’s own; briefing first jobs equal to the first awards after approvals (seeded days; wider run); Spanish lines with an English fragment | none → 1435 of 1435; 30 of 30; 120 of 120; 0 of 2,788 | `docs/consoles/HIVE-7.md` | simulated |
| **`AVATARS-HD-4`: the nearest console at the room level, and moods on the body (merged into the integration head)** | | | |
| Operations room in the built page: meshes; triangles built | 46; 5,988 | `docs/consoles/AVATARS-HD-4.md` | observed |
| Robot rooms inside the budget with the high-detail robots and the hive’s agents, before → after; agents held back | 3 of 6 → 6 of 6; 1 | `docs/consoles/AVATARS-HD-4.md` | observed |
| Mood events that reached the figures in a seeded day; step checks that the figure’s mood equals the hive’s; bone-frames identical to before with no mood events | 142 of 142; 2,966; 386,400 | `docs/consoles/AVATARS-HD-4.md` | simulated |
| **`ENV-HD-7`: a kind cue on every site (merged into the integration head)** | | | |
| Sites with a kind cue, before → after; kinds with a cue; maps | 4 of 4 → 250; 4 of 4 → 6; 46 | `docs/consoles/ENV-HD-7.md` | count |
| Cue parts checked, none misplaced; worst cue triangles per site, balanced and high | 12,121; 480 and 1,968 | `docs/consoles/ENV-HD-7.md` | count |
| Street cameras with a sight line clear of the site cars; cue checker checks, before → after | 5 of 7 → 7 of 7; 118 → 934 | `docs/consoles/ENV-HD-7.md` | count |
| **`ROBOTS-HD-2`: the light that follows a run, the zone indoors, the green still (merged into the integration head)** | | | |
| Steps of an agent-jobs run lit by the governor’s decision, in the page; steps with the indoor zone exactly the warning distance, in the page; robot-steps headless | none → 21 of 21; none → 150 of 150; 1,711 of 1,711 | `docs/consoles/ROBOTS-HD-2.md` | observed |
| Drilling robot in high detail: draw calls; triangles; robot rooms inside the budget; most triangles built in a room in the page | 5; 2,344; 6 of 6; 5,838 | `docs/consoles/ROBOTS-HD-2.md` | observed |
| **`ROBOLEARN-9`: protocol 3, the arena and the claw together (merged into the head of round 8, 112a4d68; its note’s evaluation table)** | | | |
| Declared comparisons, each run once | 90 → 126 (protocol 3: 36/36, 5,220 episodes) | `docs/consoles/ROBOLEARN-9.md` | as committed |
| Promotions only with a clear interval | 0 of 0 → 2 of 2, both the reactive rule policy: AMR hard 59/60 [0.911, 0.997 ] vs bc 2/60 [0.009, 0.114 ]; port gantry hard 60/60 [0.94, 1 ] vs 50/60 [0.72, 0.907 ]; 0 rule breaks | `docs/consoles/ROBOLEARN-9.md` | as committed |
| AMR change: ra-lm-h48 − bc, AMR base | ra-lm-h − bc −0.100 [−0.247, 0.052 ] (7181–7240) → −0.067 [−0.235, 0.108 ], 32/60 vs 36/60. The interval spans 0, so no claim. | `docs/consoles/ROBOLEARN-9.md` | as committed |
| The change's effect, ra-lm-h48 − ra-lm-h, AMR | — → 0 [−0.173, 0.173 ] (32/60 each) | `docs/consoles/ROBOLEARN-9.md` | as committed |
| ra-lm-h − bc, port base | −0.033 [−0.114, 0.031 ] (7181–7240) → −0.117 [−0.222, −0.033 ], 53/60 with 7 rule breaks: ra-lm-h falls short here | `docs/consoles/ROBOLEARN-9.md` | as committed |
| Reactive − bc, hard variants pooled | not declared → +0.372 [0.300, 0.445 ] (179/180 vs 112/180) | `docs/consoles/ROBOLEARN-9.md` | as committed |
| ra-lm-h / ra-lm-h48 verdicts | not run by the claw → not-better on 4 scenarios each; rule-broken on 5 each (teleop, AMR, port, port hard, AMR hard) | `docs/consoles/ROBOLEARN-9.md` | as committed |
| Refusals exercised | 3 of 3 + not-held-out → 3 of 3 + not-held-out again; the probes ran nothing | `docs/consoles/ROBOLEARN-9.md` | as committed |
| Governor / physical | — → 184,742 of 184,742 steps, physical 0; chain intact (273 lines); world 960 minutes, 0 physical dispatches | `docs/consoles/ROBOLEARN-9.md` | as committed |
| Panel: the claw's model per scenario | 0 → 9 of 9 gym scenario cards, read from claw3.json (7 kept bc, 2 promoted reactive). The 3 station cards say they are not under the claw. | `docs/consoles/ROBOLEARN-9.md` | as committed |
| retest7 and protocol-3 cards | none → both, static HTML, figures compared with arena.json | `docs/consoles/ROBOLEARN-9.md` | as committed |
| arena.json retest8 | — → 36 rows copied from claw3.json (not a second run), plus a live bc row that reproduces the file | `docs/consoles/ROBOLEARN-9.md` | as committed |
| People blocks on opt-in, no reload | needed a reload → none → local on opt-in; local → none on revoke; 0 navigations, 0 page errors | `docs/consoles/ROBOLEARN-9.md` | as committed |
| A real station pass, headless | fixture → not done (see Left) | `docs/consoles/ROBOLEARN-9.md` | as committed |
| Page module oc-claw-record.js | 101,403 B (2 records) → 160,167 B (3 records, chains trimmed) | `docs/consoles/ROBOLEARN-9.md` | as committed |
| **`STRANDS-2`: stations through the Python harness (merged into the head of round 8, 112a4d68; its note’s evaluation table)** | | | |
| Station scenarios through the bridge | 0 → 3 (cobot, AMR, robot cell; expert 3 of 3, every step governor-checked) → selftest "station scenarios through the bridge" | `docs/consoles/STRANDS-2.md` | as committed |
| Parity with the arena per seed, stations | 0 → 12 of 12 (bc, ra-lm@stations, ra-lm-h, expert × 3 stations, dev 1–3) → selftest; $SP/loop10/st/parity_st2.py | `docs/consoles/STRANDS-2.md` | as committed |
| Parity, published ra-lm build and ra-lm-h on gym | 0 → 8 of 8 in the selftest (4 robot types × 2); 12 of 12 with the hard variants in scratch → selftest; $SP/loop10/st/parity_gym.txt | `docs/consoles/STRANDS-2.md` | as committed |
| Policies through the interface | 6 → 8 (adds ra-lm@stations, ra-lm-h) → selftest "8 of 8 " | `docs/consoles/STRANDS-2.md` | as committed |
| Station compare rows | 0 → 5 rows (45 episodes): bc, expert, ra-lm-h 1.000 [0.701, 1 ]; ra-lm@stations 0.667 [0.354, 0.879 ]; random 0.000 [0, 0.299 ] → docs/evals/strands.json devStations | `docs/consoles/STRANDS-2.md` | as committed |
| Exporter rows valid | 0 → 35,102 of 35,102 (full set); 761 of 761 (sample) → lerobot_jsonl.py --check; check_strands | `docs/consoles/STRANDS-2.md` | as committed |
| Exporter round-trip vs index.json | 441 of 441 episodes, 35,102 of 35,102 frames, per split and scenario; leakage 0 → same | `docs/consoles/STRANDS-2.md` | as committed |
| Physical dispatches | 0 → 0 → bridge replies; strands.json totals | `docs/consoles/STRANDS-2.md` | as committed |
| Network calls | 0 → 0 (Python sockets 0, bridge 0) → selftest | `docs/consoles/STRANDS-2.md` | as committed |
| Selftest | 27 → 33 pass → python3 robotics/strands/selftest.py | `docs/consoles/STRANDS-2.md` | as committed |
| check_strands | 22 → 29 checks → node tools/check_strands.mjs | `docs/consoles/STRANDS-2.md` | as committed |
| **`ECOSYSTEM-2`: the ecosystem behind consent (merged into the head of round 8, 112a4d68; its note’s evaluation table)** | | | |
| Tab drive in the built page | measured once by hand → a checker leg: 309 options (238 before the new rules), electrical blocks as the extract, 0 page errors, 0 requests and 0 storage writes after the click | `docs/consoles/ECOSYSTEM-2.md` | as committed |
| Stations mapped | 214 of 670 → 285 of 670 (385 unmatched, listed with the reason); round-7 rows unchanged (214 of 214) | `docs/consoles/ECOSYSTEM-2.md` | as committed |
| Extract | 91 blocks, 73.0 KB → 157 blocks, 114.8 KB (limit 200 KB), all in an adult band | `docs/consoles/ECOSYSTEM-2.md` | as committed |
| eco-bus events from a real opted-in session | 0 (no page loaded the adapter) → headless real Session: 5 of 5 valid, also accepted by SmartCiti.X's real Bus; built page: 2 of 2 valid | `docs/consoles/ECOSYSTEM-2.md` | as committed |
| Events held for K-12, demo and signed-out (and not opted in) | n/a → 0, 0, 0 (and 0), headless and in the built page | `docs/consoles/ECOSYSTEM-2.md` | as committed |
| Held after revoke | n/a → 0 (6 → 0 headless, including a run in progress; 2 → 0 in the page once consent is removed) | `docs/consoles/ECOSYSTEM-2.md` | as committed |
| Network calls | 0 → 0 | `docs/consoles/ECOSYSTEM-2.md` | as committed |
| Fixture lines valid | none → not done (left) | `docs/consoles/ECOSYSTEM-2.md` | as committed |
| check_eco with and without the clones | 7 of 7 (round 7) → 10 of 10 passed with the clones; 9 passed and 1 skipped (2b) with ECO_SIBLINGS=/nonexistent | `docs/consoles/ECOSYSTEM-2.md` | as committed |
| **`HIVE-8`: moods in the page, and corrections (merged into the head of round 8, 112a4d68; its note’s evaluation table)** | | | |
| Mood events reaching the figures, the panel's hive in the built page (ops room, oak-west-oakland, high; hive minutes 0–36) | 16 of 16 (the panel's hive already ran with moods; AVATARS-HD-4's figures subscribe) → 16 of 16 (unchanged); outdoor figures 16 of 16; glow mood = hive mood 7 of 7 built (base) and 6 of 6 (after) at minute 36 | `docs/consoles/HIVE-8.md` | as committed |
| Mood events reaching the figures, the scene's hive (sf-downtown, "A day in the hive", seed 1) in the built page | 0 → 1 (the planner turns busy at the award, in the cell hall; the refusal's moods fall while the camera is outside, with the room closed) | `docs/consoles/HIVE-8.md` | as committed |
| The same, headless (cell hall open through every beat, seeds 1, 2, 3, 7, 42) | 0 → 25; figure mood = released mood 25 of 25; relay mood(id) = hive 35 of 35 | `docs/consoles/HIVE-8.md` | as committed |
| The scene's beats with moods on | — → 5 of 5 seeds unchanged (non-mood events, beat by beat) | `docs/consoles/HIVE-8.md` | as committed |
| The default hive's output with the options off | digests 703aa91da7bb9439, 533938515253653d, 03f3d7a40c26af91; scene 13307c62…, e689091a…, ba4f0b27…, 4772e790…, fb9b7fae… → byte-identical 3 of 3, scene and relay 5 of 5 | `docs/consoles/HIVE-8.md` | as committed |
| Briefed jobs given to another agent while the briefed agent waits: a line at that award (page's case: no decide, approvals from minute 1 to 30) | 0 of 1 (seeds 1–40); 0 of 2 (seeds 1–200) → 1 of 1, grounded and in band (seeds 1–40); 2 of 2 (seeds 1–200) | `docs/consoles/HIVE-8.md` | as committed |
| First jobs said = first awards (the same case) | 117 of 120 → 120 of 120 (seeds 1–40); 30 of 30 (seeds 1–10) | `docs/consoles/HIVE-8.md` | as committed |
| Governor | 154 of 154 checked, physical 0 → 154 of 154, 3,196 of 3,196 steps, 0 physical; the scene's runs physical 0, chain intact | `docs/consoles/HIVE-8.md` | as committed |
| Combined ops room in the built page (high, briefing on, 1 room-level + 6 crowd figures) | 46 meshes, 5,988 triangles built, 5,890 drawn, 46 calls, 3 lights, 21.58 MiB → the same | `docs/consoles/HIVE-8.md` | as committed |
| Page errors / off-host requests | 0 / 0 → 0 / 0 (drives A, B, three runs) | `docs/consoles/HIVE-8.md` | as committed |
| **`AVATARS-HD-5`: moods in the page, rooms with no held agent (merged into the head of round 8, 112a4d68; its note’s evaluation table)** | | | |
| Posture and glow name the same mood: real hive with moods on, seed 1, ops room entered at minutes 0, 150, 300, the page's mount (headless) | 6,348 of 6,370 figure-steps. A figure built mid-day stood calm until its next mood event, while HIVE-7's glow seeded from hive.mood(id). First miss: Orrin at minute 151, glow relieved, posture calm. → 6,370 of 6,370 (posture = glow = hive.mood(id); 1,505 not calm: concerned, relieved, busy). Glow steady when calm, never brighter: 6,370 of 6,370. | `docs/consoles/AVATARS-HD-5.md` | as committed |
| The same in the built page (oak-west-oakland, high), entered at minute 158 after 23 refusals | (base page: HIVE-8 read posture = glow 4 of 7 at minute 36, because calm agents read null) → 352 of 352 figure-samples (entry + 60 hive minutes; 138 not calm), in both runs (the second with the still, 864 s at load 21–40) | `docs/consoles/AVATARS-HD-5.md` | as committed |
| Hidden triangles in the six robot rooms (what AVATARS-HD-4 suspected) | 7,450 built against 6,324 drawn in the AMR warehouse at 40d97421 → The only hidden meshes are ROBOTS-HD's floor zones and the figures' talk lights. Both show in some state. Hidden for good: 0. The gap was frustum culling. | `docs/consoles/AVATARS-HD-5.md` | as committed |
| Robot rooms, three agents each, headless as the page builds them | AMR warehouse own 4,940 → crowd, crowd, held (5,960). The other five rooms fit three. → with ROBOTS-HD-3's trim (room AMR 996 → 484) merged: AMR warehouse own 3,916 → room, crowd, crowd (5,842); 0 held, 6 of 6 inside | `docs/consoles/AVATARS-HD-5.md` | as committed |
| Robot rooms in the built page (sf-downtown, high), drive B | 6 of 6 inside, 1 held (AVATARS-HD-4, AMR warehouse) → 6 of 6 inside IX_BUDGET, 0 held (18 figures in 6 rooms; table below) | `docs/consoles/AVATARS-HD-5.md` | as committed |
| Ops room on high, page's mount, 7 standing and speaking (headless) | 46 / 5,992, margin 8 (constant headroom 414) → 46 / 5,992, margin 8 (measured headroom 414, unchanged). +13 triangles in the room → 7 crowd, 5,599. +300 → 7 crowd, 5,886. | `docs/consoles/AVATARS-HD-5.md` | as committed |
| Ops room in the built page with moods, mid-day (6 standing, 1 away) | — → 43 meshes, 5,484 triangles built (margin 516), 47 draw calls, levels room 1 / crowd 5 | `docs/consoles/AVATARS-HD-5.md` | as committed |
| Page errors / off-host requests | 0 / 0 → 0 / 0 in drive A (both runs) and drive B | `docs/consoles/AVATARS-HD-5.md` | as committed |
| **`ENV-HD-8`: parked vehicles, smaller variants, the next kinds (merged into the head of round 8, 112a4d68; its note’s evaluation table)** | | | |
| street cameras with no parked vehicle hiding the building or board (placements fixture, balanced and high) | 6 of 7 (the school: school bus) → 7 of 7; camera inside a vehicle 0 | `docs/consoles/ENV-HD-8.md` | as committed |
| street cameras unchanged with no vehicles passed | — → 7 of 7 | `docs/consoles/ENV-HD-8.md` | as committed |
| school street shot in the built page | bus across the building's foot (ENV-HD-7 still) → camera (-613, 2.5, 97.5) = headless; door, canopy and building clear; 115 draw calls, 210,872 triangles; the bus now stands beside the building in front of the play yard (see Left) | `docs/consoles/ENV-HD-8.md` | as committed |
| sites skipping a group | 33 of 250 → 24 of 297 (smaller variants at 19 sites: pavilion back 8, bed back 6, path 4, bays 3, bed 1, canopy 1, lane 1, yard 1, compound 1, lean-to 1); the 24 have the street at the door (hospital canopy and lane 8, park path 8, pavilion 4, bays 3 with wall-flush doors in their place) or water round the building | `docs/consoles/ENV-HD-8.md` | as committed |
| kinds with a cue | 6 → 8 (+ wetland 24 of 24, workshop 23 of 23, all in full) | `docs/consoles/ENV-HD-8.md` | as committed |
| badly placed parts (road / water / building / cue / board / buried) | 0 → 0 / 0 / 0 / 0 / 0 / 0, ENV-HD-6's independent test 0 | `docs/consoles/ENV-HD-8.md` | as committed |
| per-chunk budgets with FACADES, every cued chunk, all 46 maps, balanced and high | inside → inside | `docs/consoles/ENV-HD-8.md` | as committed |
| cue mesh per map (low / balanced / high), headless | orleans 0 / 4,536 / 6,888; sf-mission 0 / 4,824 / 10,896; sf-marina 0 / 4,740 / 10,092 → orleans 0 / 5,424 / 8,616 (16 sites); sf-mission 0 / 5,292 / 11,940 (15); sf-marina 0 / 5,196 / 11,100 (14); still 1 mesh, 2 draw calls; worst site 480 / 1,968 (budget 1,200 / 3,600) | `docs/consoles/ENV-HD-8.md` | as committed |
| the same in the built page (sf-mission, high) | 10,896 tris, 12 sites → 11,940 tris, 15 sites, 2 calls, 0 skipped = headless | `docs/consoles/ENV-HD-8.md` | as committed |
| phone tier and headset | nothing built → nothing built (all 46 maps) | `docs/consoles/ENV-HD-8.md` | as committed |
| page errors / external requests | 0 / 0 → 0 / 0 | `docs/consoles/ENV-HD-8.md` | as committed |
| check_hd6 | 934 → 958 pass | `docs/consoles/ENV-HD-8.md` | as committed |
| check_exteriors · check_hd4 · check_facades | 316 · 127 · 2,977 → 316 · 127 · 2,977 pass | `docs/consoles/ENV-HD-8.md` | as committed |
| check_newton · check_imports · check_parse | — → all pass · 1,141 modules · 2,726 modules parse | `docs/consoles/ENV-HD-8.md` | as committed |
| **`ROBOTS-HD-3`: the preview and the real run agree, the port room’s robot (merged into the head of round 8, 112a4d68; its note’s evaluation table)** | | | |
| preview and real run agree, step for step before the stop | not checked → 619 of 619 steps; 5 jobs the governor lets through (the other 5 of 10 are refused before any run), 69 runs; the real run stops at the E-stop step with estop 64 of 64; clean runs as long as their preview 5 of 5 | `docs/consoles/ROBOTS-HD-3.md` | as committed |
| robot-room hidden meshes, can show / hidden for good | untagged → 12 / 0 | `docs/consoles/ROBOTS-HD-3.md` | as committed |
| three crowd-budget figures fit beside the HD robots under the cap (headless) | 5 of 6 (warehouse 4,940 + 1,620 > 6,000) → 6 of 6 (warehouse 3,916 + 1,620 = 5,536) | `docs/consoles/ROBOTS-HD-3.md` | as committed |
| AMR in rooms, triangles / calls | 996 / 3 → 484 / 3 (≤ 600 / 3) | `docs/consoles/ROBOTS-HD-3.md` | as committed |
| robot rooms in the built page, inside IX_BUDGET with 3 figures and 0 held (AVATARS-HD-4's figures merged at a10f1ff8) | 6 of 6 with 1 held (AVATARS-HD-4 drive B, round 7) → 6 of 6, 0 held: cell hall 41 meshes / 5,966 built / 5,866 drawn (room ×3); cobot lab 48 / 5,754 / 5,408 (room 1, crowd 2); AMR warehouse 42 / 5,842 / 4,988 (room 1, crowd 2); port control 35 / 4,854 / 4,748 (room ×3); drilling deck 37 / 5,644 / 5,450 (crowd ×3); maint bay 40 / 5,824 / 5,250 (room 2, crowd 1) | `docs/consoles/ROBOTS-HD-3.md` | as committed |
| port room robot | 0 → 1 (straddle carrier, 696 tris / 2 calls ≤ 900 / 3); headless room 24 / 1,360 → 26 / 2,056; in the page on its own map 26 meshes, 26 calls, 2,016 drawn (2,056 built); beacons = the site's state (running), e-stop → red | `docs/consoles/ROBOTS-HD-3.md` | as committed |
| headless rooms with HD robots (high): warehouse / maint bay / port | 4,940 / 3,992 / 1,360 → 3,916 / 3,480 / 2,056 (all ≤ 6,000); Ultra worst 5,860 ≤ 8,500 | `docs/consoles/ROBOTS-HD-3.md` | as committed |
| balanced / phone / headset | today's rigs and rooms → unchanged (rooms identical 18 of 18, mounts 15 of 15) | `docs/consoles/ROBOTS-HD-3.md` | as committed |
| page errors / off-host requests | 0 / 0 → 0 / 0 in every drive | `docs/consoles/ROBOTS-HD-3.md` | as committed |
| **`SEO-WHITEPAPER-2`: the whitepaper page, generated (merged into the head of round 8, 112a4d68; its note’s evaluation table)** | | | |
| Page generated; output byte-identical on re-run | no (hand-written) → yes; second run "Unchanged", --check "current" | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| Sections, each with sources | 9 of 9 → 12 of 12 | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| Sourced claims | 69 → 116 | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| Loop-ten console rows; rounds shown | 19; rounds one to five, by theme → 34; rounds one to seven | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| Figures found in their cited committed files | 220 of 220 (lexical: anywhere in the file) → 817 of 817 under the tighter small-number rule | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| Small-number failures the tighter rule found on the way (fixed by rewording to the file's own words or pairing measures with figures) | — → 3 under the first form, 6 under the two -word form, then 0 | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| Planted wrong small number | passed (lexical) → fails (synthetic and real) | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| Checker checks | 43 → 55 | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| Page in the sitemap | yes (80 entries) → yes (80 entries) | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| VideoObject | none → 1, its clip and poster committed | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| Commercial claims, model identifiers on the page | 0 → 0 | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| Stills: page errors; failed responses; horizontal scroll at 390 and 1920 | — → 0; 0; 0 | `docs/consoles/SEO-WHITEPAPER-2.md` | as committed |
| **`REALISM`: facades that read as their material (merged into the head of round 8, 112a4d68; its note’s evaluation table)** | | | |
| facade materials with roughness and detail (3 maps, high) | 0 → 13 of 13 (Standard, per-class roughness/metalness, detail map); balanced 0 → 13 of 13 with grime/contact; phone 0 → 0 | `docs/consoles/REALISM.md` | as committed |
| surface classes with roughness, metalness and detail | 0 → 8 (brick, concrete, asphalt, metal, wood, stucco, tile, glass) | `docs/consoles/REALISM.md` | as committed |
| meshes and triangles per map, REALISM on vs off (3 maps × 3 tiers) | — → unchanged on all 9 | `docs/consoles/REALISM.md` | as committed |
| REALISM texture bytes (high / balanced / phone) | 0 / 0 / 0 → 262,144 (one 256 px RGBA detail map, budget 256 KiB) / 0 / 0 | `docs/consoles/REALISM.md` | as committed |
| built page, orleans port-terminal wide day, high | 144 calls, 153,327 tris, 6 textures → 144 calls, 153,327 tris, 7 textures (+ the detail map) | `docs/consoles/REALISM.md` | as committed |
| facade shader programs per tier | 1 → 1 (pa-rz-high-1, pa-rz-bal-1, pa-tint-1 phone unchanged) | `docs/consoles/REALISM.md` | as committed |
| exposure table, bands in range (full light and dim 0.8) | none → 8 of 8; ordered day 1.509 > dawn 0.512, dusk 0.461 > night 0.263 | `docs/consoles/REALISM.md` | as committed |
| phone tier | — → unchanged (no REALISM material, no texture, the same fixed lights) | `docs/consoles/REALISM.md` | as committed |
| built page, orleans, the other three shots (high) | street day 241 / 194,738; wide night 147 / 189,449; street night 243 / 199,462 → 240 / 190,888; 147 / 187,897; 243 / 198,274 (calls / tris). REALISM adds no geometry (check_rz §5); the small differences come from what moves and streams between runs (a walking worker is in the after frame) | `docs/consoles/REALISM.md` | as committed |
| built page, orleans, balanced / phone (4 shots each) | — (the before drive's measure lines were lost) → balanced: 135–263 calls, 109,150–130,309 tris, 0 REALISM bytes; phone: 100–187 calls, 59,551–70,191 tris, 0 textures, no REALISM material | `docs/consoles/REALISM.md` | as committed |
| worst chunk mass in the built page (orleans, high / balanced / phone) | — → 2 meshes / 2,412 · 2 / 2,412 · 2 / 1,968 tris (unchanged by REALISM, which adds no mesh) | `docs/consoles/REALISM.md` | as committed |
| page errors / external requests in the built page (12 loads × shots, three tiers) | — → 0 / 0 (shader-compile console errors watched too) | `docs/consoles/REALISM.md` | as committed |
| check_textures / check_palette / check_facades / check_interiors | pass → pass (palette 684, facades 2,977, interiors 957) | `docs/consoles/REALISM.md` | as committed |
| check_rz | — → 127 pass | `docs/consoles/REALISM.md` | as committed |
| **`ACCESS`: marked, step-free entrances and new walk-in interiors (merged into the head of round 8, 112a4d68; its note’s evaluation table)** | | | |
| enterable buildings with a marked, lit door and a step-free route | 0 of 863 (no marking existed) → 863 of 863 on 46 maps (740 by a route to a street, 123 by an open apron only); per map N of N on every map | `docs/consoles/ACCESS.md` | as committed |
| ramps where the sill is raised | — → 0 of 0 needed: no site building's sill differs from its door spot's ground by > 2 cm on any map (measured) | `docs/consoles/ACCESS.md` | as committed |
| new interior kinds | 0 → 4: fire bay 17 meshes / 780 tris, drop-off lobby 17 / 720, classroom wing 18 / 984, pavilion 17 / 708 (high; with 4 pads); texture 1.33 MiB (two 512×256 canvas signs) ≤ 24 MiB high and ≤ 3 MiB balanced | `docs/consoles/ACCESS.md` | as committed |
| pads reachable from the door | — → 16 of 16 (high), every agent spot and board too, on both tiers (grid search round colliders taller than the step, then NEWTON's walk) | `docs/consoles/ACCESS.md` | as committed |
| cued sites that open their room and return to the exact pose | — → every site of the four kinds on all 46 maps (CLASSROOMS' sites excepted) | `docs/consoles/ACCESS.md` | as committed |
| entrance budget | — → 2 meshes a map high and balanced, 0 low; ≤ 360 / 168 triangles an entrance; worst chunk ≤ 4,800 / 2,400; 0 texture, 0 light; headset 0 | `docs/consoles/ACCESS.md` | as committed |
| in and out by all four inputs | 3 of 4 wired (E, touch Use and pad A called npUse; the XR session's select did nothing) → 4 of 4 in the built page: keyboard at the hospital (drop-off lobby), touch at a park (pavilion), gamepad A through a stubbed getGamepads at the fire station (fire bay), headset select through a stubbed XR session at the hospital. Each went in and came back out to the exact door-spot pose | `docs/consoles/ACCESS.md` | as committed |
| entrances in the built page (Orleans, high) | — → 2 meshes, 7,980 triangles, 35 entrances; 12 sites open an ACCESS room | `docs/consoles/ACCESS.md` | as committed |
| HUD wayfinding | inside: the room's label; outside: the district only → inside: "Hospital drop-off lobby / generic room · Medical District Hospital Campus"; outside: "Tulane Avenue · the medical district", or "local street · Mid-City" | `docs/consoles/ACCESS.md` | as committed |
| page errors | — → 0 | `docs/consoles/ACCESS.md` | as committed |
| check_interiors · check_robo_interiors | 1,061 (approx.) · 302 → 1,085 · 302 pass | `docs/consoles/ACCESS.md` | as committed |
| check_walkable (headless leg) · check_newton · check_interface | — → 2,720 passed · all pass · 21 passed, 0 failed (UX_PORT=9168) | `docs/consoles/ACCESS.md` | as committed |
| check_imports · check_parse | — → all 1,142 modules · all 2,727 modules | `docs/consoles/ACCESS.md` | as committed |
| **`LESSONS-X`: agent-led lessons and lesson packs (merged into the head of round 8, 112a4d68; its note’s evaluation table)** | | | |
| Agent-led lessons | 0 → 36: 18 led by hive agents, 18 by the VBRIDGE evaluator; brief → demo → try → debrief in every one | `docs/consoles/LESSONS-X.md` | as committed |
| Lesson lines grounded in their station (a step title or cue found verbatim in the sim file, a standard on the certification, or the points arithmetic) | — → 725 of 725 (36 lessons, plus 6 with a debrief that names a missed step) | `docs/consoles/LESSONS-X.md` | as committed |
| Packs, with every station existing and enterable (catalog row, not flat, sim module present) | 0 → 6 packs across 4 worlds (parishes ×2, Bay World ×2, the Deep, Summit), 36 station slots (35 distinct), 0 refused | `docs/consoles/LESSONS-X.md` | as committed |
| ACCESS's interiors pack | — → 8 stations on pads in 4 rooms (acc-fire-bay, acc-drop-off-lobby, acc-classroom-wing, acc-park-pavilion). Each is station *pad* of its sf-downtown site with pad < 4, so it is on a pad on every tier. The style ids are in ACCESS's b98b57fe, not this tree; they join at integration. | `docs/consoles/LESSONS-X.md` | as committed |
| Standards taken from the stations | — → 60 of 60 | `docs/consoles/LESSONS-X.md` | as committed |
| Steps read from the sims = the catalog's step count | — → 35 of 35 stations (461 steps) | `docs/consoles/LESSONS-X.md` | as committed |
| Impossible requests refused | — → 5 of 5 pack cases (missing station, K-12 station, unknown standard, target above perfect, empty). 3 of 3 prompts, including a diving lesson asked of the robot sites ("no station in The parishes (robot sites) satisfies …"). A lesson at a missing station is also refused. | `docs/consoles/LESSONS-X.md` | as committed |
| Progress stored only for opted-in adults | — → stored in 1 of 6 cases (opted-in adult). Not stored for K-12, demo, signed-out, no adult attestation or not opted in. Revoke deletes; a missing consent deletes on the next read. | `docs/consoles/LESSONS-X.md` | as committed |
| Figure API called; voice off by default; captions always | — → headless: 18 speak events to the mount, 0 spoken with voice off, captions for every line | `docs/consoles/LESSONS-X.md` | as committed |
| Built page, parishes (sf-downtown, high, SwiftShader, ?lxLesson=ad-robot-cell-lockout-and-safe-reentry) | — → the lesson ran, led by Selka (software agent, the robot cell's home agent). Her figure was at rb-site-soma-robot-cell, captioned with the step-1 line after 20 s (4 events sent, 3 lines). Voice off. 0 page errors. | `docs/consoles/LESSONS-X.md` | as committed |
| Built page, instructor console | no tab → the Agent lessons tab shows 6 packs. A preview showed 18 lines by phase. Assigning stored {"pack":"lx-pack-parish-robot-sites"} only. 0 page errors, 0 off-host requests (three.js served locally) | `docs/consoles/LESSONS-X.md` | as committed |

Simulated: produced by the simulator on seeded runs, with synthetic demonstrations or simulated learners. Count: read from the data the repository ships. Content score: the platform's own station evaluation, scored out of 100. Each value is re-checked against its file by the build script that wrote this table. The scripted expert sees the targets, so it is a ceiling and not a competitor.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
