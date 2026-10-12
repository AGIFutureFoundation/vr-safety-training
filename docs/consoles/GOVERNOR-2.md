# GOVERNOR-2 (`gv2`, port 9082): the governor's next two rules and the registry round trip

Loop 9. Base 8a16ec16 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This closes two roadmap items:
"a learned anomaly check and a per-agent rate limit beside the governor's rules" and "registry export and import
between devices". Robots are simulated. The governor's existing rules are unchanged. The e-stop comes first, the
physical path stays disabled, and no keys or chain calls exist.

## What is here

- **The per-agent rate limit** (`WebXR/shared/vb-governor.js`, data in `vb-shared-data.js`).
  - It keeps a sliding window per agent id (the command's `clientId`). The default is 20 requests a minute, stated in
    `VB_RATE_LIMIT`. A governor can set its own limit with `vbGovernor({ rate: { perMinute } })`.
  - Every new job request counts, refused ones included. A repeat check of a job id that was already admitted is a step
    of that job, so a GAME session's function calls count as one request.
  - The clock is the command's `atMs`, else a `now()` handed in, else a logical clock that counts one second per
    decision (deterministic, like the audit line clock).
  - A refusal gives the reason `rate-limited`, says the count in its text and in the audit line, and is written to both
    hash chains (the governor's own chain and ENTERPRISE-3's audit log).
- **The learned anomaly check beside the rules** (also in `vb-governor.js`).
  - `vbAnomalyHistory()` builds a seeded, procedural history of 480 accepted jobs. Every row is rule-legal, and the
    ranges are in `VB_ANOMALY.history`.
  - `vbAnomalyModel()` fits a mean and standard deviation per task and per feature. There are four features: payload
    (kg), speed as a share of the limit that applies, distance to the nearest person, and seconds since the agent's
    last request (on a log scale).
  - `vbAnomalyScore()` gives a one-sided z-score, counting only the risky direction. Above 4 standard deviations the
    governor refuses with the reason `anomalous`, and the text names the feature, its value, the accepted mean and the
    distance.
  - Both new reasons come after every hard rule in the order. They add a refusal, never give a permission, and never
    outrank the e-stop.
  - A deployment hands in its own accepted-job log with `vbGovernor({ anomaly: { history } })`.
- **Refusal reasons go from 9 to 11** in `VB_REASONS` / `VB_SHARED`.
  - `VB_SHARED.governor` also carries `rateLimit` and `anomaly` (the features, the threshold and a note).
  - `exports/shared/holodeck-shared.json` was refreshed with `node tools/export_shared.mjs`.
  - `tools/vb_export_game.mjs` lists functions, not reasons, so its output did not change.
- **The agent-jobs panel** (`vb-panel.js`) has two new entries in its queue.
  - Entry 9 is a burst: 24 requests a second apart from one mock agent. 20 are checked as usual and 4 are refused as
    rate-limited, with the count.
  - Entry 10 is a rule-legal pick-and-place carrying 25 kg. It is refused as anomalous, and the card names the payload.
  - Queued jobs carry arrival times from the scenario (45 s apart), so clicking through fast does not look like an
    agent sending at machine speed.
  - `vbCreateJob` / `vbCommand` pass `payloadKg` and `atMs` only when they are given, so existing jobs hash as before.
- **Registry export and import between devices** (`WebXR/shared/ent3-governance.js`).
  - `ent3Export()` writes one document (`ENT3_EXPORT_SCHEMA`) with the records, the lineage graph, the whole audit
    chain, its head and a digest of the records sealed with the head.
  - `ent3VerifyExport(doc)` / `ent3Import(doc)` refuse a document and name the reason: `bad-schema`, `chain-broken`,
    `head-mismatch`, `digest-mismatch`, `lineage-mismatch`, `unaudited-record` or `forked`.
  - The merge is a fast-forward keyed by id. The device either adopts the newer lines and records, or finds the file is
    already current. Nothing is duplicated.
  - The import is recorded beside the chain (`ent3Imports()`), not in it, so both devices keep one chain.
  - The Data governance tab of the instructor console (`WebXR/instructor/js/governance.js`) has an **Export registry** /
    **Import registry** button pair: a JSON file the person carries, with nothing sent anywhere.
- **Checkers.** `tools/check_vbridge.mjs` has checks 4 (11 reasons), 13 (rate limit), 14 (anomaly check), 15 (panel)
  and EVAL-2. `tools/check_enterprise3.mjs` has checks 14 (round trip), 15 (tampered and forked documents) and 16
  (button pair).
- **Docs.** `docs/virtuals-bridge.md` (the reason table, "beside the rules, never above them") and `docs/enterprise.md`
  §6 ("Between devices").

## Evals (before → after)

| Measure | Before (8a16ec16) | After | Source |
|---|---|---|---|
| Governor refusal reasons | 9 | **11** (`rate-limited`, `anomalous`) | `WebXR/shared/vb-shared-data.js` `VB_REASONS`; check_vbridge 4 "fired: 11/11" |
| Burst of 40 requests from one agent, a second apart, limit 20/min | 0/20 over-limit refused (no rule) | **20/20** refused as `rate-limited`, the first 20 allowed; a second agent at 20/min untouched; 21 lines in the audit chain | `tools/check_vbridge.mjs` check 13 |
| The same burst at machine speed (one millisecond) | 0 refused | 1 allowed, 19 `anomalous` (repeat cadence), 20 `rate-limited` | check_vbridge EVAL-2 |
| Rule-legal anomaly injections caught | **0/100** (refused by the 9 rules alone, measured on the same requests) | **66/100**: payload 1.5–4 times the accepted maximum 49/50; repeats 5–200 ms after the agent's last request 17/50 | check_vbridge EVAL-2 |
| Safe jobs wrongly refused | 0/200 (rules only) | **0/200** held-out accepted-distribution jobs; **0/200** rule-edge safe jobs (15% sit exactly on a limit) | check_vbridge EVAL-2 |
| The first eval (200 adversarial / 200 safe) | blocked 200/200, false blocks 0/200 | unchanged: 200/200, 0/200, 50/50 completed | check_vbridge EVAL |
| check_vbridge | 14 passed | **18 passed, 0 failed** | `node tools/check_vbridge.mjs` |
| Registry round trip, 200 seeded graphs | 0/200 (no export) | **200/200** identical; a second import adds nothing 200/200; a continued device fast-forwards 200/200 (3,434 records, 4,519 audit lines carried) | `tools/check_enterprise3.mjs` check 14 |
| Tampered documents refused | 0/50 (no import) | **50/50**, each with the expected named reason (audit edit, audit delete, record edit, head, lineage: 10/10 each); store untouched 50/50; forks refused 20/20 | check_enterprise3 check 15 |
| check_enterprise3 | 13 passed | **16 passed, 0 failed** | `node tools/check_enterprise3.mjs` |

Read honestly. The injections are rule-legal by construction, so 0/100 before is what a rule set must do with them, not
a finding. The detector misses most repeats slower than about 40 ms, because they sit inside the accepted spread; for a
sustained stream, the rate limit is the guard. Within the current rig limits, the speed and separation features cannot
fire before a hard rule does. They matter for a site whose own history is narrower than its limits. The history is a
procedural stand-in, not data from any site. The 66/100 figure is pinned in the checker, so a drop fails.

## Cycles

1. Reason: the rate limit and the anomaly check must sit beside the nine rules without moving the first eval. Check: check_vbridge, existing EVAL 200/200 and 0/200. Act: `VB_RATE_LIMIT`, `VB_ANOMALY`, the two reasons, and the window and z-score in `vbGovernor`. Observe: 13 passed, 1 failed; only check 4 failed ("reasons covered" 9 vs 11), and the EVAL was unchanged at 200/200 and 0/200. The logical-clock default kept every existing fixture valid.
2. Reason: prove each new reason, the burst and the "never outranks" claim, then measure the detector. Check: checks 4, 13 and 14, plus EVAL-2. Act: the checker sections. Observe: 16/1. EVAL-2 caught 66/100 against the 70 I had guessed beforehand: payload 49/50, cadence 17/50. Reported as measured and pinned at 66; the detector was not tuned to the test. check_bridge then failed 1 (stale `holodeck-shared.json`); after `export_shared.mjs` it passed 139/139. Committed c352ec5c.
3. Reason: the registry must move between devices and refuse tampering by name. Check: check_enterprise3 14–15. Act: `ent3Export`, `ent3VerifyExport`, `ent3Import` (fast-forward by id). Observe: the round trip failed on trial 0 with `unaudited-record` for a deployment, because `ent3Text` strips `>` and the audit detail "a -> b" is stored as "a - b". After matching on the site id, round trip 200/200, tampered 50/50 with the right reason, forked 20/20. Committed 1046df44.
4. Reason: the button pair on the enterprise page. Check: check_enterprise3 16, plus check_console, check_imports and check_dataworks. Act: Export registry / Import registry in `governance.js`. Observe: 16/0. check_console "All instructor-console checks pass"; check_imports "All 1103 modules call only what they declare or import"; check_dataworks 59/0.
5. Reason: the panel must show both refusals plainly. Check: check_vbridge 15, a fake-DOM mount of `vbMountDispatch`. Act: queue entries 9 (burst) and 10 (heavy). Observe: failed twice. First, my regex expected "20 requests"; the panel correctly said "23", because refused requests count. Second, jobs 6–8 came out `anomalous`, because the click-through ran at machine speed, so the cadence feature fired on mock clients that in the scenario send jobs seconds apart. Fixed at the source: queued jobs carry scenario arrival times, 45 s apart. Then 18/0. Committed 2ff8171c.
6. Reason: observe both surfaces in a real browser. Check: headless Chromium on 9082 (`$SP/loop9/gv2/drive_panel.mjs`, `drive_gov.mjs`). Act: drive the parishes page and two instructor-console contexts. Observe: the output is pasted below. Jobs 1–8 keep their outcomes, job 9 is `rate-limited`, and job 10 is `anomalous` with the payload named. The registry export from device A imports into device B, a second import adds nothing, the tampered file is refused `chain-broken`, and B's re-export is identical. 0 page errors on both pages.
7. Reason: a GAME session checks every function call with one job id, so 60 steps would read as 60 requests. Check: check_vbridge 13 with 60 `vbGameExecute` calls. Act: a repeat check of a job id already admitted inside the window is a step, counted once and with no cadence. Observe: 18/0, EVAL and EVAL-2 unchanged; check_robotrain "ok — 291 checks"; check_bridge 139/139. Committed eee5e135.

### Drive output (headless Chromium, port 9082)

```
job 1: allowed
job 2: over-speed
job 3: allowed
job 4: physical-target
job 5: task-not-allowed
job 6: allowed
job 7: allowed
job 8: allowed
job 9: rate-limited
job 10: anomalous
job 9 card: Burst: 24 requests from client-mock-4 in 24 s — 20 checked as usual, 4 refused as rate-limited. Showing the last one. | Governor: REFUSED (rate-limited) — This agent has sent more requests in the last minute than the governor's per-agent limit allows. Wait, or ask a person to look at why it is sending so many. (client-mock-4: 23 requests in the last 60 s; the limit is 20 per minute.) | Audit: 32 line(s), chain intact
job 10 card: Governor: REFUSED (anomalous) — The request passes every rule but is far outside what this site has accepted before (the explanation names the feature). A person should look at it before it runs. Why: payload (kg) 25.0 is 27.6 sd above the accepted mean 1.56 for rb-teleop-pick-place; the threshold is 4 sd. | Audit: 33 line(s), chain intact
panel chain: 66 lines, intact true; page errors 0; external requests 1 (https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js)
device A: Chain verified: 22 line(s) intact. | export toast: Exported the registry: 22 audit line(s), 15 lineage node(s). | file ent3-registry-2026-10-12-line21.json: 22 lines, 15 nodes, 4 policies
device B import: Imported (adopt): 22 audit line(s), 3 consent(s), 2 dataset(s), 4 policy(ies), 2 deployment(s). | Chain verified: 22 line(s) intact. | Last import: adopt, 22 line(s) up to line 21, 2026-10-12 09:36:47.
device B second import: Nothing new: this device already holds that chain.
device B tampered: Refused (chain-broken): the audit chain was edited — the audit chain breaks at line 3 of 22 | Chain verified: 22 line(s) intact.
round trip A -> B -> export: identical true
page errors 0, external requests 0
```

The one "external request" on the parishes page is the page's three.js CDN URL. The harness (`tools/lib/pv_browser.mjs`)
answers it from `WebXR/vendor/three` and aborts every other outside host. The parishes drive used the source page,
`WebXR/parishes/parishes.html`; the dist bundles were not rebuilt here.

## Checkers (single runs)

- `node tools/check_vbridge.mjs`: 18 passed, 0 failed, then the EVAL and EVAL-2 lines.
- `node tools/check_enterprise3.mjs`: 16 passed, 0 failed.
- `node tools/check_bridge.mjs`: 139/139 (after `node tools/export_shared.mjs`).
- `node tools/check_robotrain.mjs`: ok — 291 checks (uses `vbGovernor` and the panel's provider path).
- `node tools/check_console.mjs`: All instructor-console checks pass.
- `node tools/check_imports.mjs`: All 1103 modules call only what they declare or import.
- `node tools/check_dataworks.mjs`: 59 passed, 0 failed.
- `node tools/check_guide.mjs`: 268 checks pass (after the doc edits).
- `node tools/check_payments.mjs`: All seat-billing checks pass (governance.js gained the button pair).
- `node tools/check_virtuals.mjs`: All 11 SmartCiti.X checks pass.

## Seams

- **Governor:** `vbGovernor({ ent3, limits, estops, at, now, rate: { perMinute, windowMs }, anomaly: { history } | { model } })`.
  - `check(command)` now also returns `explain: { rate, anomaly }`.
  - A command may carry `payloadKg` and `atMs`.
  - `vbAnomalyHistory(cfg)`, `vbAnomalyModel(history)` and `vbAnomalyScore(model, taskType, features)` are exported
    and plain JSON.
- **Bridge:** `job.governor.why` holds the full sentence for a `rate-limited` or `anomalous` refusal.
- **TQ-ROBOTICS / TradeQuest:** `VB_SHARED.governor.rules` (11), `.rateLimit`, `.anomaly`; `exports/shared/holodeck-shared.json` is current.
- **ENTERPRISE-3:** `ent3Export({ at })`, `ent3VerifyExport(doc)`, `ent3Import(doc, { at })`, `ent3Imports()`,
  `ENT3_EXPORT_SCHEMA`. `ent3Lineage(state?)` takes an optional state; called without one, it reads the store as before.
- **Console:** `ent3MountGovernanceView(...)` now also returns `exportRegistry()` and `importRegistryText(text)`, for
  drives and reels.
- **Roadmap (for the coordinator / WHITEPAPER-R4):** in `docs/wiki/Roadmap-and-Changelog.md`, two lines move from
  *Planned* to **Built**.
  - "A learned anomaly check and a per-agent rate limit beside the governor's rules" becomes, for example: **Built**
    Governor rate limit (20 per agent per minute) and anomaly check: refusal reasons 9 → 11; rule-legal injections
    caught 66 of 100; 0 of 200 safe jobs wrongly refused.
  - "Registry export and import between devices" becomes **Built**: round trip 200 of 200 identical; tampered files
    refused 50 of 50. The lineage diagram half of that line stays *Planned*.
  - I left the wiki unedited because ROBOTRAIN-5 is editing the neighbouring Open line.

## Left

- The dist bundles (parishes, instructor) were not rebuilt. The coordinator's `python3 tools/bundle_webxr.py` carries
  the panel and the button pair into `WebXR/*/dist/`. No new module was added, so the bundle lists are unchanged.
- The anomaly history is procedural. A site's real accepted-job log would replace it, and nothing here collects one.
- The cadence feature catches only very fast repeats (17/50 at 5–200 ms). A per-agent cadence baseline, or a
  multi-feature score, is the next step. Either would need its own measured before → after.
- The lineage diagram (instead of the table) is not built.
- `guide-kb.js` was not regenerated for the doc edits (check_guide still passes).
- eval_worlds and eval_content were not run: this work adds no world subjects and no stations.
- The roadmap wiki lines are not edited; the text is given under Seams.
