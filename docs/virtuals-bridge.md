# Agent bridge: software agents dispatch jobs to the Holodeck's simulated robots, through a safety governor

Console VBRIDGE (`docs/consoles/VBRIDGE.md`). SmartCiti.X Holodeck · Powered by AGI Corp.

SmartCiti.X plans to use the Holodeck to bridge on-chain software agents that manage robots. That is SmartCiti.X's own
product plan. This page describes the seam built for it in this repository: a job model shaped like Virtuals Protocol's
Agent Commerce Protocol (ACP), a GAME-style function export, and a safety governor that every agent command passes.

**Not a partnership.** Virtuals Protocol, its SDKs and anyone in its ecosystem have no partnership, affiliation or
endorsement relationship with SmartCiti.X or AGI Corp, and nothing here says otherwise. The concepts were read from
their open-source SDKs and re-modelled in our own small code. Nothing from those SDKs is installed, bundled or called.

**No crypto in this build.** No private key, seed phrase, session-entity key or wallet address ships anywhere: not in the
repo, the bundle or the browser. There is no signing in the client, no RPC, no chain and no contract interaction. The
build holds no $VIRTUAL and makes no payments. ACP's TRANSACTION phase is used here as the work phase only: no funds,
fees or escrow exist. Crew Credits (the play currency) never touch any of this.

**The robot rule.** An agent-originated command can only reach a simulated robot in this build. Commanding a physical
robot would need a named human approver, and that path ships disabled (`VB_PHYSICAL.enabled === false`, frozen).

## The pieces

| File | What it is |
|---|---|
| `WebXR/shared/vb-governor.js` | The safety governor: nine enumerated refusal reasons, the run monitor, a hash-chained decision log, ENTERPRISE-3 hooks (guarded) |
| `WebXR/shared/vb-bridge.js` | The job model: phases, roles, memos, deliverables (RLDS/LeRobot-style episode plus eval card), deterministic under a seed |
| `WebXR/shared/vb-providers.js` | Where jobs come from, off by default: `mock` and the `acp-proxy` descriptor; the GAME function export and executor |
| `exports/shared/vb-game-functions.json` | Every allowlisted robot action as a GAME-style function (written by `node tools/vb_export_game.mjs`) |
| `WebXR/smartcity/js/sims/vb-supervising-agent-dispatched-robots.js` | The station "Supervising Robots Dispatched by Software Agents" |
| `tools/check_vbridge.mjs` | The checker and the adversarial eval |

## Architecture

```
 external software agent (CLIENT)                SmartCiti.X robot-site agent (PROVIDER)           EVALUATOR
 mocked here; in a deployment it                 runs a policy on the SIMULATED robot:             rb-env's safe-practice
 talks to the deployment's server                scripted expert or a COLEARN BC policy            scoring + the supervisor
            │                                                    │
            ▼                                                    ▼
  vb-providers.js ──(off by default)──▶ vb-bridge.js job ──▶ vb-governor.js check ──▶ human supervisor approves (named)
  mock | acp-proxy descriptor            REQUEST → NEGOTIATION → TRANSACTION → EVALUATION → COMPLETED/REJECTED/EXPIRED
  (deployment's own https server                                 │  every step: governor.monitor (e-stop wins,
   holds the ACP SDK and its keys)                               │  separation, deviation → protective stop)
                                                                 ▼
                                    rb-env.js (ROBOTICS' gym) on the simulated robot ──▶ deliverable: episode + eval card
                                                                 │
                     every decision ──▶ governor's own chain + ENTERPRISE-3 ent3AuditAppend (hash-chained audit log)
```

## Mapping tables

### Job phases (one to one)

The SDK's enum is `AcpJobPhases` in `acp-node/src/contractClients/baseAcpContractClient.ts` (`ACPJobPhase` in
`acp-python/virtuals_acp/models.py`).

