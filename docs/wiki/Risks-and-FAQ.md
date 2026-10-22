# Who uses it, the risks, and the investor FAQ

Who the platform is for, told as use rather than as customers; the risks and their mitigations; twelve investor questions answered from the repository only.

## Who uses it, and for what

This describes who would use Holodeck and for what. The project has no customers to name and names none. Nobody named in its sources endorses it or partners with it.

### Used by: Union halls and training centres

- **How it is used** An instructor sets up an organisation and a cohort with seats, and the cohort's invite code is the class code. They load a level's template, set the due date and required score, assign it, run the stations, debrief with the instructor guide and issue the credential.

- **Built today** 30 cohort templates, one for each of 6 tracks at 5 levels, each with an instructor guide. Required scores run from 60 to 85. Credentials as Open Badges, with transcripts and xAPI.

- **Not there yet** No hall has run a cohort through it. Seats are a count; billing adapters ship off and no payment path is live.

### Used by: Schools and career centres

- **How it is used** A class takes the awareness level: how a robot knows to stop, what its sensors and zones do, who restarts it, and what jobs robots do. A silica awareness lesson covers dust at a building site.

- **Built today** `k12-rp-how-a-robot-knows-to-stop` (content score 95) and `k12-sil-dust-you-cannot-see-at-a-building-site` (content score 95), both at the awareness level, where no data is ever collected. Due in 14 days at a required score of 60.

- **Not there yet** No school has used it, and no school body has reviewed it.

### Used by: Employers and safety leads

- **How it is used** Technicians practise entering a cell under lockout, and integrators and safety leads set up and sign off a cell. A supervisor practises the job of holding the stop on robots that software agents dispatch.

- **Built today** Levels for technicians (80) and integrators (85), with 17 and 21 robot-station places. `vb-supervising-agent-dispatched-robots` (content score 98), `ad-robot-cell-lockout-and-safe-reentry` (content score 93) and `rt-speed-separation-monitoring-setup` (content score 98).

- **Not there yet** The cells are generic and procedural, not a site's own layout. No employer has used it.

### Used by: Robotics teams

- **How it is used** A team trains and scores a policy against the Holodeck's tasks, reads each policy's dataset card and lineage, and sees what a software agent can and cannot do on the same stations.

- **Built today** A gym with reset, step and reward over 9 scenarios, deterministic by seed; LeRobot and RLDS layouts; policies scored on held-out seeds beside a random floor and an expert; 721 stations as agent tasks; 24 GAME-style functions for the simulator.

- **Not there yet** No hardware backend, and no policy beyond k-nearest-neighbour behaviour cloning.

The programme runs inside the platform's own pages: 742 stations in 61 programmes. Sources: `docs/robotics-programme.md`, `docs/consoles/ROBOPROG.md`, `docs/consoles/ROBOTRAIN.md`, `docs/investor/stations.csv`.


## What could go wrong, and what is already done about it

These are the risks we can point to in the work itself, each with what the repository already does about it and what it does not.

### Sim-to-real gap

- **What the repository shows** Every robot is a procedural simulated rig, and its limits are simulation parameters, not ratings of any machine. The newest scenarios, a drilling robot and a port gantry, are small and discrete, so their clones reach the expert (1.00 and 1.00): that shows the tasks are learnable from clean demonstrations, not that they are hard. Even in simulation the clone trails the expert on the hardest task: 0.817 against 1.00, and it copies a hand's lag, needing 83.9 steps against 62.6.

- **Mitigation built** Every result is reported next to a random floor and a scripted expert on held-out seeds, and labelled synthetic. The tasks score the rules a bench would also score: e-stop test, lockout order, separation.

- **Still open** No hardware result. The planned pilot scores the same task in the Holodeck and on a bench and publishes the gap.

### Consent

- **What the repository shows** Recording is inert unless an adult, signed-in learner has opted in. K-12, demo and signed-out sessions never collect. The ConstructionVR study's consent covered research use only, so its data train nothing here.

- **Mitigation built** Data stay on the device, with no upload endpoint. Revoking deletes the takes and marks dependent policies stale: 797 of 797 deployments flagged correctly across 200 seeded graphs. Agent ratings go through the same gate, and so do the thumbs a learner can give a cloned robot run on the teleop pad: they are stored only through that gate, only while collecting, for an opted-in adult, never for K-12, demo or signed-out sessions, and a revoke empties them.

