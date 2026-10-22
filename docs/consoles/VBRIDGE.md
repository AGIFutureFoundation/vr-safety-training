# VBRIDGE (`vb`, port 9041): software agents dispatch jobs to simulated robots, through a safety governor

Loop 5. Base c472f079. SmartCiti.X Holodeck · Powered by AGI Corp. Architecture, mapping tables, the trust model and what
is not built: `docs/virtuals-bridge.md`.

The concepts come from Virtuals Protocol's open-source SDKs: the ACP job phases, the client, provider and evaluator
roles, memos and deliverables, and GAME's agent → worker → function shape. They were re-modelled here in our own small
code. None of those SDKs is installed or bundled. This work is not a partnership, and nothing in it says Virtuals
endorses or is affiliated with SmartCiti.X or AGI Corp. No key, wallet, signing, RPC, chain call, token, price or
payment exists anywhere in this work. Agent commands reach simulated robots only; the physical path ships disabled.

## What is here

- `WebXR/shared/vb-shared-data.js`: plain data with no imports. It holds phases, roles, memo types, governor rules,
  tasks, rig limits and `VB_PHYSICAL`, plus `VB_SHARED`, the whole set as one object.
- `WebXR/shared/vb-governor.js`: `vbGovernor({ ent3, limits, estops, at })` with `check`, `monitor`, `setEstop`, `log`
  and `verify`.
  - Nine enumerated refusal reasons, in precedence order, with the e-stop first.
  - Every decision goes to its own FNV hash chain, and to ENTERPRISE-3's audit log through `ent3AuditAppend` (guarded).
- `WebXR/shared/vb-bridge.js`: the job model.
  - `vbCreateJob`, `vbNegotiate`, `vbApprove` (a named supervisor), `vbRun`, `vbEvaluate`, `vbExpire` and `vbRunJob`.
  - The deliverable is an RLDS/LeRobot-style episode plus an eval card, deterministic under a seed.
- `WebXR/shared/vb-providers.js`: off by default (`vbProviderConfig(authConfig)` returns null).
  - `mock`, and the `acp-proxy` descriptor through a handed-in transport to the deployment's own https server.
  - `vbGameFunctions()` / `vbGameExecute()`. `tools/vb_export_game.mjs` writes `exports/shared/vb-game-functions.json`
    (4 workers, 24 functions).
- `WebXR/shared/vb-panel.js`: `vbMountDispatch(el, { reducedMotion, ent3, stationHref })`, the "Agent jobs (simulated
  robots)" panel in the parishes app's drills menu.
- `WebXR/smartcity/js/sims/vb-supervising-agent-dispatched-robots.js`: the station "Supervising Robots Dispatched by
  Software Agents".
  - 13 steps over 7 kinds, 4 hazards, 2 interruptions (an unsafe deviation answered with the run e-stop; a faster
    re-send answered with refuse) and a `?fault=stale-policy` variant.
  - Registered with `tools/add_station.mjs`, in the robotics programme's AI-training level (`RP_AI`) on every track,
    and in `RP_ROBOT_STATIONS`.
- `tools/check_vbridge.mjs`: 14 checks plus the eval. Added to `check_all.mjs`'s list and `docs/perf/checkers-baseline.json`.

## Eval (before → after)

| Measure | Before (c472f079) | After |
|---|---|---|
| check_vbridge | 2 passed, 11 failed (only the two vacuous scans passed: no vb-* modules) | 14 passed, 0 failed |
| 200 seeded adversarial agent jobs blocked by the governor | 0/200 (no governor: every job would reach the robot) | **200/200**, 200/200 for the intended reason |
| per category | n/a | over-speed 34/34, inside-separation 34/34, task-not-allowed 33/33, stale-policy 33/33, estop-held 33/33, physical-target 33/33 |
| false blocks on 200 seeded safe jobs (15% sit exactly on a limit) | n/a | **0/200** |
| safe jobs run end to end in the sim (every 4th) | n/a | 50/50 COMPLETED |
| governor rejection reasons that fire alone, as primary | n/a | 9/9 |
| bad provider configs refused | n/a | 12/12 |
| station eval_content | n/a | 98 (variety, decisions, explanation, grounding, standards, feedback and scene 100; originality 48: 24% shared with rp-robot-policy-evaluation-review) |

Read honestly: the governor is a rule set, so 100% on categories it has rules for is the expected result, not a
discovery. The eval proves the boundaries are exact: many adversarial jobs sit 0.001 past a limit, and 15% of safe
jobs sit exactly on one. It cannot show anything about hazards no rule names. That is what the supervising person and
the station are for.

## Cycles

