# Executive summary

The SmartCiti.X Holodeck robotics programme on one page, for a reader who reads nothing else. Built from the investor whitepaper's summary fragment; the deeper pages follow the links.

## The Holodeck robotics programme in one screen

SmartCiti.X Holodeck is a browser and headset training platform in which the same practice has a teaching job and a data job: it teaches people to work safely around robots, and, only when an adult learner has opted in, it becomes demonstration data on that learner's device to train simulated robots. The robots are simulated, and no hardware result is claimed.

**Who it is for.** Apprentices and robot technicians who need robot-safety training; AI-training specialists who collect and review demonstrations; robotics and software-agent teams who want a gym with safety rules built in. Union halls, schools and employers can pilot a cohort. No union, employer or robot maker is named as a partner, because there is none.

**What is measured.** These numbers each come from a file in the repository. All come from the simulator, seeded runs, synthetic demonstrations or simulated learners; none comes from hardware or from measured learners.

- 742 training stations, each scored by the platform's own content evaluation: mean 95.8 out of 100, 612 at 95 or more `docs/investor/platform-summary.json`
- 0.950 accuracy of a classifier naming which of the 7 software agents of the Omega Hive spoke a line, on 5,686 held-out lines; chance is 0.143 `docs/consoles/OMEGA-HIVE.md`
- 3,631 of 3,631 simulated run steps checked by the safety governor across the hive's seeded day, with 0 dispatches to a physical robot and 10 of 10 approval requests asked of the learner `docs/consoles/OMEGA-HIVE.md`
- 350 of 350 lines spoken by the real hive over a run of 152 steps with the avatar's talk light on exactly and a caption bubble for each; 7 of 7 agents standing at their room spots `tools/check_agent_avatars.mjs` `tools/check_hive_world.mjs`
- 6 of 6 robot sites with a walk-in room, and 6 of 6 with a building of their own seen from outside; 68 of 68 neighbouring sheds and towers take the robotics look, all generic by kind and inside their budgets `docs/consoles/ROBO-INTERIORS.md` `docs/consoles/ROBO-EXTERIORS.md` `docs/consoles/ENV-HD-2.md`
- 34 game characters, each speaking its own knowledge-pack lines in its own on-device voice; 136 of 136 spoken lines were verbatim and a network voice was chosen 0 times `tools/check_voices.mjs`
- 0.583 → 0.017 gap to the scripted expert on the hard fleet-routing variant, after 5 rounds of corrections with features that read the other robots (declared before any held-out seed was run); the expert’s labels are not a person’s. Without its detour feature the same rounds reach 0.517 `docs/evals/colearn.json`
- 200 of 200 seeded unsafe agent jobs blocked by the safety governor, each for the intended reason; 0 of 200 safe jobs wrongly blocked `docs/consoles/VBRIDGE.md`
- 66 of 100 rule-legal anomalous jobs caught by the governor's learned check, which the rules alone passed (0 of 100); 0 of 200 held-out safe jobs wrongly refused `docs/consoles/GOVERNOR-2.md`
- 0.050 → 0.417 clone success on the hard fleet-routing variant after 5 rounds of corrections labelled by the scripted expert, without and with 4 route features; the expert scores 1.00 (60 held-out seeds) `docs/consoles/ROBOTRAIN-6.md`
- 11.5% pass rate of the best text-reading software agent on 721 stations, against 100% for a scripted expert that sees the targets `docs/perf/agent-baselines.json`

### Built

