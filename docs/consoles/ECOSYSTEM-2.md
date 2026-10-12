# Console ECOSYSTEM-2 (loop 10, round 8, prefix `eco2`, port 9161)

**Task.** This console did eco-next items 1–5, in order, for the ecosystem seams with SmartCiti.X and Cognition.X:

1. The Ecosystem tab's built-page drive becomes a checker leg.
2. The match rules are widened, with adult bands only.
3. `eco-bus` is wired to the learner path behind DATAWORKS consent.
4. The cross-repo fixture gets a home.
5. Router.X stays marked absent.

**Base.** The worktree was fast-forwarded to `a10f1ff8` and the hash confirmed.

**Sources.** Both sibling clones were only read:
- SmartCiti.X at `398f287` and Cognition.X at `47c1820`, read through the refs files.
- Nothing was written to them or pushed, and no SmartCiti.X code was copied. Its modules are only imported at run time by `check_eco` when its clone is present.

**Interruption.** The account's usage limit stopped this console at about 20:36 UTC. It resumed at 21:27 UTC on the coordinator's word. Items 4 and 5 were not started, and the coordinator dropped them as left.

## What was built

| Item | Files | Check | Commit |
|---|---|---|---|
| 1. The tab's built-page drive as a checker leg | `tools/check_eco.mjs` leg 7; the baseline row (an estimate) | `check_eco` 7 | `fbebd6c6` |
| 2. 13 declared adult-band rules | `WebXR/shared/eco-blocks.js` (`ECO_RULES` 15 → 28), the regenerated `eco-blocks-data.js` and `docs/ecosystem/blocks-match.json`, `docs/ecosystem.md` (a rule table with the reason for each) | `check_eco` 1, 2, 2b, 3, 7 | `57e49d7a` |
| 3. The learner path into the adapter, behind consent | `WebXR/shared/eco-learn.js` (new); `WebXR/smartcity/js/app.js` (one import, one call before `session.start()`); `tools/bundle_webxr.py` (`eco-bus.js` and `eco-learn.js` in the smartcity bundle, after `dx-data.js`); `docs/ecosystem.md` | `check_eco` 8 (headless) and 9 (built page) | the item-3 commit |
| 4. Fixture JSONL | not started (left) | | |
| 5. Router.X | No change was needed. No Router.X repository exists: `/home/user/agifuturefoundation/` holds `acp-cli`, `cognition.x`, `constructionvr` and `smartciti.x`, and none of their Markdown names Router.X. `check_eco` 6 still holds. | `check_eco` 6 | |

## Cycles (reason → act → observe, each with its check)

1. **Base.**
   - Act: `git merge --ff-only a10f1ff8`.
   - Observe: `git rev-parse HEAD` returned `a10f1ff8646d…`, and the clones' refs read `398f287…` and `47c1820…`.
2. **The built tab counted a request it did not make.**
   - Reason: the first leg-7 run failed with one request after the click.
   - Act: logged the URL. It was `/vendor/fonts/barlow-latin-700-normal.woff2`, the stylesheet's bold face loading lazily when the tab's `<strong>` first showed. The leg now loads every `document.fonts` face first.
   - Observe: 0 requests after the click, 0 page errors, 0 localStorage writes, 238 options and electrical → CX-TRADE-0004/0005/0006. With the dist restored after item 2, the leg failed with "the dist is stale: run python3 tools/bundle_webxr.py instructor", which is the intended guard. The check is `check_eco` 7.
3. **Widen without moving what was right.**
   - Reason: 456 unmatched stations, and Trade School has only 47 adult blocks.
   - Act: read the unmatched names and searched the adult credentials of Global Health OS, Corporate OS, Multilateral OS and Non-Profit Practice. Appended 13 rules after the trade rules, each with a block pattern that names a credential.
   - Observe: 214 → 301 on the first pass, with the 214 round-7 rows byte-identical. The check is `check_eco` 2 and 2b.
