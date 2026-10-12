# SmartCiti.X loop brief: adopt the Holodeck's bus adapter (prefix `scx-bus`, about 75 minutes)

**Repository.** `agifuturefoundation/smartciti.x`, base **398f287** (fast-forward and confirm). Every rule in `ecosystem-loop-rules.md`, next to this file, holds.

**Why.** vr-safety-training emits its learner, governor, hive and arena events in your documented shapes through `WebXR/shared/eco-bus.js`. Its `tools/check_eco.mjs` pushes them through your real `Bus` (strict), `envelope()`, `extractSignals()` and `AuditLog`. All 2,189 of 2,189 events pass (11 telemetry messages, 2,178 audit entries). Only learner telemetry has a topic, though. Governor decisions, hive events and arena results land on the audit log, because `TOPIC_OWNERS` has no topic for robots or software agents. This brief makes that a contract on your side, written in your own code. Nothing is copied from the other repository.

**Read first.** `bus/README.md`, `bus/bus.mjs`, `bus/telemetry.mjs`, `bus/audit.mjs`, `bus/safeguards.mjs`, `bus/session.mjs` and `bus/test.mjs`. Then read the adapter's documentation in vr-safety-training: `docs/ecosystem.md` sections 3–4 and the mapping table there.

## Items, in order

1. **Three proposed topics, each with one writer.**
   - Add `robot.governor_decision` (owner `governor`), `agent.hive_event` (owner `software_agent`) and `arena.result` (owner `arena`) to `TOPIC_OWNERS`.
   - Give each payload shape its own test in `bus/test.mjs`:
     - A governor decision carries `{ decision: "allow-sim" | "refuse", reasons[], site, task, agent }` and **never a physical target**. A payload that has one is a `ContractViolation`.
     - A hive event's `actor` is a "software agent" id, and it carries no learner.
     - An arena result carries `{ model, scenario, k, n, lo, hi, physical: 0 }`.
   - **Check:** `node bus/test.mjs` passes, and the new count is typed into `README.md`'s suite table. Otherwise `verify_all.sh` reports DRIFT.
2. **Single-writer refusals for the new topics.**
   - A `mentor` or `client` that tries to publish `robot.governor_decision` is refused and lands on the audit log, as `dial.setpoint` is refused today.
   - **Check:** one test per topic and per wrong role.
3. **Privacy guards hold on the new topics.**
   - None of the new topics carries `learner_id`, affect or free text.
   - `toXapi()` is unchanged, so robot events never become xAPI statements about a person.
   - **Check:** a test that plants each forbidden field and sees the refusal.
4. **A fixture of the adapter's output.**
   - The fixture is either a JSONL export of one seeded run, which only vr-safety-training's owner can provide (`node tools/check_eco.mjs` produces the events there), or one you write from the documented shapes in its `docs/ecosystem.md`. Do not copy its code.
   - **Check:** `bus/test.mjs` replays the fixture. Every line is accepted on its topic, and every duplicate is deduped.
5. **Docs.** Add a "Holodeck seam" section to `bus/README.md` that cites vr-safety-training's file and commit and marks Router.X absent ("not yet built").
   - **Check:** `node brand/lint.mjs .` passes, and `./verify_all.sh` passes as a whole.

## Evals (before → after, with sources)

- Topics with a single writer: 10 → 13 (`bus/bus.mjs`).
- Holodeck fixture events accepted on a topic: 11 of 2,189 → 2,189 of 2,189 (`bus/test.mjs`).
- Wrong-role refusals on the new topics: 0 → 3 of 3.
- Forbidden fields refused: N of N.
- `./verify_all.sh` passes, with the total count updated.
- Network calls added: 0.
- Physical dispatches: 0.
