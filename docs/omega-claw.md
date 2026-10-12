# Omega Claw: the software agents that run robot training and model testing

SmartCiti.X Holodeck · Powered by AGI Corp. Console notes: `docs/consoles/OMEGA-CLAW.md`.

## What it is

The Omega Claw is five **software agents**. Each has an invented name and a role, and the UI labels each one "software agent":

| Agent | Role |
|---|---|
| Tevi | Test planner. Declares every comparison before it runs: scenario, models, incumbent, challengers, metric, interval and held-out seeds. The declaration's hash goes into the chain. |
| Okko | Trainer. Schedules the declared learners' training rounds on their own training data and records each model's provenance. |
| Ressa | Evaluator. Runs ROBO-ARENA's simulated robots once on the declared held-out seeds. Also reports the learner's own drill results beside the robots' (local only). |
| Hald | Auditor. Checks leakage (a model's training seeds against the held-out set), seed reuse and the hash chain. |
| Varn | Promoter. Promotes a challenger only if all of these hold: it beats the incumbent on the declared metric; the Wilson 95% intervals are clear of each other; its run broke no safe-practice rule; the governor checked every step; nothing went physical. |

Every decision is a line in the claw's own hash chain. Each line is FNV-1a over seq, time, action, detail and the previous line's hash, as in the hive's audit. When the claw is given ENTERPRISE-3's audit log, every line is also handed to it.

**Robots at work** is the persistent world on the parishes page. The six robot sites keep running the Omega Hive's jobs, each with the model the claw promoted for that task:
- one simulated minute a second while the tab is visible;
- paused while the tab is hidden;
- on the next visit it replays the minutes since the last one, capped at one simulated day.

## What it is not

- **Not a language model.** No agent calls any model or any network service. Every line is built on the device from the agent's persona and the decision's own data. No key exists anywhere in the claw.
- **Not real robots.** Every robot is simulated. The arena has no physical path, and the persistent world never approves anything: a job that names a physical robot waits for a supervisor, and VBRIDGE's governor refuses the physical path. Physical dispatches: 0.
- **Not remote.** The world's snapshot is two numbers (seed and simulated minutes) in this browser's local storage. Nothing is uploaded.
- **Not a judge of people.** A learner's own drill and tutor results appear only on their own device. They appear only when DATAWORKS' gate allows: an opted-in adult, never K-12, demo or signed out. Only counts enter the chain, never a learner's value. The instructor console's tab shows no learner data.

## Measured this round

The protocol (`OC_PROTOCOL` in `WebXR/shared/oc-claw.js`) was committed before the run. It declares 45 comparisons: 9 gym scenarios × 5 challengers (DAgger 1 and 3 rounds, the per-step-reward clone, the small language-conditioned model, and the random policy as a negative control), each against the behaviour clone. `tools/claw_eval.mjs` ran them once on held-out seeds 7121–7180. The record is in `docs/evals/claw.json`.

- **Promotions: 0.** DAgger (3 rounds) on AMR routing scored 55/60 (0.819–0.964) against the clone's 42/60 (0.575–0.801). The intervals are clear, but its run broke 5 rules, so it was refused. Elsewhere no challenger beat the clone, which is at 60/60 on four scenarios.
- The small model was the contract stub in this branch, so it was not applicable. Its comparison needs fresh seeds after integration (see `tools/briefs/next/oc-next.md`).
- **Refusals exercised: 3 of 3.** An undeclared comparison, a re-test on held-out seeds already spent, and rule breaks. None of the three ran anything.
- **Governor:** 133,061 of 133,061 arena steps checked; 0 physical.