4. **Read the rows, tighten the words.**
   - Reason: the first pass put "Deli Slicer Sanitation" under outbreak response, sent every dental station to patient-safety reporting (tie order), and matched sports and public-service stations.
   - Act:
     - split health-worker safety from patient safety;
     - "sanitation" became "water sanitation";
     - split facility from community disaster readiness;
     - dropped "dental|dentistry", "hostile crowd", "teammate conflict", "pathway planning", "constituent" and "open meeting law".
   - Observe: 285 of 670, with the round-7 rows unchanged and 385 unmatched still listed with the reason. The check is `check_eco` 1–3.
5. **Consent at every event, not at attach.**
   - Reason: a revoke or a K-12 switch mid-run must stop and delete.
   - Act: `eco-learn.js` re-reads `dxCollecting()` at every event and every count, and a false answer wipes the in-memory bus.
   - Observe: a real `game.js` Session under the real consent gate held 5 of 5 valid events when opted in, and SmartCiti.X's real `Bus` and `extractSignals` accepted them. It held 0 when signed out, in the demo, when not opted in and on a K-12 surface. After `dxRevoke` it held 6 → 0, including a run still in progress. The check is `check_eco` 8.
6. **The built page.**
   - Reason: the integration rule says to measure the combined case where it runs.
   - Act: opened `?sim=valve-vault` in the built smartcity page and found three things to fix:
     - React from cdnjs had to be answered from `WebXR/vendor/react/`;
     - the run starts only after "Free explore" and then the pre-brief's own start button;
     - leg 8's `globalThis.window` stand-in made Playwright's client hang, so leg 9 deletes it first.
   - Observe: opted in, 2 of 2 events were held and valid (start and one step); 0 after the consent key was removed in the page; 0 when not opted in, in the demo and on a K-12 surface, each after a step was played; 0 eco page errors. The check is `check_eco` 9.
7. **Flake under load.**
   - Reason: with `check_parse` running beside it, leg 9's "not opted in" page did not start within 30 s.
   - Act: raised leg 9's waits to 90 s.
   - Observe: the re-run passed, 10 of 10 with the clones and 9 plus 1 skip (2b) without them.

### The hand-read sample (25 of the 71 new rows; first block shown)

| Station | Rule | First block | Read |
|---|---|---|---|
| Amalgam Waste Handling | health-worker-safety | Healthcare Worker Safety & Occupational Health / Assess hazards | right |
| Apprenticeship Application & Test | career-pathway | Corporate Apprenticeship & Internship Programs / Design programs | right (the employer side) |
| Reading an Apprenticeship Standard | career-pathway | the same | right |
| Budget Tradeoff Hearing | civic-advocacy | Nonprofit Advocacy & Systems Change Leadership / Identify policy priorities | borderline, kept |
| Fatigue and Duty-Time Self-Check | wellbeing | Workplace Employee Wellbeing & Mental Health Integration / Assess wellbeing | right |
| Unruly Passenger De-escalation | de-escalation | Workplace Conflict Management & Resolution Protocols / Prevent escalation | right |
| Cath Lab | patient-safety | Healthcare Adverse Events & Patient Safety Reporting | right |
| Chairside Emergency | patient-safety | the same | right |
| Coalition Building Table | civic-advocacy | Nonprofit Partnership Development & Coalition Building | right |
| Community Listening Session | civic-advocacy | Nonprofit Advocacy & Systems Change Leadership | right |
| Conflict Mediation Room | de-escalation | Corporate Conflict Resolution & Mediation | right |
| Crisis Communication Podium | crisis-comms | Corporate Crisis Communications & Reputation Recovery | right |
| Critical Incident Debrief | psychosocial | Field Staff Mental Health & Psychosocial Support | right |
| Difficult Conversation Across Difference | de-escalation | Manager Conflict De-Escalation & Difficult Conversations | right |
| Neighborhood Emergency Block Captain | disaster-community | Community Health Resilience Building & Disaster Preparedness | right |
| Restorative Justice Circle | de-escalation | Corporate Conflict Resolution & Mediation | right |
| Voter Registration Drive | civic-advocacy | Nonprofit Advocacy & Systems Change Leadership / Conduct advocacy | right |
| Damage Assessment Team | disaster-community | Community Health Resilience Building & Disaster Preparedness | right |
| Dental Trauma & Avulsed Tooth Response | patient-safety | Healthcare Adverse Events & Patient Safety Reporting | right |
| Public Health Dentistry & Fluoridation Advocacy | civic-advocacy | Nonprofit External Relations & Public Advocacy | right |
| Conflict on the Crew | de-escalation | Corporate Conflict Resolution & Mediation | right |
| Endodontic Assisting | patient-safety | Healthcare Adverse Events & Patient Safety Reporting | borderline (clinical, but not a safety task), kept |
| Ethics and Conflict of Interest | ethics | Workplace Ethics & Compliance Training | right |
| Four-Handed Dentistry | patient-safety | Healthcare Adverse Events & Patient Safety Reporting | borderline, kept |
| Hazardous Drug Spill Kit Response | health-worker-safety | Healthcare Worker Safety & Occupational Health | right |

