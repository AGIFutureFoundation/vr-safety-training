# Executive summary

The SmartCiti.X Holodeck robotics programme on one page, for a reader who reads nothing else. Built from the investor whitepaper's summary fragment; the deeper pages follow the links.

## The Holodeck robotics programme in one screen

SmartCiti.X Holodeck is a browser and headset training platform in which the same practice has a teaching job and a data job: it teaches people to work safely around robots, and, only when an adult learner has opted in, it becomes demonstration data on that learner's device to train simulated robots. The robots are simulated, and no hardware result is claimed.

**Who it is for.** Apprentices and robot technicians who need robot-safety training; AI-training specialists who collect and review demonstrations; robotics and software-agent teams who want a gym with safety rules built in. Union halls, schools and employers can pilot a cohort. No union, employer or robot maker is named as a partner, because there is none.

**What is measured.** These numbers each come from a file in the repository. All come from the simulator, seeded runs, synthetic demonstrations or simulated learners; none comes from hardware or from measured learners.

- 742 training stations, each scored by the platform's own content evaluation: mean 95.8 out of 100, 612 at 95 or more `docs/investor/platform-summary.json`
- 0.717 vs 1.00 success of the cloned policy against the scripted expert on the **hard** port lane variant, 60 held-out seeds: a gap of 0.283. On the base task it was 1.00 against 1.00 `docs/evals/colearn.json`
- 200 of 200 seeded unsafe agent jobs blocked by the safety governor, each for the intended reason; 0 of 200 safe jobs wrongly blocked `docs/consoles/VBRIDGE.md`
- 11.5% pass rate of the best text-reading software agent on 721 stations, against 100% for a scripted expert that sees the targets `docs/perf/agent-baselines.json`
- 797 of 797 dependent deployments marked stale after a consent revoke, across 200 seeded lineage graphs `docs/consoles/ENTERPRISE-3.md`

### Built

- **Built** A training catalogue for people around robots: 742 stations in 61 programmes, with a robotics programme of 6 tracks and 5 levels, each level with a robot station of its own (30 of 30).
- **Built** A robot gym: 6 simulated scenarios, scripted experts and a behaviour-cloning learner, scored on held-out seeds beside a random floor.
- **Built** The learning loop in the app: demonstrate, consent, train, evaluate, the robot demonstrates back (5 of 5 steps live).
- **Built** A safety governor between software agents and simulated robots: e-stop first, 9 refusal reasons, a hash-chained audit log.
- **Built** Consent, dataset cards and lineage: a revoke marks dependent policies stale.
- **Built** Labelled synthetic datasets with a dataset card, the cloned policy's parameters and an eval card for each of the 6 gym scenarios, in the LeRobot and RLDS layouts, licence CC0-1.0.

### Planned, not built

- *Planned* A measured study with real, opted-in adults. The app can train on a learner's own takes, but every demonstration measured so far is synthetic or a labelled scripted stand-in.
- *Planned* A headset session on hardware for the teleoperation pad. The loop is proven with a stubbed session.
- *Planned* A bench pilot: one task scored the same way in the Holodeck and on a physical robot, with the gap published. No hardware run has happened.
- *Planned* Virtuals Protocol (its Agent Commerce Protocol and GAME framework) as a technology the project plans to use for on-chain agents; nothing from it is installed, bundled or called, and no partnership is stated.

 **The ask** [To be set by the founders.] Nothing on this page states a price, a valuation, a raise or a return.
 **Pilot contact** [To be set by the founders.]

 [Read the roadmap](Roadmap-and-Changelog.md)[Check every number](Evidence.md)[Ask the hard questions](Risks-and-FAQ.md#investor-faq)

The evidence table, the roadmap and the changelog follow on the next pages. Standards are named, never quoted; nothing here claims compliance.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `be2f2b68`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