| ACP phase (number) | Here | Who moves it | What happens |
|---|---|---|---|
| REQUEST (0) | `vbCreateJob` | client | The client agent's ask: task type, site, speed, nearest person, policy, target (always `sim`) |
| NEGOTIATION (1) | `vbNegotiate` | provider | The governor checks the command. If it passes, the provider states its terms: sim only, supervisor approval, e-stop wins, everything logged |
| TRANSACTION (2) | `vbApprove` | provider, on a named supervisor's approval | The work phase. No payment, fee or escrow exists in this build |
| EVALUATION (3) | `vbRun` | provider | The policy runs on the sim, monitored every step; the deliverable is attached |
| COMPLETED (4) | `vbEvaluate` | evaluator | The run finished with every safe practice kept and no stop |
| REJECTED (5) | `vbNegotiate` / `vbApprove` / `vbEvaluate` | provider or evaluator | A governor refusal, a supervisor refusal, an e-stop, a deviation, or a failed run |
| EXPIRED (6) | `vbExpire` | provider | No progress for `VB_DEADLINE_TICKS` (50) logical ticks |

### Roles, memos, deliverables

| ACP concept (SDK source) | Here |
|---|---|
| Client, provider and evaluator addresses on a job (`acpClient.ts` `initiateJob`, `evaluatorAddress`) | `job.client` (agent id), `job.provider` (the site agent), `job.evaluator` (scenario scoring). Plain ids, never addresses |
| Memos (`acpMemo.ts`, `MemoType` in `baseAcpContractClient.ts`) | `job.memos[]`, one per phase change, `type` from the non-payment subset MESSAGE / OBJECT / NOTIFICATION |
| Deliverable (`acpJob.ts` `deliver`, `getDeliverable`; `DeliverablePayload` in `interfaces.ts`) | `job.deliverable = { episode, evalCard, hash }`: an RLDS/LeRobot-style episode (`steps[]` with `observation`, `action`, `reward`, `is_first`, `is_last`, `is_terminal`, `episode_metadata`) and an eval card |
| Payable memos, fees, escrow (`PAYABLE_*`, `FeeType`) | Not modelled. Nothing here moves money |

### GAME's agent → worker → function

From `game-node/src/function.ts`, `worker.ts` and `agent.ts`:

| GAME concept | Here |
|---|---|
| `GameFunction` { name, description, args[{ name, description, type, optional }], hint } and `toJSON()` → `fn_name`, `fn_description`, `args`, `hint` | Each action of each allowlisted gym scenario, e.g. `teleop_pick_place__move(dx, dy, dz)` and `cell_entry__lockout()` |
| `ExecutableGameFunctionResponse` { status: done / failed, feedback } → `action_status`, `feedback_message` | `vbGameExecute(fnName, args, session)` returns the same shape; a governor refusal or a stop returns `failed` with the reason |
| `GameWorker` { id, name, description, functions, getEnvironment } | One worker per scenario, listing the sites whose rig does it |
| `GameAgent` (goal, workers) | Not modelled: the agent lives on the deployment's side |

`exports/shared/vb-game-functions.json` holds 4 workers and 24 functions. A GAME worker on a deployment's server could
call the sim through these descriptors. The executor checks every call with the governor, so the e-stop and the limits
apply to GAME calls exactly as to jobs.

## The safety governor (the product's core claim)

`vbGovernor({ ent3, limits, estops, at })` returns `check(command)`, `monitor(sample)`, `setEstop`, `log` and `verify`.
Refusal reasons, in precedence order (all of them are collected; the first one is `primary`):

| Reason | Fires when |
|---|---|
| `estop-held` | The site's e-stop is held. The e-stop always wins, over every other answer |
| `physical-target` | The target is not exactly `sim`, even with an approver named: the physical path is disabled |
| `malformed` | A field is missing (job, client, task, site, robot, speed, separation, policy) or a number is invalid |
| `unknown-site` | No robot site with that id exists in `RB_SITES` |
| `task-not-allowed` | The task is not on `VB_TASKS`, or the site's rig does not do it |
| `unregistered-policy` | The policy is in neither ENTERPRISE-3's registry nor the provider's own table |
| `stale-policy` | ENTERPRISE-3 marks the policy stale (trained on, or built from, revoked data), or the fleet row shows its deployment stale |
| `over-speed` | Speed above the rig's limit, or above the reduced speed (`RB_SSM.reducedSpeed`) with a person inside the warning distance |
| `inside-separation` | The nearest person is closer than the rig's minimum separation (`RB_SSM.stop`) |