Of the 25 rows, 22 read right and 3 are borderline; none is wrong. The new blocks are the adjacent adult practice, often the organisational side of the same task, and `docs/ecosystem.md` says so.

## Evals (before → after, with sources)

| Eval | Before | After | Source |
|---|---|---|---|
| Tab drive in the built page | measured once by hand | a checker leg: 309 options (238 before the new rules), electrical blocks as the extract, 0 page errors, 0 requests and 0 storage writes after the click | `check_eco` 7 |
| Stations mapped | 214 of 670 | **285 of 670** (385 unmatched, listed with the reason); round-7 rows unchanged (214 of 214) | `check_eco` 1, 2, 2b; `docs/ecosystem/blocks-match.json` |
| Extract | 91 blocks, 73.0 KB | 157 blocks, 114.8 KB (limit 200 KB), all in an adult band | `check_eco` 1, 3 |
| eco-bus events from a real opted-in session | 0 (no page loaded the adapter) | headless real Session: 5 of 5 valid, also accepted by SmartCiti.X's real Bus; built page: 2 of 2 valid | `check_eco` 8, 9 |
| Events held for K-12, demo and signed-out (and not opted in) | n/a | 0, 0, 0 (and 0), headless and in the built page | `check_eco` 8, 9 |
| Held after revoke | n/a | 0 (6 → 0 headless, including a run in progress; 2 → 0 in the page once consent is removed) | `check_eco` 8, 9 |
| Network calls | 0 | 0 | `check_eco` 5, 8 |
| Fixture lines valid | none | not done (left) | |
| `check_eco` with and without the clones | 7 of 7 (round 7) | 10 of 10 passed with the clones; 9 passed and 1 skipped (2b) with `ECO_SIBLINGS=/nonexistent` | `node tools/check_eco.mjs`; `ECO_SIBLINGS=/nonexistent node tools/check_eco.mjs` |

## Integration

- **The smartcity app.** It gains one import and one guarded call (`WebXR/smartcity/js/app.js`). No console owns that file this round. The call is inert unless `dxCollecting()` is true.
- **The bundle.** `tools/bundle_webxr.py` adds `eco-bus.js` and `eco-learn.js` to the smartcity list, after `dx-data.js`. The coordinator's regenerate picks them up. The committed dist was restored after every drive.
- **Measured in the built page.** `check_eco` 9 is the combined case: the real station, the real DATAWORKS gate and the adapter.

## What is left

See `tools/briefs/next/eco2-next.md`: the fixture JSONL (item 4), the trades app's sessions, a held count in a page that can see it, and a quiet re-measure of leg 9's time.
