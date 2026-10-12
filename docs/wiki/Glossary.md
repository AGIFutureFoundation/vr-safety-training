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

- **Preference pair** A learner's thumbs up on one agent run and thumbs down on another run of the same station, each with one reason from a fixed list. The pairs are recorded and matched up, and they train a reward model (a Bradley–Terry model; so far on synthetic pairs from a synthetic rater). Used to filter demonstrations before cloning, it did not beat the rule filter.

Source: `docs/consoles/AGENTGYM.md`

Definitions follow how the repository uses each term, not an outside textbook.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `bd748fca`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
