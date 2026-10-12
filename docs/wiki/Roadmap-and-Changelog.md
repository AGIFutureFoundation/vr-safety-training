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
- **Built** 742 stations, 143 checkers in the gate.
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
- **Built** The Omega Hive: 7 software agents, each with a personality, an on-device voice that is off by default and a badge portrait, bid for and run simulated robot jobs behind the safety governor. A steward can only add a refusal, and a request that names the physical path comes to the learner as an approval request: 3,631 of 3,631 run steps monitored, 0 dispatches to a physical robot, 10 of 10 approvals asked. No language model and no network call.
- **Built** An avatar layer for software agents: a labelled, faceless hologram figure that walks, shows a talk light and a caption, in 11 of a budget of 12 meshes and sprites a figure; the phone tier builds none. In the built page it carries the 4 agent-jobs personas and, since the hive-in-world work, the hive’s own agents (the avatar checker runs the real hive).
- **Built** A walk-in robotics room for 6 of 6 robot sites (6 room styles), inside the room budget on both tiers, with every station pad and agent spot reachable on foot (70 of 70).
- **Built** A building of its own, seen from outside, at 6 of 6 robot sites (5 kits) with pictogram-only signs, lit windows at night and 12 of 12 establishing-shot presets, inside the facade budget.
- **Built** Preference pairs train a reward model (a Bradley–Terry model on whole-run features; synthetic pairs from a synthetic rater, labelled so; a learner’s own pairs join only while they opt in). Used to keep the top 50% of the demonstrations before cloning, it did not beat the rule filter: fleet routing 0.483 against 0.817 rule-filtered and 0.600 unfiltered, its hard variant 0.050 against 0.050 and 0.117, on 60 held-out seeds. Weighting every demonstration’s vote by it gave 0.600 and 0.067. Reported as it is.
- **Built** Software-agent baselines for the 3 hard variants: random 0 of 3 and the scripted expert 3 of 3 on each; the text-reading agents do not apply to a gym observation.
- **Built** The lineage as a figure on the policy report: consent → dataset → policy → eval → deployment (0 learner consents, 6 synthetic datasets, 6 clones, 12 measured evals, 6 simulated sites).
- **Built** The hive in person (merged into the integration head): the real hive’s 7 agents are embodied by the avatar layer, and over a run of 152 steps the talk light is exact on 350 of 350 lines, a caption shows for 350 of 350 and every move ends at its named site (30 of 30). In the walk-in rooms each room’s agents stand at its agent spots (7 of 7, rooms by agents; 18 of 18 room-tiers inside budget), each room opens at its building’s own door (6 of 6) and a station launched from a room returns into it (6 of 6). With “Supervise every job” on (it starts off), dispatches without the learner’s approval go 150 of 155 → 0 of 116 on a seeded day, and the agents’ walks route round buildings: walk points inside a building 1,082 of 11,000 → 0 of 11,424.
- **Built** The hive speaks 2 languages, English and Spanish, picked by the page’s language with phrase cores of their own (merged into the integration head): a seeded Spanish day keeps 7 of 7 agents inside their speaking bands, 954 of 954 lines grounded in their events and 0 strings flagged by the calm-text scan; voices stay on the device.
- **Built** Every one of the 34 game characters speaks its own knowledge-pack lines in its own on-device voice (merged into the integration head): profiles derived from who they are, inside a gentle band with 34 of 34 distinct pairs; 136 of 136 lines spoken verbatim, network voices chosen 0, 0 utterances with voice off. Voice is off until the learner turns it on, and captions always show.
- **Built** The neighbourhood takes the robotics look (68 of 68 sheds and towers within 150 m of a robot site, the phone tier unchanged); scattered props keep out of the building lots (834 → 0); room styles with the high-detail texture set 6 → 15, with no mesh added and inside the room texture budget (merged into the integration head).
- **Built** An agent the hive sends to a robot site comes into that site’s room through the door and walks out when its job ends: job moves shown in the room 0 of 108 → 108 of 108, every room inside its mesh, triangle and texture budgets at 5,760 of 5,760 room-steps, never more than 3 figures in one room (merged into the integration head).
- **Built** The high-detail texture set on every room style a learner walks into: room styles with it 15 → 25 (the kitchen, the union hall, a Louisiana crafts hall, the Louisiana rooms and the rented room and shop joined), with meshes, triangles and lights unchanged on every tier and every map set only while its room stays inside the texture budget (merged into the integration head).
- **Built** The worst robot-site chunk on the high tier drops from 6 to 5 meshes where the generic and robotics building kits meet, and the robotics towers gain an entrance canopy with their roof plant sized by footprint; the phone tier builds what it built before.
- **Built** Parked vehicles and street life keep out of the robotics building lots: vehicles inside a lot 2 → 0, animals and people inside one 0, with a check in both checkers.
- **Built** What a learner turns on in the hive is remembered for a signed-in adult profile on this device (3 settings: the voice switch, “Supervise every job” and the language), under the profile’s own key and cleared on sign-out; demo, K-12, signed-out and unknown sessions store and read nothing (6 of 6).
- **Built** The hive panel’s own text and the agents’ role sentences follow the page’s language too: in Spanish 20 of 20 UI strings, 7 of 7 role sentences and 8 of 8 personality chips are covered, and in the page the Spanish panel shows no English UI string. The Spanish is machine-assisted and awaits a native speaker’s review.
- **Built** The voice-driven talk light in the rooms, driven with a stubbed speech engine offering one on-device and one network voice: on for 15 of 15 spoken lines and off after the agent’s last line 14 of 14, with a network voice chosen 0 of 94 times. “A day in the hive”, a seeded 27 -second scene for the video reviews, plays through its 12 beats in order (a job arrives, an agent bids and wins it and walks out of the cell hall’s door, the governor refuses a request with a person 1.2 m from the robot with its reason captioned, a job that names the physical robot asks the learner, and the approved run is simulated, 0 physical dispatches); its story holds on 5 of 5 seeds, the drive found page errors 0, and the approval is the scene’s own, standing in for the learner’s click.
- **Built** Establishing-shot presets for the 3 non-robot places a learner visits most (a bridge yard of 7 stations, a port terminal and a construction site), a wide shot from the road and an eye-level street shot each, day and night: scene presets 12 → 18, generic by kind.
- **Built** A reactive baseline that reads only the safety fields (no planner) joins the hard variants as a third arm beside random and the scripted expert: drilling 3 of 3, port 3 of 3, fleet routing 1 of 3 on 3 seeds (random 0 of 3 and the scripted expert 3 of 3 on each); on fleet routing its robots never break a rule but can block each other until the step cap; hard variants with it 0 → 3.
- **Built** A reward for steps, not whole runs: a Bradley–Terry model on 3 -step windows, dropping only the low-reward moments before cloning, declared before any held-out seed was run. At its declared threshold it did not beat the rule filter: fleet routing 0.550 against 0.817, its hard variant 0.017 against 0.050. A sweep reported beside it is not chosen from: its best threshold on fleet routing was seen on the held-out seeds and is not a result.
- **Built** The hard fleet-routing variant, with 6 opt-in features that read the other robots (the robot that holds the next cell and its move order): the aliasing ceiling on the same states 0.745 → 0.959, and after 5 declared rounds the clone reaches 0.983 against the expert’s 1.00, a gap of 0.017 (from 0.583 with route features and 0.95 with the default features). The labels are the scripted expert’s, not a person’s. Most of that gain is the detour move, a hand-written shortest path around the other robots that is close to what the scripted expert computes: without it, an ablation declared after the result was seen ends at 0.517 (a gap of 0.483), and the clone is given the planner's answer as a feature rather than learning to plan. The features are opt-in, and the default clone is unchanged (0.05).
- **Built** A learner can rate 2 cloned robot runs on the teleop pad with a thumbs up or down; the ratings are collected only while collecting, returned only for an opted-in adult, never for K-12, demo or signed-out sessions, and a revoke empties them (2 ratings make 1 pair; before opt-in, for K-12, demo and signed-out, and after a revoke the count is 0); the built-page drive: page errors 0, external requests 0; the new pad controls are 5 of 5 at 44 px or more on a phone).
- **Built** The agents talk to each other at handoffs (the dispatcher hands a job over and the winner confirms, the steward questions a bid and the bidder answers, the auditor reports a clean chain), each line in its speaker’s band, one at a time on the floor: exchanges in a seeded day 0 → 258, 516 of 516 lines grounded in the award, the bid or the chain, 258 of 258 replies directly after their opener and 0 overlaps; the governor still checks 161 of 161 jobs and 3,631 of 3,631 steps with 0 physical dispatches (merged into the integration head).
- **Built** An agent refers back to its own earlier jobs that day from the hive’s own chain only (its count of cell entries, the site it last reset, the hive-clock time): memory references 0 → 36 from 4 agents, 36 of 36 grounded, planted errors caught 3 of 3.
- **Built** The hive’s exchanges and memory lines are said in Spanish as well, on the same slots and under the same strict grounding: in the panel’s Spanish hive, exchanges per seeded day 0 → 258 and memory references 0 → 36, 516 of 516 and 36 of 36 grounded, 869 of 869 sentences in the speaker’s band and 0 English fragments but names; the lines are machine-assisted and have not been read by a native speaker.
- **Built** Personality, measured harder: a regressor fitted on text features recovers the 4 traits of held-out personas (Spearman, now: warmth 0.959, formality 0.832, verbosity 0.977, caution 0.799; the first run, right after the declaration, read 0.963, 0.812, 0.979, 0.804, and every reading is reported), which shows that the traits reach the text and not that the text is natural; wording variety lifts distinct-2 for 7 of 7 agents on the same events, and the safety steward, who repeated more with the talk on (down to 0.097), now rises after a question cooldown (0.145 → 0.159, with questions a day 103 → 45).
- **Built** An Omega Hive tab on the instructor console, read-only and local: a card for each of the 7 agents with portrait, traits and voice, the lines they said, the governor’s refusals with reasons and the evals table read from a committed JSON file; 0 buttons, and on a phone the tab is 96×44 pixels (merged into the integration head).
- **Built** The Omega Hive’s agents in high resolution on the desktop high tier: a skinned figure with a visor band, eyes, a mouth and a halo on a cool porcelain shell (the head and hands stay at least 0.15 from each of 12 skin tones, the closest 0.177), at 2,693 triangles on average against a budget of 3,000 and 3 draw calls while silent where today’s figure takes 9; the phone tier builds none, balanced keeps today’s figure, and the robot rooms keep it too (merged into the integration head).
- **Built** The agents’ posture follows their personality (Spearman ρ with the figure’s own pose numbers: caution 0.89, warmth 1.00, verbosity 1.00, formality 0.93), their silhouettes are distinct (18 of 21 → 21 of 21 pairs), the mouth opens within 15.3 ms of a stubbed voice’s word boundaries and 20.0 ms of a caption’s word onsets, and the hive’s own events draw gestures: a raised hand for 200 of 200 bids, an accepting gesture for 67 of 67 awards, a stop hand for 20 of 20 refusals and a nod for 47 of 47 approvals and 45 of 45 completions; portraits are drawn from the figure for the roster and the console.
- **Built** An opt-in Ultra setting on desktops: off by default and never offered on the phone tier, balanced, a headset browser or inside an XR session; it draws the facade atlas and the robot rooms’ floors and walls at 2,048 px, adds roof railings, plant and ladders to the robot sites and trusses and cable trays to the rooms, and stays inside its own stated limits (up to 2,892 triangles a site against 6,000; 49.33 –54.67 MiB of textures a room against 64 MiB) (merged into the integration head).
- **Built** Looks for the robot sites, 6 of them (dawn, day, dusk, night, fog at dawn, rain at dusk), over the app’s own clock and weather, 36 exterior presets (6 robot sites by 6 looks), and site lights on the high tier (floodlight masts, dock lamps, glares and pools of light: 880 triangles on the West Oakland map against 1,200 a site, no real light, no texture).
- **Built** The 6 robot rooms are lit (0 → 6 of 6: panels, a pendant over every station pad, 3 warning beacons and a task spotlight), with the phone tier, balanced and headset browsers identical to before; and a hive operations room has 7 consoles, one for each agent role, facing a video wall (25 meshes and 2,022 triangles on the high tier). Next