1. Reason: the governor and the job model are only real if a scripted expert completes every task through them and a lapsing policy is stopped; check = a smoke run over the four tasks × two policies plus an e-stop. Act: vb-governor.js, vb-bridge.js. Observe: the expert went COMPLETED on all four. The lapsing policy was REJECTED at negotiation as `unregistered-policy`, because it was missing from the provider's table. Fixed: lapsing jobs now halt on deviations (enter-live-cell, yield-missed, keep-out) and are REJECTED, and cobot-zone completes clean. Committed a2f9f3e3.
2. Reason: prove every claim in one checker, with before and after from the same script; check = check_vbridge. Act: providers (mock, acp-proxy, GAME export), the checker and the eval. Observe: 11/13. The wording scan flagged the money guard's own regex literal (fixed by skipping regex-literal lines); the station was missing. Then 12/13; eval 200/200 blocked, 0/200 false blocks. Before (the checker run on an archive of c472f079): 2/13. Committed 8314e205.
3. Reason: the station must teach the governor and score 95+; check = eval_content plus check_smartcity. Act: the station, add_station, RP_AI. Observe: eval_content 93. Standards were 5/8: NIST AI RMF, ISO/IEC 42001 and ISO/TS 15066 are not in tools/standards.json. Originality was 26%. Rewrote the certification, support line and one hazard: 98 (standards 6/6, originality 24%). check_smartcity "All 728 simulators pass"; check_robotics_programme ok, ai-training coverage 6/6. Committed 2e9988b0.
4. Reason: the station must play end to end in the real build; check = the drive_one copy on 9041 plus a spawn screenshot. Act: bundle smartcity, drive, shoot (dist outputs reverted afterwards). Observe: 15 steps finished, both interruptions fired and were answered, score 3735, 0 hazards, 0 page errors; the screenshot shows the dispatch wall, the bench and the governor posts.
5. Reason: a seam in the parishes app and ENTERPRISE-3's audit in the real page; check = the built parishes page headless. Act: vb-panel.js, the app mount, the bundle list (ent3-governance and vb-* after col-learn). Observe: the first runs timed out (wrong page path, then CDN three.js not routed; fixed with the shared page helper). Then: all six queue jobs gave the expected outcome (e-stop halt, over-speed, deviation stop, physical, task-not-allowed, completed), audit chain intact (8 lines), 0 page errors, no new external request.
6. Reason: TQ-ROBOTICS asked for one plain-data object; check = a new checker line (12b). Act: vb-shared-data.js (no imports) holds every constant once, and the governor and bridge import from it; VB_SHARED. Observe: check_vbridge 14/0 ("VB_SHARED: 7 phases, 9 rules, 3579 bytes", no key-shaped string, rig limits equal to RB_SSM). Parishes bundle 180 modules; panel smoke unchanged. check_enterprise3 13/0; check_imports "All 1094 modules call only what they declare or import". Committed 5ed31cf0.

## Checkers (single runs)

- `node tools/check_vbridge.mjs`: 14 passed, 0 failed (0.4 s), then the EVAL line.
- `node tools/check_enterprise3.mjs`: 13 passed, 0 failed (one export added: `ent3AuditAppend`).
- `node tools/check_smartcity.mjs`: All 728 simulators pass.
- `node tools/check_robotics_programme.mjs`: ok, 692 checks, coverage 30/30, ai-training 6/6.
- `node tools/check_imports.mjs`: All 1094 modules call only what they declare or import.
- `node tools/check_virtuals.mjs` (the earlier VIRTUALS package, untouched): All 11 SmartCiti.X checks pass.

## Seams

- **TQ-ROBOTICS / TradeQuest:** `VB_SHARED` from `WebXR/shared/vb-shared-data.js`. It is plain, dependency-free and
  JSON round-trips: `{ schema, phases[{ id, n, terminal }], terminal, moves, roles, memoTypes, deadlineTicks, policies,
  governor: { rules[{ id, text }], order, tasks, rigLimits, physical, note } }`. The named exports (`VB_REASONS`,
  `VB_PHASES`, `VB_ROLES`, `VB_TASKS`, `VB_RIG_LIMITS`, `VB_PHYSICAL`) live in the same file, not in vb-governor.js.
- **ENTERPRISE-3:** `vbGovernor({ ent3: { auditAppend: ent3AuditAppend, policies: ent3Policies, fleet: ent3Fleet } })`.
  Every hook is optional and try-guarded. `ent3AuditAppend(action, detail, { at })` is new in ent3-governance.js.
- **COLEARN:** `vbRun(job, gov, { policyFor: (policyId, env, seed) => colPolicy(model) })` runs a behaviour-cloning
  policy as the provider. The governor needs the policy registered: in ENTERPRISE-3, or as `vb-colearn-bc-knn`.
- **Parishes app:** `vbMountDispatch($("menu-drills"), …)` after COLEARN's panel; `window.__parishTest.vbridge`.
  Bundle list: `ent3-governance.js`, `vb-shared-data.js`, `vb-governor.js`, `vb-bridge.js` and `vb-panel.js`, after
  `col-learn.js`.
- **PITCHREEL-2:** the station `smartcity/index.html?sim=vb-supervising-agent-dispatched-robots`; the panel through
  `window.__parishTest.vbridge.next()/approve()/step()/estop()`.
- **Deployment:** an `agents` block in auth-config (none ships) → `vbProvider(config, { transport })`. The proxy
  server that would hold the ACP SDK and keys is described in docs/virtuals-bridge.md, not built.

## Left

- A K-12 version of the station ("how a robot knows who is allowed to tell it what") was not built.
- The generated dist bundles were reverted after the local drives. The coordinator's full `bundle_webxr.py` carries the
  station into `WebXR/smartcity/dist/` and the panel into `WebXR/parishes/dist/`.
- `guide-kb.js` was not regenerated for docs/virtuals-bridge.md.
- The governor is rules only. A learned anomaly check on the run, and a per-agent rate limit, are the next safeguards.
- The panel runs the scripted policies. Wiring a COLEARN policy through `policyFor` in the panel is a small follow-up.
- eval_worlds was not run (this work adds no world subjects; the panel sits in an existing menu).
