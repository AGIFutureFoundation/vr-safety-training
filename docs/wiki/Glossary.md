# Glossary

The terms the whitepaper and the deck use, each in two plain sentences.

## The terms, in plain words

The terms the whitepaper uses, each in plain sentences.

- **Behaviour cloning** A policy that copies what demonstrations did in similar moments. Here it is a k-nearest-neighbour vote with k set to 5; it does not plan and does not generalise beyond what it was shown.

Source: `docs/evals/colearn.json`, `docs/consoles/COLEARN.md`

- **Held-out seeds** Seeds that no policy trained on; a seed replays the same episode every time, so a result can be re-run. The scenario results use seeds 7001–7060, 60 of them.

Source: `docs/evals/colearn.json`

- **Governor** A set of rules between a software agent and a simulated robot that checks every command and every step, with the e-stop first. It has 11 refusal reasons, and being rules only it cannot see a hazard that no rule names.

Source: `docs/virtuals-bridge.md`, `docs/consoles/VBRIDGE.md`

- **Lineage** The recorded chain from a consent to the dataset made under it, the policy trained on that dataset and the deployment that runs the policy. When a consent is revoked everything downstream is marked stale, which was checked on 200 seeded graphs.

Source: `docs/consoles/ENTERPRISE-3.md`

- **Dataset card** A short datasheet written with each exported dataset, with a section for each question a reviewer should ask before trusting it. The policy-review station teaches reading it alongside the lineage.

Source: `docs/robot-datasets.md`, `docs/consoles/DATAWORKS.md`

- **SSM, speed and separation monitoring** The robot slows and then stops as a person comes nearer, driven by an area scanner with a warning field outside a protective field. The set-up station has the learner size the fields from the stopping distance and measure where the arm really stops; ISO/TS 15066 is named, not quoted.

Source: `docs/robotics-programme.md`, station `rt-speed-separation-monitoring-setup`

- **PFL, power and force limiting** A collaborative robot designed so that contact with a person stays under a force limit. The measurement station has the learner measure transient and quasi-static contact separately and judge each against the card's band.

Source: `docs/robotics-programme.md`, station `rt-cobot-power-force-limit-check`

- **E-stop** The emergency stop, a control that halts the machine and wins over every other command. The governor puts it first in its precedence, and every robot station has the learner prove it before work.

Source: `docs/virtuals-bridge.md`, `docs/robotics-programme.md`

- **Teleoperation** A person drives a robot remotely; here a pointer or controller pose moves a simulated arm. Each take can become a demonstration only if an adult has opted in, and a failed take is labelled as failed.

Source: `docs/consoles/ROBOTRAIN.md`, `docs/consoles/ROBOTRAIN-2.md`

- **Preference pair** A learner's thumbs up on one agent run and thumbs down on another run of the same station, each with one reason from a fixed list. The pairs are recorded and matched up, and they train a reward model (a Bradley–Terry model; so far on synthetic pairs from a synthetic rater). Used to filter demonstrations before cloning, it did not beat the rule filter. On the teleop pad an opted-in adult can also rate 2 cloned robot runs; 2 ratings make 1 pair.

Source: `docs/consoles/AGENTGYM.md`

- **Omega Hive** The name for the software agents that manage the simulated robots: 7 named agents with a personality, an on-device voice and an avatar. They bid for jobs, the safety governor checks every step, and a request that names the physical path asks the learner first. They are software, not people, and not a language model.

Source: `docs/omega-hive.md`, `docs/consoles/OMEGA-HIVE.md`

- **Reward model** A small model that scores a whole run so that a better run scores higher, fitted on pairs of runs where one was preferred (a Bradley–Terry model). Here the pairs and the rater are synthetic, and used to choose demonstrations it did not beat the plain rule of keeping clean passes.

Source: `docs/consoles/ROBOTRAIN-6.md`, `docs/evals/colearn.json`

- **Corrections (DAgger)** Rounds in which the clone drives, every state it visits is labelled with what the scripted expert would do there, and the clone is retrained on the lot. The labels are the scripted expert’s, not a person’s.

Source: `docs/consoles/ROBOTRAIN-6.md`

- **Per-step reward** A reward model that scores a short window of steps instead of a whole run, so that only the low-reward moments are dropped before the clone is trained and the rest of every demonstration is kept. The windows and the rater are synthetic.

Source: `docs/consoles/ROBOTRAIN-7.md`, `docs/evals/colearn.json`

- **Reactive agent** A baseline that picks each action from a short list of rules over the safety fields it can see, with no search and no planner. It sits between the random floor and the scripted expert, which sees the targets.

Source: `docs/consoles/ROBOTRAIN-7.md`, `docs/perf/agent-baselines-robotics.json`

- **Aliasing ceiling** The highest share of the expert’s labelled actions that any policy reading only a given set of features could match: where states give the same feature values but the expert acts differently, at least one of them must be answered wrongly. It is measured on training states before any held-out seed is run.

Source: `docs/consoles/ROBOTRAIN-6.md`, `docs/consoles/ROBOTRAIN-7.md`

- **Ablation** A re-run with one part taken out, to show how much that part carries. Here the detour feature was taken out of the other-robots features, and the clone’s success fell from 0.983 to 0.517.

Source: `docs/consoles/ROBOTRAIN-7.md`

- **Trait recovery** A check that the personality reaches the words: a small regressor, fitted on the text of some personas, estimates the traits (warmth, formality, verbosity, caution) of personas it has not seen, and the estimates are compared with the true traits by rank correlation. A high score shows the traits are visible in the text, not that the text sounds natural.

Source: `docs/consoles/HIVE-4.md`

- **Distinct-2 ** The share of different word pairs among all the word pairs an agent says, with the job ids, site names, agent names and numbers masked out. The higher it is, the less the agent repeats itself.

Source: `docs/consoles/HIVE-4.md`

- **Ultra** An opt-in detail setting for desktop computers, off by default. It draws the building facades and the robot rooms’ floors and walls at a larger texture size and adds fine detail (roof railings, plant and ladders; ceiling trusses and cable trays). It is never offered on a phone, on the balanced tier, in a headset browser or inside a headset session, because it takes far more texture memory.

Source: `WebXR/shared/hd4-ultra.js`

- **Look** A named pairing of the time of day and the weather for a robot site: dawn, day, dusk, night, fog at dawn and rain at dusk. A look sets the sky, how far the fog lets you see, how wet the ground is and whether the floodlights are on.

Source: `WebXR/shared/hd4-looks.js`

- **Silhouette overlap** How much the outlines of a pair of agents coincide when seen from the front: the area they share divided by the area they cover together (intersection over union). Identical outlines overlap completely. The avatar checker requires every pair of agents to stay under a set value, so that they can be told apart by outline alone.

Source: `docs/consoles/AVATARS-HD.md`

Definitions follow how the repository uses each term, not an outside textbook.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `54c3f318`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