- **Built** A training catalogue for people around robots: 742 stations in 61 programmes, with a robotics programme of 6 tracks and 5 levels, each level with a robot station of its own (30 of 30).
- **Built** A robot gym: 6 simulated scenarios, scripted experts and a behaviour-cloning learner, scored on held-out seeds beside a random floor.
- **Built** The learning loop in the app: demonstrate, consent, train, evaluate, the robot demonstrates back (5 of 5 steps live).
- **Built** A safety governor between software agents and simulated robots: e-stop first, 11 refusal reasons including a per-agent rate limit and a learned anomaly check that can only add a refusal, a hash-chained audit log.
- **Built** The Omega Hive: 7 software agents with personalities and on-device voices (off by default) that bid for simulated robot jobs behind that governor, ask the learner before anything that names the physical path, and are not a language model.
- **Built** Robotics buildings, inside and out: a walk-in room at 6 of 6 robot sites and an exterior kit at 6 of 6, inside the phone and headset budgets, with an avatar layer for the agents. The neighbouring buildings take the robotics look, and 9 more room styles take the high-detail textures.
- **Built** Consent, dataset cards and lineage: a revoke marks dependent policies stale, and the registry moves between devices as a file whose tampering is refused by name.
- **Built** A learner's own takes train the agent-jobs provider, observed in the built page: 3 takes, the card reads “your 3 takes”, and a revoke leaves 0 episodes. The takes are a scripted stand-in; no person was measured.
- **Built** The agents in person: the real hive’s 7 agents are embodied by the avatar layer and stand at their spots inside the walk-in rooms, which open at the buildings’ own doors (merged into the integration head).
- **Built** Each of the 34 game characters speaks its own lines in its own on-device voice, off until the learner turns it on, captions always, and a network voice never chosen (0 of 136).
- **Built** On the hardest gap, a clone given features that read the other robots reaches 0.983 against the expert’s 1.00 on the hard fleet-routing variant (the gap was 0.583 with route features), with correction labels from the scripted expert; most of that gain comes from a detour feature that is close to what the scripted expert computes. A reward for steps did not beat the plain rule.
- **Built** The high-detail textures now cover 25 room styles, the kitchen, the union hall and the Louisiana rooms among them, inside the same texture budgets; the worst robot-site chunk is down from 6 to 5 meshes (merged into the integration head).
- **Built** An agent the hive sends to a site appears in that site’s room and walks out when the job ends; what the learner turns on is remembered for a signed-in adult profile on the device (3 settings), the panel follows the page’s language (20 of 20 UI strings in Spanish, machine-assisted) and a scripted “day in the hive” scene of 27 seconds exists for the video reviews (merged into the integration head).
- **Built** Preference pairs that train a reward model, which did not beat the plain rule of keeping clean passes (0.483 against 0.817 on fleet routing): reported as it is.
- **Built** A pilot kit: 30 cohort templates, the instructor console, the consent flow with its draft terms, a policy report for each of 6 policies and a bench protocol that is a method (0 hardware runs).
- **Built** Labelled synthetic datasets with a dataset card, the cloned policy's parameters and an eval card for each of the 6 gym scenarios, in the LeRobot and RLDS layouts, licence CC0-1.0.

### Planned, not built

- *Planned* A measured study with real, opted-in adults. The app can train on a learner's own takes, but every demonstration measured so far is synthetic or a labelled scripted stand-in.
- *Planned* A measured study of how learners use the hive: its approval setting, its voices and its labels have not been tried by any person.
- *Planned* A native speaker’s review of the hive’s Spanish, which is machine-assisted.
- *Planned* A fairer try of the per-step reward on a fresh held-out range declared in advance, and a rated robot run that carries a signal: the rated pair so far has identical features, and corrections still come from the scripted expert.
- *Planned* A headset session on hardware for the teleoperation pad. The loop is proven with a stubbed session.
- *Planned* A bench pilot: one task scored the same way in the Holodeck and on a physical robot, with the gap published. No hardware run has happened.
- *Planned* Virtuals Protocol (its Agent Commerce Protocol and GAME framework) as a technology the project plans to use for on-chain agents; nothing from it is installed, bundled or called, and no partnership is stated.

 **The ask** [To be set by the founders.] Nothing on this page states a price, a valuation, a raise or a return.
 **Pilot contact** [To be set by the founders.]

 [Meet the Omega Hive][Walk the buildings][Watch the video reviews][See the pilot kit][Read the roadmap](Roadmap-and-Changelog.md)[Check every number](Evidence.md)[Ask the hard questions](Risks-and-FAQ.md#investor-faq)

The evidence table, the roadmap and the changelog follow on the next pages. Standards are named, never quoted; nothing here claims compliance.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `de429b36`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