- **Still open** No real learner has been measured, so the consent screen itself has not been tested on people. A registry moves between devices only as a file a person carries; no sync service exists.

### Data quality

- **What the repository shows** Cloning every demonstration copies the lapses: on pick-and-place, 0.00 from all of them against 0.967 from clean passes, with only 19 of 40 kept. All demonstrations so far are synthetic or a labelled scripted stand-in.

- **Mitigation built** Clean passes only is the default. Dataset cards and lineage record where each policy's data came from. The tutor's weak case is published: against static hints it is worse by −3.84 steps when one hint suits everyone.

- **Still open** Real demonstrations will be noisier than a scripted hand. The tutor's figures come from simulated learners. The best text-reading agent passes 11.5% of station runs against 100% for the expert.

### Safety of agent-dispatched robots

- **What the repository shows** A software agent can ask for a robot job, and an unsafe job must not reach a robot. The governor is a rule set: it cannot see a hazard no rule names.

- **Mitigation built** E-stop first, then 11 refusal reasons; 200 of 200 seeded unsafe jobs blocked and 0 of 200 safe jobs wrongly blocked. Agent commands reach simulated robots only, the physical path ships disabled even with a named approver, and every decision is hash-chained.

- **Still open** The anomaly check's history is a procedural stand-in, not any site's accepted-job log, and its cadence feature catches only 17 of 50 fast repeats. A person still supervises, and the supervising station trains for exactly that job.

### Dependence on outside protocols

- **What the repository shows** The agent bridge is shaped like Virtuals Protocol's Agent Commerce Protocol and GAME framework, which the project plans to use. Its Node package marks itself deprecated in favour of a newer one. Protocols and SDKs change, and the project does not control them.

- **Mitigation built** The concepts were re-modelled in the project's own small code, so nothing is installed, bundled or called, and no key, wallet or chain call exists. The provider is off by default and refuses any configuration that names a key, a price or a chain host.

- **Still open** The server that would hold an SDK and its keys is described, not built. Virtuals Protocol's whitepaper could not be read from the build environment, so every point comes from its SDK source files. No partnership or endorsement is stated or implied.

### Overclaiming

- **What the repository shows** The agent baselines are heuristics, and no language model is called anywhere in the build. A pass rate of 11.5% for the best of them is far from the 100% of an expert that sees the answers.

- **Mitigation built** Every figure in this whitepaper is checked against a repository file by the script that built it, and its kind is shown beside it. Standards are named, never quoted.

- **Still open** Labour-market and injury statistics are not in this whitepaper, because the official sources could not be fetched when it was written.

### Agents that look like people

- **What the repository shows** The Omega Hive gives software agents names, personalities, voices and avatars. That can make software feel like a person, and a learner might trust it as one or take its manner for judgement.

- **Mitigation built** Every card, label and caption says “software agent”; the names are invented; the portraits are badges, or drawn from the figure on the desktop high tier, and the figures are a tinted hologram with a visor and a halo; the desktop high tier’s newer figure also has eyes, brows and a mouth on its visor band, on a porcelain shell with no skin tone (`docs/consoles/AVATARS-HD.md`), and none is a real person’s likeness. Voices are on the device and off until the learner turns them on, and captions always show. No agent outranks the governor: the e-stop wins, a veto only adds a refusal, and a request that names the physical path waits for a person.

- **Still open** Whether learners read the labels has not been tested on people. The lines are built from a grammar, so they sound distinct but not natural: style adherence is full by construction, and personality adds about 8 points of speaker accuracy beyond what the role already gives away.

Sources: `docs/consoles/COLEARN.md`, `docs/consoles/ROBOTRAIN.md`, `docs/consoles/VBRIDGE.md`, `docs/consoles/ENTERPRISE-3.md`, `docs/consoles/SILICA.md`, `docs/virtuals-bridge.md`, `docs/evals/colearn.json`, `docs/perf/agent-baselines.json`.


## Investor FAQ

## Investor questions, answered from the repository

These are questions an investor is likely to ask, answered from the repository only. Where the repository has no answer, the answer says so.

### Does any of this work on a real robot?

No, and nothing here claims it does. Every robot is a procedural simulated rig, and its limits are simulation parameters, not ratings of any machine. Each result is reported next to a random floor and a scripted expert on held-out seeds, so a reader can see how far a result is from both.

Even in simulation the gap is visible: on AMR fleet routing the clone reaches 0.817 against 1.00 for the expert, and a clone of a hand's recorded takes needs 83.9 steps against 62.6 for synthetic ones, because it copies the hand's lag. The planned pilot scores one task the same way in the Holodeck and on a bench and publishes the gap, whatever it is.