During a run, `monitor` returns `estop` (held e-stop or the supervisor's press), `protective-stop` (person inside the
separation distance, or a deviation: any safe-practice rule the step broke), `slow`, or `continue`. Every allow,
refusal, stop and e-stop press or reset is written to the governor's own FNV-1a hash chain. When ENTERPRISE-3's
registry is handed in, it also goes to `ent3AuditAppend`. ENTERPRISE-3's log is append-only and hash-chained, and
`ent3VerifyAudit` re-walks it. The chain gives tamper evidence on one device, not cryptographic proof. The rig limits
are procedural simulation parameters, not ratings of any machine.

**Guarded.** `vb-governor.js` imports no ENTERPRISE-3 code. With no registry it keeps its own chain and uses the
provider's own policy table. If the registry's functions throw, the governor still decides; the checker proves both.

## The trust model

| Party | Trusted for | Not trusted for |
|---|---|---|
| Client agent | Saying what it wants | Anything that moves a robot. Every field is checked, and its target is forced to `sim` |
| Provider (site agent) and its policy | Running the sim within the governor's limits | Self-certifying: its policy must be registered and current, and its run is monitored every step |
| Governor | Refusing by rule, logging every decision | Judgement: it cannot see a hazard no rule names. That is why a person supervises |
| Human supervisor | Approval under their own name, the e-stop, the filed evaluation | Nothing is approved without a named supervisor (`vbApprove` throws) |
| Deployment's server (`acp-proxy`) | Holding the ACP SDK, the agent's wallet and keys, server-side | The browser never receives a key, an address, a signature request or a physical target |

Provider configs follow the billing-adapter pattern (`docs/billing-adapters.md`). `vbProviderConfig(authConfig)` returns
`null` for the public build, because `WebXR/auth-config.json` has no `agents` block. An `agents` block is refused whole
when any of these hold:
- a field is named like a key, secret, seed, mnemonic, wallet, private, signer or session entity;
- a value looks like a key, a 20- or 32-byte hex string, or a 12–24-word phrase;
- anything names a price, amount, fee, budget, payment or token, because no money goes through the bridge;
- the endpoint is not https, carries credentials or a query, or is an agent-network, RPC or chain host;
- the provider is unknown.

## What is NOT built

- No physical robot path. It needs a named human approver and ships disabled; there is no setter.
- No ACP or GAME SDK, no wallet, no key handling, no signing, no RPC and no chain or contract interaction anywhere in the
  client. The deployment's proxy server that would hold them is described here, not built.
- No payments, fees, escrow, token or pricing of any kind. TRANSACTION is the work phase only.
- No live agent network call was made to build this. The client agent is a deterministic mock.
- No language model is called. The provider's policies are the scripted expert and COLEARN's k-nearest-neighbour
  behaviour cloning.
- The governor is a rule set. It cannot detect a hazard no rule names, and its limits are procedural.

## Eval

`node tools/check_vbridge.mjs` runs 200 seeded adversarial jobs in six categories: unsafe speed, inside the separation
zone, a task not on the allowlist, a stale policy, the e-stop held, and a physical target. Many sit just past a
boundary. It also runs 200 seeded safe jobs, many sitting exactly on a limit. Before this work there was no governor:
every job would have reached the robot (0/200 blocked). After: see `docs/consoles/VBRIDGE.md` for the figures the
checker prints.

## Credits and licences

- `Virtual-Protocol/acp-node`: ISC licence (per its `package.json`). Concepts read: `AcpJobPhases`, `MemoType`,
  `AcpMemoStatus`, job, memo and deliverable shapes. The package marks itself deprecated in favour of `acp-node-v2`.
- `Virtual-Protocol/acp-python`: the same concepts (`ACPJobPhase`, `MemoType`). The vendored clone carries no licence
  file, so it was read for concepts only and nothing was copied.
- `game-by-virtuals/game-node` and `game-python`: MIT licence ("Copyright (c) 2025, Virtuals Protocol"). Concepts read:
  `GameFunction`, `ExecutableGameFunctionResponse`, `GameWorker`, `GameAgent`.
- All four were read as read-only clones. None is installed, bundled or vendored into this repository.
- The Virtuals whitepaper (https://whitepaper.virtuals.io) is blocked by this environment's egress policy, so it was not
  read directly here. Every ACP and GAME point on this page comes from the SDK source files named above.
