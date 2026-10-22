# SmartCiti.X Holodeck wiki

**SmartCiti.X Holodeck · Powered by AGI Corp** is a browser and headset training platform for dangerous, skilled work. People practise real procedures in 742 scored stations across 61 programmes. In the robotics programme the same practice has a second job: only when an adult learner has opted in, their practice becomes demonstration data, kept on their own device, that trains simulated robots; the trained policy then demonstrates back. Humans teach robots; robots and software agents coach humans.

The robots are simulated and every result in this wiki is a simulation, seeded-run or synthetic-demonstration figure with its repository file named beside it. No hardware result, partnership, customer, price, valuation or raise is stated.

## Pages

- **[Executive summary](Executive-Summary.md)**: The SmartCiti.X Holodeck robotics programme on one page, for a reader who reads nothing else.
- **[Robotics training: humans and robots training each other](Robotics-Training.md)**: How one practice session has a teaching job and a data job, the six use cases, and what the person and the robot each learn at every robot station.
- **[A day in the Holodeck: three personas](Personas.md)**: Three walkthroughs, each a real path through existing stations: an apprentice laborer, a robot technician, an AI-training specialist.
- **[Evidence: every measured number with its file](Evidence.md)**: The single table of every number the whitepaper uses, with the repository file it comes from and what kind of number it is.
- **[Roadmap and changelog](Roadmap-and-Changelog.md)**: What is built, what is next, and what each build loop added, measured before and after.
- **[Progress, October 2026](Progress-October-2026.md)**: What the builds of 19 and 20 October added, each with the file that holds it and the checker that proves it.
- **[Learner-data terms, in plain language](Learner-Data-Terms.md)**: A plain-language summary of `docs/learner-data-terms.md`, a draft for counsel that says only what the code enforces.
- **[What a robotics pilot needs, and what exists](Pilot-Kit.md)**: A cohort pilot at a union hall, school or employer, mapped to what the repository already holds and what it does not.
- **[The Omega Hive: the agents that manage the robots](Omega-Hive.md)**: Seven software agents, each with a persona, an on-device voice and an avatar, coordinate every simulated robot job through the safety governor.
- **[Robotics buildings, inside and out](Robotics-Buildings.md)**: The six robot sites as buildings: high-detail exteriors, walk-in rooms, the agents standing inside, and the budgets each tier holds.
- **[The agents' bodies](Agent-Bodies.md)**: How the Omega Hive's seven software agents look on each device tier: the figure, personality in posture, speech in the mouth and gestures, and the budgets each tier holds.
- **[The robots in high detail](Robots-In-Detail.md)**: The cobot arm, AMR carrier, gantry and fenced cell on the desktop high tier: each inside a stated budget, with a status light that shows only the state the site already has.
- **[The robot arena: models compared on the same tasks](Robot-Arena.md)**: Every model family in the repository on the same scenarios and seeds through the governor, a small robot model trained here, and the trainable datasets, reported as measured.
- **[Omega Claw: the agents that run robot training and testing](Omega-Claw.md)**: Five software agents that declare each comparison before it runs, run it once on held-out seeds, audit it and promote a model only on a clear result.
- **[The stack](Stack.md)**: What the platform is built from, layer by layer, each with the repository file that holds it.
- **[A Python robot harness on the strands-robots interface](Strands-Robots-Harness.md)**: This repository's own harness, simulated only: robots and models through the strands-robots Policy and tool interface, compared on the arena's scenarios with every step checked by the governor.
- **[The ecosystem: SmartCiti.X and Cognition.X](Ecosystem.md)**: Where this platform meets its sibling repositories, the blocks bridge and the bus adapter; Router.X is not a repository yet.
- **[Realistic surfaces and light](Realism.md)**: Materials that read as their kind on the desktop tier, and one exposure table by time of day and weather, inside the stated budgets.
- **[Getting into and out of every building](Access.md)**: Marked, lit, step-free entrances, four walk-in room kinds, and one way in and out by keyboard, touch, gamepad and headset.
- **[Lessons led by the software agents](Agent-Lessons.md)**: Lessons a software agent leads at the station, grounded in its own steps and standards, and packs across the worlds.
- **[Who uses it, the risks, and the investor FAQ](Risks-and-FAQ.md)**: Who the platform is for, told as use rather than as customers; the risks and their mitigations; twelve investor questions answered from the repository only.
- **[Glossary](Glossary.md)**: The terms the whitepaper and the deck use, each in two plain sentences.
- **[Repository map](Repository-Map.md)**: Layout, the robotics modules, measured gym results, how to run and check.
- **[SmartCiti.X training series](SmartCitiX-Training-Series.md)**: every station by category and programme, generated from the catalogue.
- **[Pathway Edition](Pathway-Edition-wojrc.md)**: a separate programme built around one sponsor's stated services.

## Deeper reading in the repository

- [`docs/robot-training.md`](../robot-training.md): the robot training guide. [`docs/robotics-programme.md`](../robotics-programme.md): the six-track, five-level programme.
- [`docs/bench-protocol.md`](../bench-protocol.md): how the six gym tasks would be scored on hardware. It is a method; no hardware run has happened.
- [`docs/learner-data-terms.md`](../learner-data-terms.md): the learner-data terms, a draft for counsel that says only what the code enforces.
- [`docs/perf/robot-policies.html`](../perf/robot-policies.html): the static policy evaluation report, one card per trained policy.
- [`docs/consoles/`](../consoles/): one note per build console (195 so far), each with its evals before → after and what is left; `COORDINATOR.md` logs each integration loop.
- [`docs/virtuals-bridge.md`](../virtuals-bridge.md): how on-chain software agents would request robot work through the Holodeck, with the safety governor in between. A planned technology, modelled and not yet connected.

## Get involved

- **Pilot a robotics cohort**: a union hall, school or employer can run the robotics programme with a class; the instructor console tracks a cohort locally.
- **Build with the gym**: `WebXR/shared/rb-env.js` is a seeded reset/step/reward environment with scripted experts and labelled synthetic datasets in `exports/robotics/`.
- **Read the code before the claims**: every number here names its file; `node tools/check_all.mjs` re-checks all of them.

_Head `709cd68e`, built 2026-10-12. This wiki is regenerated from the verified whitepaper fragments; edit the fragments or the generator, not these pages._