### Richer demonstrations

- *Planned* A real headset session for the recorder: the controller source is proven with stubbed sessions only.
- *Planned* The page proof in the gate: the drive is a script (`tools/drive_robotrain_page.mjs`) that exits with an error when the proof fails, but it is not in the gate, because adding it needs the coordinator's idle-machine timing.
- *Planned* A per-agent cadence baseline for the anomaly check: it catches 17 of 50 fast repeats, and its history is a procedural stand-in, not any site's own accepted-job log.
- *Planned* The Louisiana rooms on the balanced tier: they are over the texture budget before any skin (3.21 to 6.02 MiB against 3, from their name-sign canvases), the skin adds nothing there, and an atlas per room or phone-size signs would bring them in. More establishing shots (parks, fire stations, hospitals, schools) and a byte budget for the merged kind mesh follow.
- *Planned* A native speaker’s review of the hive’s Spanish; an agent that goes home outdoors when its last job ends (only the rooms send it home today); the hive’s remembered settings beyond the parishes page, which is the only page with a hive panel.
- *Planned* A fairer try of the per-step reward: windows paired so that about half contain a broken rule, scored on a fresh held-out range declared in advance (7061–7120), because broken-rule windows are rare in the synthetic pairs and the fit learnt little about them.
- *Open* The port-lane hard variant: the clone reaches 0.717 against the expert’s 1.00, a gap of 0.283, and no correction rounds have been tried on it.
- *Planned* A correction control on the pad, and a rated pair that carries a signal: the rated runs on the page, 2 of them, both pass in 26 steps with identical features, so rating the clone against a different policy would give the reward model something to learn; corrections still come from the scripted expert.
- *Planned* A console tab that reads the learner’s own hive instead of replaying a seeded day; and the native speaker’s review above now has more to cover, because the hive’s exchanges and memory lines are said in Spanish too (machine-assisted).
- *Planned* Carry the voice’s word boundaries to the figure’s mouth (the real voice controller forwards 0 today, and two lines on the hive side are needed), and bring the new figure into the robot rooms inside their triangle budget, with a lighter level or by drawing only the nearest.
- *Planned* Draw the Omega Hive tab’s content on the operations room’s console screens, which show procedural placeholder content today, and stand the agents in the room (its spots are ready, one for each role).
- *Planned* Ultra’s frame time on a desktop graphics card: the console’s figures come from a shared software renderer (1,490 → 1,424 ms in one shot) and say only that the difference there is inside the noise. Then