Sources: `docs/evals/colearn.json`, `docs/consoles/ROBOTRAIN.md`, `exports/shared/holodeck-shared.json` (`robotics.data`)

### Who owns the data a learner records, and what are the consent rules?

The rules the code enforces: recording needs an adult, signed-in learner who has opted in. K-12, demo and signed-out sessions never collect, and any unknown about who the learner is counts as a refusal. An adult who has played a K-12 lesson on a profile is not offered collection.

The data stay on the device, and no data module makes a network call; the checker looks for that. Revoking deletes the consent, the salt and the episodes, and marks every policy that depended on them stale: 797 of 797 deployments were flagged correctly across 200 seeded lineage graphs. The repository does not contain data-licensing or ownership terms beyond this, and none is claimed here.

Sources: `docs/consoles/DATAWORKS.md`, `docs/consoles/ENTERPRISE-3.md`, `docs/robotics-programme.md`

### What does “agents on chain” mean here, and what does it not mean?

It is a product plan. SmartCiti.X plans to use the Holodeck to bridge on-chain software agents that manage robots, and plans to use Virtuals Protocol as a technology for that. What is built is the seam: a job model shaped like that protocol's job phases, 24 GAME-style functions across 4 workers, and a safety governor with 11 refusal reasons that every agent command passes, e-stop first.

It does not mean a wallet, a key, a signature, a chain call, a contract, a payment or a token exists in the build: none does. Agent commands reach simulated robots only, and the physical-robot path ships disabled. Nothing from the protocol's SDKs is installed, bundled or called, and the repository states that there is no partnership or endorsement.

Sources: `docs/virtuals-bridge.md`, `docs/consoles/VBRIDGE.md`, `exports/shared/vb-game-functions.json`

### Why is there no hardware yet?

The repository does not give a cost or supplier reason. What it shows is the order of the work: first the training and the evidence in simulation, and the rule that governs any physical step. Commanding a physical robot would need a named human approver, and that path is frozen off in the build.

The roadmap's sim-to-real step is a pilot with robot hardware on the same task, with the gap published. It is planned, not started, and no claim on these pages depends on it.

Sources: `docs/virtuals-bridge.md` (the robot rule), `docs/consoles/VBRIDGE.md`

### How is the quality of the training content gated?

Every station is scored by the platform's content evaluation out of 100. Across 742 scored stations the mean is 95.8, with 612 scoring 95 or more, 126 between 90 to 94, and 4 below 90. The robotics stations built in the recent loops each score 95 or more.

A full gate runs 153 checkers, and each build console records its own cycles: what it expected, what it measured and what it changed.

Sources: `docs/investor/platform-summary.json`, `docs/investor/stations.csv`, `tools/check_all.mjs`

### What do the checkers actually catch?

Real examples from the build notes. The governor's adversarial check seeds unsafe agent jobs: before the governor existed 0 of 200 were blocked, after it 200 of 200, each for the intended reason, with 0 of 200 safe jobs wrongly blocked. A K-12 checker caught a digit that had slipped into a lesson's text, and a pack checker caught a stale export.

The port-gantry clone drove into a pinned container's keep-out on 37 of 60 held-out seeds until its features named the cell below, and the checker now scans 2,734 expert steps for broken rules and finds 0. The evaluation caught a quieter failure: a clone of a scripted walker's takes scored zero on cell entry, because the walking body drifted while inside the cell and produced a stray step. Fixing the stand-in brought it to 1.0. The same notes record checker counts such as 253 checks for the teleoperation gate.

Sources: `docs/consoles/VBRIDGE.md`, `docs/consoles/ROBOTRAIN-2.md`, `docs/consoles/ROBOSCENARIOS.md`

### What is synthetic in the demonstrations?

Most of it, and each page says which. The demonstrations behind the policies are generated by a scripted expert with noise. The “human” who drives the recorder in tests is a scripted hand with tremor and lag, labelled synthetic. The adaptive tutor's figures come from 300 simulated learners. The agent baselines are heuristics, and no language model is called anywhere.

The agent-jobs panel serves a seeded queue of mock jobs. No real learner and no real robot has been measured.

Sources: `docs/consoles/COLEARN.md`, `docs/consoles/ROBOTRAIN.md`, `docs/consoles/AGENTGYM.md`, `docs/virtuals-bridge.md`

