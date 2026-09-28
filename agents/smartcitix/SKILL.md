---
name: smartcitix
metadata:
  status: draft, in preparation
  agent: agents/smartcitix/agent.json
  acpCliSource: AGIFutureFoundation/acp-cli at commit 9aa61ae
description: "Use the SmartCiti.X tools to evaluate a robot or agent policy on a SmartCiti.X Holodeck station in simulation, export a synthetic robot-skill dataset slice (native, LeRobot-style, RLDS-style) with its licence and consent fields, answer curriculum and skill-registry queries, and compose a lesson from real stations. Every tool runs locally through tools/smartcitix_provider.mjs, with no network. Use it when handling a SmartCiti.X provider job's requirement or when someone asks what the Holodeck's stations teach. Never use it to read or send a learner's records."
---

# SmartCiti.X

SmartCiti.X is the SmartCiti.X Holodeck's provider agent. This skill tells a skill-loading agent runtime how to use its four tools. It follows the convention of acp-cli's own `SKILL.md` (front matter with `name`, `description` and `metadata`, then recipes). Everything about the Virtuals platform beyond acp-cli's files is **to verify against the official docs**; see `docs/virtuals/strategy.md`.

> **OPERATING RULES.**
> 1. **Local only.** Every tool is `node tools/smartcitix_provider.mjs …` in this repository. It makes no network call and signs nothing.
> 2. **No personal data.** A requirement or deliverable never carries names, crew tags, training records, episodes of a real learner or passport contents. If a requirement asks for one, refuse and say why.
> 3. **Not a certification.** Every evaluation and lesson is evidence of a procedure under this engine's scoring, in simulation. Keep the `notice` field in every deliverable.
> 4. **The owner runs the marketplace.** Creating the agent, publishing offerings, adding a signer, setting a budget, submitting on-chain and any tokenization are the owner's steps in `agents/smartcitix/runbook.md`. This skill never runs an `acp` command itself; when acp-cli is installed and the owner has set it up, its own guidance comes from `acp skill print`.

## Tools

| Tool | Offering | Requirement (JSON) | Deliverable |
| --- | --- | --- | --- |
| `evaluate_station` | `station-evaluation` | `{"stationId","app","skill"?,"seed"?}` | the station's task graph and the engine's summary |
| `export_skill_dataset` | `robot-skill-dataset` | `{"app","stations"?,"seeds"?,"skills"?}` | the manifest, the layouts written, the licence text |
| `curriculum_query` | `curriculum-query` | `{"programmeId"?}` or `{"stationId","app"?}` | the programme's stations, or one station's graph |
| `compose_lesson` | `lesson-service` | `{"prompt","max"?}` | a lesson over real stations with a pass bar |

The exact JSON schemas are the `requirements` fields of `agents/smartcitix/offerings/*.json`; the stub validates against them and rejects any field outside the schema.

## Recipes

### Handle a job requirement

acp-cli's `SKILL.md` describes the provider loop: a job's requirement arrives as the first message with `contentType: "requirement"`, and `entry.content` is a JSON string. Hand the whole event to the stub:

```bash
node tools/smartcitix_provider.mjs --job event.json          # prints {"jobId","offering","deliverable",...}
```

The stub picks the handler from the event's `offering` name, validates the requirement, runs it and prints the deliverable. It does not submit anything; the owner's provider loop does that, as the runbook describes.

### Run one tool directly

```bash
node tools/smartcitix_provider.mjs --offering station-evaluation --requirement '{"stationId":"electrical","app":"trades","skill":1,"seed":1}'
node tools/smartcitix_provider.mjs --offering curriculum-query --requirement '{"programmeId":"electrical-first-period"}'
node tools/smartcitix_provider.mjs --offering lesson-service --requirement '{"prompt":"lockout refresher for apprentices"}'
node tools/smartcitix_provider.mjs --offering robot-skill-dataset --requirement '{"app":"trades","stations":2,"seeds":1}'
```

### Dry runs

```bash
node tools/smartcitix_provider.mjs --dry-run      # three jobs: evaluation, dataset slice, curriculum query
```

## When to refuse

- The requirement names a learner, a crew tag, a record or a passport — refuse; that data stays on the learner's device.
- The requirement asks for a real robot to be driven — refuse; SmartCiti.X runs stations in simulation only, and a `noRobot` step is a person's job.
- The requirement asks for a price, a token figure or advice about $Citi — refuse; $Citi is a name the owner chose, and nothing about its economics is stated here.