### Sim to real

- *Planned* The first measured real learners, adults who opt in, so the tutor's figures stop being simulated.
- *Planned* The deployment's own proxy that would hold an agent protocol's SDK and keys, described in the docs and not built.
- *Open* No hardware result exists. No claim here depends on one.
- *Planned* Pilot cells with robot hardware: the same task scored the same way in the Holodeck and on the bench by the protocol in `docs/bench-protocol.md`, with the gap measured and published, whatever it is. Scale

### Cohorts and fleets

- *Planned* Consenting crews' practice keeps improving the policies their site uses, with lineage from consent to deployment.
- *Planned* Per-site policy evaluation dashboards.
- *Planned* A first cohort runs the 30 programme templates at a union hall, school or employer; the pilot page lists what it would bring and what is missing.
- *Planned* A lineage diagram in the governance view, where today it is a table (the policy report has the figure).

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
| **Loop 10: `OMEGA-HIVE`, the software agents that manage the robots** | | | |
| Agents with a persona, voice and avatar | 0 → 7 | `docs/consoles/OMEGA-HIVE.md` | Loop 10 · 12 Oct 2026 |
| Naive-Bayes accuracy at naming the speaking agent, 5,686 held-out lines (chance 0.143) | none → 0.950 | `docs/consoles/OMEGA-HIVE.md` | Loop 10 · 12 Oct 2026 |
| Run steps the governor monitored across the hive’s seeded day; dispatches to a physical robot | none → 3,631 of 3,631; 0 | `docs/consoles/OMEGA-HIVE.md` | Loop 10 · 12 Oct 2026 |
| Approvals asked wherever the physical path is named; declined jobs that ran | none → 10 of 10; 0 | `docs/consoles/OMEGA-HIVE.md` | Loop 10 · 12 Oct 2026 |
| Seeded 200 -job day, mean steps from announcement to award: one dispatcher → the hive | 13.715 → 0.034 | `docs/consoles/OMEGA-HIVE.md` | Loop 10 · 12 Oct 2026 |
| Meshes, lights, triangles, draw calls and texture bytes the panel adds | none → 0 | `docs/consoles/OMEGA-HIVE.md` | Loop 10 · 12 Oct 2026 |
| Hive checker checks | 1 passed, 13 failed → 15 passed, 0 failed | `docs/consoles/OMEGA-HIVE.md` | Loop 10 · 12 Oct 2026 |
| **Loop 10: `AGENT-AVATARS`, the agents in the world** | | | |
| Agents embodied: hive agents through a fixture; agent-jobs personas in the built page | 0 → 3; 0 → 4 | `docs/consoles/AGENT-AVATARS.md` | Loop 10 · 12 Oct 2026 |
| Meshes and sprites in the heaviest figure, against a budget of 12 | none → 11 | `docs/consoles/AGENT-AVATARS.md` | Loop 10 · 12 Oct 2026 |
| Talk light exact on each spoken line, and a caption bubble for it, in real frames of the built page | none → 5 of 5; 5 of 5 | `docs/consoles/AGENT-AVATARS.md` | Loop 10 · 12 Oct 2026 |
| Draw calls with 4 figures: balanced; high; phone (which builds none) | 192 → 228; 190 → 226; 153 → 153 | `docs/consoles/AGENT-AVATARS.md` | Loop 10 · 12 Oct 2026 |
| **Loop 10: `ROBO-INTERIORS`, a walk-in room at every robot site** | | | |
| Robot sites with a walk-in robotics room | 0 of 6 → 6 of 6 | `docs/consoles/ROBO-INTERIORS.md` | Loop 10 · 12 Oct 2026 |
| Station pads and agent spots reachable on foot from the door | none → 70 of 70 | `docs/consoles/ROBO-INTERIORS.md` | Loop 10 · 12 Oct 2026 |
| Interiors checker checks | 733 → 925 | `docs/consoles/ROBO-INTERIORS.md` | Loop 10 · 12 Oct 2026 |
| **Loop 10: `ROBO-EXTERIORS`, the robotics buildings from outside** | | | |
| Robot sites with a dedicated exterior kit | 0 → 6 of 6 | `docs/consoles/ROBO-EXTERIORS.md` | Loop 10 · 12 Oct 2026 |
| Establishing-shot presets | 0 → 12 of 12 | `docs/consoles/ROBO-EXTERIORS.md` | Loop 10 · 12 Oct 2026 |
| Texture bytes per map on the high tier, measured in the page (budget 6,291,456) | none → 5,941,931 | `docs/consoles/ROBO-EXTERIORS.md` | Loop 10 · 12 Oct 2026 |
| Exterior checker checks | none → 259 | `docs/consoles/ROBO-EXTERIORS.md` | Loop 10 · 12 Oct 2026 |
| **Loop 10: `ROBOTRAIN-6`, preference pairs, corrections and the hardest gap** | | | |
| Roadmap Open items on preference learning | 1 → 0 | `docs/consoles/ROBOTRAIN-6.md` | Loop 10 · 12 Oct 2026 |
| Models trained on preference pairs | 0 → 1 | `docs/consoles/ROBOTRAIN-6.md` | Loop 10 · 12 Oct 2026 |
| Fleet routing clone success, 60 held-out seeds: rule-filtered; reward-filtered | 0.817; none → 0.483 | `docs/evals/colearn.json` via `docs/consoles/ROBOTRAIN-6.md` | Loop 10 · 12 Oct 2026 |
| Hard fleet-routing gap to the expert: before; after 5 rounds of corrections; with 4 route features | 0.95; 0.950; 0.583 | `docs/evals/colearn.json` via `docs/consoles/ROBOTRAIN-6.md` | Loop 10 · 12 Oct 2026 |
| Hard variants with a software-agent baseline | 0 → 3 | `docs/perf/agent-baselines-robotics.json` via `docs/consoles/ROBOTRAIN-6.md` | Loop 10 · 12 Oct 2026 |
| Colearn checker checks; roboscenarios checker checks | 46 → 55; 12 → 13 | `docs/consoles/ROBOTRAIN-6.md` | Loop 10 · 12 Oct 2026 |
| **Loop 10, round two: `HIVE-IN-WORLD`, the hive in person (merged into the integration head; figures from its committed note)** | | | |
| Hive agents embodied in the avatar checker, from a run of the real hive | 0 → 7 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs` and `tools/check_hive_world.mjs`) | Loop 10 · 12 Oct 2026 |
| Over a run of 152 steps (350 spoken lines): talk light exact; a caption for each line; moves ending at the named site | none → 350 of 350; 350 of 350; 30 of 30 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs` and `tools/check_hive_world.mjs`) | Loop 10 · 12 Oct 2026 |
| Agents standing at their room spots, rooms by agents; room-tiers inside the room budget with them in | none → 7 of 7; 18 of 18 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs` and `tools/check_hive_world.mjs`) | Loop 10 · 12 Oct 2026 |
| Rooms that open at their exterior building’s door; stations that return into the same room | none → 6 of 6; 6 of 6 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs` and `tools/check_hive_world.mjs`) | Loop 10 · 12 Oct 2026 |
| “Supervise every job” on a seeded day: dispatches without the learner’s approval, setting off → on | 150 of 155 → 0 of 116 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs` and `tools/check_hive_world.mjs`) | Loop 10 · 12 Oct 2026 |
| Walk points inside a building’s collider over 50 agent walks; standing slots inside a building | 1,082 of 11,000 → 0 of 11,424; 1 of 42 → 0 of 42 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs` and `tools/check_hive_world.mjs`) | Loop 10 · 12 Oct 2026 |
| Avatar checker checks (now run over the real hive); hive-world checker checks | 70; none → 35 | `docs/consoles/HIVE-IN-WORLD.md` (`tools/check_agent_avatars.mjs` and `tools/check_hive_world.mjs`) | Loop 10 · 12 Oct 2026 |
| **Loop 10, round two: `VOICES`, every character speaks in its own voice (merged into the integration head; figures from its committed note)** | | | |
| Characters with a voice profile, inside the band | 0 → 34; 34 of 34 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | Loop 10 · 12 Oct 2026 |
| Lines spoken verbatim from the knowledge pack; network voices chosen; utterances with voice off | none → 136 of 136; 0; 0 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | Loop 10 · 12 Oct 2026 |
| Talk light exact on each spoken line; worst speaking figure against the budget of 12 (before the light: 8) | none → 34 of 34; 9 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | Loop 10 · 12 Oct 2026 |
| Languages the hive speaks; a Spanish day: agents inside their band, lines grounded, strings flagged by the calm-text scan | 1 → 2; 7 of 7; 954 of 954; 0 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | Loop 10 · 12 Oct 2026 |
| Voice checker checks | none → 10 | `docs/consoles/VOICES.md` (`tools/check_voices.mjs`) | Loop 10 · 12 Oct 2026 |
| **Loop 10, round two: `ENV-HD-2`, high detail beyond the robot sites (its committed note, merged into the integration head)** | | | |
| Sheds and towers within 150 m of a robot site with a robotics variant | 0 → 68 of 68 | `docs/consoles/ENV-HD-2.md` | Loop 10 · 12 Oct 2026 |
| Scattered props inside a robotics building lot | 834 → 0 | `docs/consoles/ENV-HD-2.md` | Loop 10 · 12 Oct 2026 |
| Room styles with the high-detail texture set | 6 → 15 | `docs/consoles/ENV-HD-2.md` | Loop 10 · 12 Oct 2026 |
| Texture bytes per room on the high tier; balanced and low | 1.33 MiB → 17.33 MiB; 2.33 MiB | `docs/consoles/ENV-HD-2.md` | Loop 10 · 12 Oct 2026 |
| Stills at 1920 by 1080 pixels from the built page | none → 13 | `docs/consoles/ENV-HD-2.md` | Loop 10 · 12 Oct 2026 |
| Facades checker checks; detail checker checks | 2,860 → 2,957; 479 → 485 | `docs/consoles/ENV-HD-2.md` | Loop 10 · 12 Oct 2026 |
| **Loop 10, round three: `ENV-HD-3`, high detail everywhere a learner walks (merged; its committed note)** | | | |
| Room styles with the high-detail texture set; room-skin checker passes | 15 → 25; 164 → 382 | `docs/consoles/ENV-HD-3.md` | Loop 10 · 12 Oct 2026 |
| Worst robot-site chunk on the high tier, meshes; facades checker passes | 6 → 5; 2,957 → 2,977 | `docs/consoles/ENV-HD-3.md` | Loop 10 · 12 Oct 2026 |
| Establishing-shot presets; exteriors checker passes | 12 → 18; 259 → 278 | `docs/consoles/ENV-HD-3.md` | Loop 10 · 12 Oct 2026 |
| Vehicles parked inside a robotics lot; motorworks checker passes | 2 → 0; 37 → 69 | `docs/consoles/ENV-HD-3.md` | Loop 10 · 12 Oct 2026 |
| **Loop 10, round three: `HIVE-3`, the hive’s day (merged; its committed note)** | | | |
| Agents the hive sent to a site, shown inside its room; room-steps inside the budgets | 0 of 108 → 108 of 108; 5,760 of 5,760 | `docs/consoles/HIVE-3.md` | Loop 10 · 12 Oct 2026 |
| Hive settings remembered for a signed-in adult profile (3): back after a reload; demo, K-12 and signed-out sessions | none → back after a reload under the profile's own key only; demo, K-12 and signed-out sessions store nothing | `docs/consoles/HIVE-3.md` | Loop 10 · 12 Oct 2026 |
| The hive panel in Spanish: English UI strings left | no English UI string | `docs/consoles/HIVE-3.md` | Loop 10 · 12 Oct 2026 |
| Talk light in the rooms with a stubbed speech engine: on for each line; off after; network voices chosen | 15 of 15; 14 of 14; 0 of 94 | `docs/consoles/HIVE-3.md` | Loop 10 · 12 Oct 2026 |
| “A day in the hive”: a seeded scene, seconds; page errors; requests to another host | none → 27; 0; 0 | `docs/consoles/HIVE-3.md` | Loop 10 · 12 Oct 2026 |
| **Loop 10, round three: `ROBOTRAIN-7`, the robot-learning roadmap, next (merged; its committed note)** | | | |
| Per-step reward, clone success on 60 held-out seeds, AMR base and hard, at the declared threshold 0.25 | 0.550; 0.017 (the rule filter: 0.817; 0.050) | `docs/consoles/ROBOTRAIN-7.md` and `docs/evals/colearn.json` | Loop 10 · 12 Oct 2026 |
| Aliasing ceiling on the same training states, per-robot features against route features | 0.745 → 0.959 | `docs/evals/colearn.json` | Loop 10 · 12 Oct 2026 |
| AMR hard variant, clone success after 5 declared rounds with the other robots in view: the gap to the expert | 0.417 → 0.983; 0.583 → 0.017 | `docs/evals/colearn.json` | Loop 10 · 12 Oct 2026 |
| Ablation declared after that result was seen (holder and order features, no detour move): clone success after the same rounds; the gap | 0.517; 0.483 | `docs/evals/colearn.json` | Loop 10 · 12 Oct 2026 |
| Robot runs a learner can rate on the pad (opted-in adults only; page errors in the built-page drive) | none → 2; 0 | `docs/consoles/ROBOTRAIN-7.md` | Loop 10 · 12 Oct 2026 |
| Colearn checker checks | 55 → 61 | `docs/consoles/ROBOTRAIN-7.md` | Loop 10 · 12 Oct 2026 |
| Hard variants with a third baseline, a reactive agent that reads only the safety fields | 0 → 3 | `docs/perf/agent-baselines-robotics.json` | Loop 10 · 12 Oct 2026 |
| **Loop 10, round four: `HIVE-4`, the hive’s voices, memory and console (merged; its committed note)** | | | |
| Agent-to-agent exchanges in a seeded day; lines grounded; replies directly after their opener | 0 → 258; 516 of 516; 258 of 258 | `docs/consoles/HIVE-4.md` | Loop 10 · 12 Oct 2026 |
| Memory references to an agent’s own earlier jobs; grounded in the chain | 0 → 36; 36 of 36 | `docs/consoles/HIVE-4.md` | Loop 10 · 12 Oct 2026 |
| Trait recovery from text, Spearman per trait on held-out personas: warmth; formality; verbosity; caution | none → 0.959; 0.832; 0.977; 0.799 | `docs/consoles/HIVE-4.md` | Loop 10 · 12 Oct 2026 |
| In Spanish: exchanges and memory references per seeded day; lines grounded (exchange; memory); English fragments but names | 0 → 258; 0 → 36; 516 of 516; 36 of 36; 0 | `docs/consoles/HIVE-4.md` | Loop 10 · 12 Oct 2026 |
| Agents whose distinct-2 is above the default hive’s with the talk on; the steward’s questions a day with its cooldown | none → 7 of 7; 103 → 45 | `docs/consoles/HIVE-4.md` | Loop 10 · 12 Oct 2026 |
| The console’s Omega Hive tab: agent cards; eval rows; page errors in its drive | none → 7; 12; 0 | `docs/consoles/HIVE-4.md` | Loop 10 · 12 Oct 2026 |
| Governor with the talk on: jobs checked; steps monitored; physical dispatches | 161 of 161; 3,631 of 3,631; 0 (unchanged) | `docs/consoles/HIVE-4.md` | Loop 10 · 12 Oct 2026 |
| **Loop 10, round four: `AVATARS-HD`, the agents in high resolution (merged; its committed note)** | | | |
| Triangles per figure on the desktop high tier (mean; budget 3,000); draw calls per figure while silent | 1,012 → 2,693; 9 → 3 | `docs/consoles/AVATARS-HD.md` | Loop 10 · 12 Oct 2026 |
| Draw calls the agents add in the built page, high against balanced, with 6 in view; the phone tier’s draw calls | +18 vs +54; 154 unchanged | `docs/consoles/AVATARS-HD.md` | Loop 10 · 12 Oct 2026 |
| Distinct silhouettes among the 21 pairs of agents | 18 of 21 → 21 of 21 | `docs/consoles/AVATARS-HD.md` | Loop 10 · 12 Oct 2026 |
| Personality in the posture, Spearman ρ: caution; warmth; verbosity; formality | none → 0.89; 1.00; 1.00; 0.93 | `docs/consoles/AVATARS-HD.md` | Loop 10 · 12 Oct 2026 |
| Mouth timing, ms from a word boundary (stubbed voice) and from a caption word onset (voice off) | none → 15.3; 20.0 | `docs/consoles/AVATARS-HD.md` | Loop 10 · 12 Oct 2026 |
| Gestures fired: bids; awards; refusals; approvals; completions | 20 stop and 45 nod only → 200 of 200; 67 of 67; 20 of 20; 47 of 47; 45 of 45 | `docs/consoles/AVATARS-HD.md` | Loop 10 · 12 Oct 2026 |
| Portraits drawn from the figure; agent-avatar checker checks | none → 22 of 22; 70 → 92 | `docs/consoles/AVATARS-HD.md` | Loop 10 · 12 Oct 2026 |
| **Loop 10, round four: `ENV-HD-4`, scenes inside and out, and an opt-in Ultra setting (merged; its committed note)** | | | |
| An opt-in Ultra setting (desktop high only): facade atlas px; robot-room floor and wall px | none → off by default; 1,024 → 2,048; 1,024 → 2,048 | `docs/consoles/ENV-HD-4.md` | Loop 10 · 12 Oct 2026 |
| Looks for the robot sites; exterior presets | none → 6; 0 → 36 | `docs/consoles/ENV-HD-4.md` | Loop 10 · 12 Oct 2026 |
| Robot rooms with lighting; the hive operations room (meshes; triangles on the high tier) | 0 → 6 of 6; none → 25; 2,022 | `docs/consoles/ENV-HD-4.md` | Loop 10 · 12 Oct 2026 |
| Checker checks (`check_hd4`); neighbouring checkers still passing: interiors; room skins; exteriors | none → 118; 925 → 957; 382 → 401; 278 unchanged | `docs/consoles/ENV-HD-4.md` | Loop 10 · 12 Oct 2026 |

Before values are those the consoles' own evaluation tables give for the head before the loop. Simulated: seeded simulator runs, synthetic demonstrations. The date is the commit date of the console note.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `54c3f318`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