### What is the relationship with unions?

None is claimed. The programme page states that it has no partnership with any robot maker, integrator, software platform, investor or union, and that it does not deliver or describe any employer's or union's programme.

Stations cite training bodies by name as the source a practice is taught from, which is a citation and not an endorsement, and no union's logo is reproduced anywhere in the repository. These pages name no union as a partner because there is none.

Sources: `docs/robotics-programme.md`, `docs/unions.md`

### What safeguards exist for children?

The awareness level, which holds the K-12 robot lessons, collects no data at all, and the recorder refuses K-12, demo and signed-out sessions. The K-12 stations score 95 and 95 on content evaluation. Lesson text has no figures and no fear framing, and the K-12 checker passes 3352 checks.

There is a K-12 version of the agent-supervision idea, a robot waiting for a grown-up's OK. What the repository does not show is a review by a school or a child-safety body, and none is claimed.

Sources: `docs/robotics-programme.md`, `docs/consoles/DATAWORKS.md`, `docs/consoles/ROBOTRAIN-2.md`

### Which open standards does it use?

Credentials export as Open Badges 2.0 assertions, attempts as xAPI statements to a configured learning record store, transcripts as CSV (RFC 4180), and an LTI 1.3 launch relay carries a learner's identity from a learning-management system. Robot episodes follow LeRobot and RLDS style layouts. Environments load as glTF binaries, and the apps are WebXR pages.

Safety standards such as ISO/TS 15066 and OSHA 29 CFR 1910.147 are named so learners can find them. No clause is quoted and nothing claims compliance or certification.

Sources: `docs/WHITEPAPER.md`, `docs/robot-training.md`, `docs/robotics-programme.md`

### What breaks if a protocol vendor disappears?

The simulator, the governor, the stations and the learning loop do not depend on any vendor: nothing from the protocol's SDKs is installed, bundled or called, and the job model and its deliverables, an episode plus an evaluation card, are the project's own. The provider that would connect to a protocol is off by default, and the build runs on a mock one.

What would be lost is the planned deployment proxy, the server that would hold an SDK and its keys. It is described, not built. The Node package of that protocol already marks itself deprecated in favour of a newer one, which is the kind of change the design expects.

Sources: `docs/virtuals-bridge.md`, `docs/consoles/VBRIDGE.md`

### What must the team build next?

Since the last list, `ROBOTRAIN-5` observed the page-level proof in the built page (the card read “your 3 takes”, and a revoke left 0 episodes) and pinned the hard variants with checkers; `GOVERNOR-2` added a per-agent rate limit and a learned anomaly check to the governor (9 → 11 refusal reasons) and registry export and import between devices. Those items are built and are no longer on it.

Since then, the loop 10 consoles built the Omega Hive (7 software agents behind the governor), an avatar layer for them, a walk-in room at 6 of 6 robot sites and an exterior kit at 6 of 6; and `ROBOTRAIN-6` trained a reward model on preference pairs, tried 5 rounds of corrections on the hardest gap and baselined the 3 hard variants. Those items are built and are no longer on the list.

A second round of that loop attached the hive's agents to the avatar layer and stood them in the walk-in rooms, gave the 34 game characters on-device voices, and took the robotics look to 68 of 68 neighbouring sheds and towers.

A third round of that loop, now merged into the integration head, did this: `ROBOTRAIN-7` measured a reward for steps, which did not beat the rule filter at its declared threshold (0.550 against 0.817 on fleet routing), per-robot features that take the fleet-routing hard variant from a gap of 0.583 to 0.017 (most of that gain is a detour feature that is close to what the scripted expert computes; without it the same rounds end at 0.517), a reactive baseline for the hard variants, and a thumbs up or down on 2 cloned robot runs, for opted-in adults only; `ENV-HD-3` put the high-detail textures on 25 room styles, brought the worst robot-site chunk from 6 to 5 meshes, kept parked vehicles out of the robotics lots, and framed 3 more places for the reviews (scene presets 12 → 18); `HIVE-3` stood the agents the hive sends to a site inside its room (108 of 108 job moves shown), remembered what a signed-in adult turns on, put the hive panel in Spanish (20 of 20 UI strings) and scripted a “day in the hive” scene. The roadmap page marks each item.

