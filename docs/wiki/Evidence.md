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
| Quality-gate checkers in the full run | 138 | `tools/check_all.mjs` | count |
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
| **`HIVE-IN-WORLD`: the hive in person (checkers re-run on a snapshot of its branch; no console note)** | | | |
| Real hive in the avatar checker (seed 1, 152 steps: 350 spoken lines, 30 moves, 22 refusals, 56 completions): talk light exact; a caption for each line; moves ending at the named site | 350 of 350; 350 of 350; 30 of 30 | `tools/check_agent_avatars.mjs` on `0c834a8a` | simulated |
| Calm stop gesture on each refusal; nod on each completion; hive agents embodied, before and after | 22 of 22; 56 of 56; 0 → 7 | `tools/check_agent_avatars.mjs` on `0c834a8a` | simulated |
| Agents standing at their room spots, rooms by agents; room-tiers inside the room budget with the agents and captions in | 7 of 7; 18 of 18 | `tools/check_hive_world.mjs` on `0c834a8a` | simulated |
| One door: rooms that open at their exterior building’s door; door spots clear of every exterior collider; stations that return into the same room | 6 of 6; 6 of 6; 6 of 6 | `tools/check_hive_world.mjs` on `0c834a8a` | simulated |
| “Supervise every job” on a seeded 200 -job day: dispatches without the learner’s approval, setting off → on; every dispatch follows an approve line; physical dispatches | 150 of 155 → 0 of 116; 116 of 116; 0 | `tools/check_hive_world.mjs` on `0c834a8a` | simulated |
| Agents’ walks: walk points inside a building’s collider, before → after routing round buildings; walks that took a route round one; standing slots inside a building, before → after | 1,082 of 11,000 → 0 of 11,424; 8; 1 of 42 → 0 of 42 | `tools/check_hive_world.mjs` on `0c834a8a` | simulated |
| Avatar checker checks; hive-world checker checks | 70; 35 | `tools/check_agent_avatars.mjs` on `0c834a8a`, `tools/check_hive_world.mjs` on `0c834a8a` | count |
| **`VOICES`: every character speaks, in its own voice (checker re-run on a snapshot of its branch)** | | | |
| Characters with a voice profile, before and after; inside the band (rate 0.85 to 1.05, pitch 0.85 to 1.15); distinct pairs; closest pair as a share of the band | 0 → 34; 34 of 34; 34 of 34; 0.100 | `tools/check_voices.mjs` on `dc890479` | count |
| Stubbed speech engine with an on-device and a network voice: lines spoken verbatim from the pack; network voices chosen (of 136 utterances); overlapping lines | 136 of 136; 0; 0 | `tools/check_voices.mjs` on `dc890479` | simulated |
| Utterances with voice off; dialogues identical with voice on and off | 0; 102 of 102 | `tools/check_voices.mjs` on `dc890479` | simulated |
| Languages the hive speaks, before and after; a seeded Spanish day of 955 lines: agents inside their band; sentences inside; lines grounded; strings flagged by the calm-text scan; speaker accuracy on 2,269 held-out lines | 1 → 2; 7 of 7; 1,536 of 1,536; 954 of 954; 0; 0.959 | `tools/check_voices.mjs` on `dc890479` | simulated |
| Talk light exact while a line is spoken; meshes in the heaviest speaking figure against the budget; voice checker checks | 34 of 34; 9 of 12; 10 | `tools/check_voices.mjs` on `dc890479` | simulated |
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

Simulated: produced by the simulator on seeded runs, with synthetic demonstrations or simulated learners. Count: read from the data the repository ships. Content score: the platform's own station evaluation, scored out of 100. Each value is re-checked against its file by the build script that wrote this table. The scripted expert sees the targets, so it is a ceiling and not a competitor.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `41e41366`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