A fourth round of that loop, now merged into the integration head, did this: `HIVE-4` had the agents talk to each other (exchanges in a seeded day 0 → 258, 516 of 516 lines grounded, in English and in Spanish), refer back to their own earlier jobs (36 memory references, 36 of 36 grounded), recovered their traits from text on held-out personas (Spearman 0.799 to 0.977 across the 4 traits), and added a read-only Omega Hive tab to the instructor console; the safety steward first repeated more with the talk on, and a question cooldown fixed it (0.145 → 0.159); `AVATARS-HD` built the agents' high-detail figure for the desktop high tier (2,693 triangles on average against a budget of 3,000 and 3 draw calls while silent), with posture from the personality, a mouth that follows the words, gestures for the hive's own events and distinct silhouettes (18 of 21 → 21 of 21 pairs); the real voice controller does not yet pass the voice's word boundaries to the mouth; `ENV-HD-4` lit the 6 robot rooms, added 6 looks for the robot sites and a hive operations room, and an opt-in Ultra setting for desktops that stays off on phones, balanced and headsets. The roadmap page marks each item.

A fifth round of that loop is merged into the integration head: `AVATARS-HD-2` carried the voice's word boundaries to the agents' mouths (0 → 20 forwarded in the checker's controller test) and made the talk light and the mouth wait for the voice to start; `ENV-HD-5` brought the Louisiana rooms inside the balanced texture budget (6 of 6 measured), lit the robot rooms in a light-weight form on balanced and framed the 4 next busiest kinds of place; `HIVE-5` stood the hive in its operations room with the screens painted from its own data, let the instructor tab read the learner's own hive over a same-origin link the learner turns on, and sent agents home outdoors too (89 of 89 home moves in a seeded day); with both consoles merged the video review’s capture found the operations room over its triangle limit (8,508 triangles of 6,000), which no checker covered, and an integration fix keeps the lightened figure there (4,470 measured); `ROBOTRAIN-8` ran its retests on 60 fresh seeds, each declared before it was run: a reward for steps still trailed the rule filter (0.517 against 0.650), a clone with no planner output ended a gap of 0.683 short of the expert on the hard fleet-routing variant, correction rounds on the port lane left its gap at 0.283, and a reactive agent that waits, then sidesteps, passed 55 of 60 seeds where the earlier one passed 26 of 60. The roadmap page marks each item.

A sixth round of that loop is merged into the integration head: `AVATARS-HD-3` put all 7 agents in the operations room at a crowd level of the high-detail figure (5,586 triangles of 6,000), routed the figures round the consoles and gave the mouth its own time at a low frame rate; `ENV-HD-6` gave the busiest park, fire station, hospital and school a cue of their kind (0 → 4 of 4 kinds, with no protected emblem), hung every job board’s night lamp from a post and made the street camera know every tree; `ROBOTS-HD` drew the simulated cobot arm, AMR, gantry and fenced cell in high detail on the desktop high tier, with a status light that shows the site’s own state (360 of 360 seeded steps matched); `HIVE-6` gave the agents moods derived from the hive's own events (862 of 862 changes traced) and a morning briefing (35 of 35 lines grounded), both off by default, with words on the balanced screens; `ROBO-ARENA` compared 8 robot model families on 12 scenarios through the governor; a small language-conditioned model trained here did not beat the clone (−0.093, interval −0.139 to −0.047), and the trainable sets carry a dataset card with 0 leakage between splits; `OMEGA-CLAW` ran 45 declared comparisons once and promoted 0 models, refusing the one clear win for its 5 broken rules, and kept the robot sites working in one persistent simulated world. The roadmap page marks each item.

A seventh round of that loop is merged into the integration head: `STRANDS` built a Python harness on the strands-robots interface, simulated only: 4 robot types, 6 policies, 720 development episodes with 0 physical dispatches, and it says plainly that the package the asked-for sample imports does not exist; `ECOSYSTEM` mapped 214 of 670 union and trade stations to Cognition.X blocks by declared rules and wrote the seams with SmartCiti.X and Cognition.X down, with nothing wired into either and Router.X marked absent; `CLAW-2` ran the claw's second declared protocol once, with the small model in it: 45 comparisons, promotions 0; `ARENA-2` declared a retest on fresh seeds before running it; the hive, avatar, building and robot consoles each took their next step (moods on the figures, the nearest console at the room level, a kind cue on every site, a green still of the cell). The roadmap page marks each item.

From the build notes' own lists of what is left: a real headset session for the teleoperation pad, which today is proven with stubbed sessions; a robot-side answer to the port lane's hard variant, where declared rounds of corrections left the clone at 0.717 against the expert's 1.00 (a gap of 0.283, the same as the earlier seeds gave with no rounds), and to fleet routing without a planner's help, where a clone given only local features ends a gap of 0.683 short of the expert (the detour feature, which is close to what the scripted expert computes, ends 0.067 short), all on the scripted expert's labels and not a person's; the page proof's drive script in the gate, where it is not yet, because it needs an idle-machine timing; a per-agent cadence baseline for the anomaly check, which catches 17 of 50 fast repeats, and a history from a site's own accepted jobs instead of a procedural one; a measured study of how learners use the hive's approval setting, voices and labels, none of which has been tried by a person; a correction control on the pad, which would replace the scripted expert's labels with a person's; and a lineage diagram instead of a table in the governance view.

Beyond the code, the first measured real learners, who opt in, and the bench pilot with the gap published. A cohort pilot would also need named adults, a site, hardware for any bench run and a legal review of the learner-data terms: the pilot page lists what exists and what does not. These are planned, not built, and the roadmap page marks each.

Sources: `docs/consoles/ROBOTRAIN-8.md`, `docs/consoles/HIVE-4.md`, `docs/consoles/AVATARS-HD.md`, `tools/check_hd4.mjs`, `docs/consoles/ROBOTRAIN-7.md`, `docs/consoles/ROBOTRAIN-6.md`, `docs/consoles/OMEGA-HIVE.md`, `docs/consoles/ROBOTRAIN-5.md`, `docs/consoles/GOVERNOR-2.md`, `docs/consoles/ROBOTRAIN-4.md`, `docs/consoles/ROBOTRAIN-3.md`, `docs/consoles/VBRIDGE.md`, `docs/consoles/ENTERPRISE-3.md`, `docs/consoles/AGENTGYM.md`, `docs/bench-protocol.md`

### Are the Omega Hive’s agents AI models, and can they move a real robot?

They are software agents, and they say so on every card. Each line they speak is built on the device from the agent’s style grammar and the event’s own data; no language model is called and no network call exists in the hive. A dialogue adapter exists in the shape of the game’s own, and it refuses until it is configured.

They cannot move a real robot: every robot is simulated and the physical path ships disabled. A request that names it is refused by the governor and comes to the learner as an approval request, and approving lets only a simulated job run. Across a seeded day 3,631 of 3,631 run steps were monitored and 0 jobs were dispatched to a physical robot.

Sources: `docs/omega-hive.md`, `docs/consoles/OMEGA-HIVE.md`

### Are the robotics buildings real places?

No. The 6 of 6 robot sites’ buildings and the 6 of 6 walk-in rooms are generic by kind and drawn from code, with textures painted on canvases. The interiors note says no real building’s interior is modelled, nothing in a room moves, and the signs are pictograms with no words, so nothing names a company, union or trade body.

What is measured is their cost: every room stays inside the room budget on both tiers, and the kits add 1 to 2 meshes a site to scenes that stay under 260 / 400,000 meshes and triangles.

Sources: `docs/consoles/ROBO-INTERIORS.md`, `docs/consoles/ROBO-EXTERIORS.md`

### What did the eighth round add?

`ROBOLEARN-9`, protocol 3, the arena and the claw together (6 commits); `STRANDS-2`, stations through the Python harness (3 commits); `ECOSYSTEM-2`, the ecosystem behind consent (4 commits); `HIVE-8`, moods in the page, and corrections (5 commits); `AVATARS-HD-5`, moods in the page, rooms with no held agent (4 commits); `ENV-HD-8`, parked vehicles, smaller variants, the next kinds (4 commits); `ROBOTS-HD-3`, the preview and the real run agree, the port room’s robot (6 commits); `SEO-WHITEPAPER-2`, the whitepaper page, generated (4 commits); `REALISM`, facades that read as their material (3 commits); `ACCESS`, marked, step-free entrances and new walk-in interiors (3 commits); `LESSONS-X`, agent-led lessons and lesson packs (5 commits). Each console works on its own branch from a10f1ff8, and the page reads its commits and its note, never a summary of them.

The rules did not change: robots are simulated and the governor checks every step; agents are software and labelled so; data is opt-in for adults, local, and deleted on revoke; every model is trained here, with its protocol committed before its held-out run.

Sources: the console branches of round 8 and their notes in `docs/consoles/`

Every figure carries its source file in the table of evidence. Nothing here states a valuation, a raise, revenue, a customer or a partner.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
