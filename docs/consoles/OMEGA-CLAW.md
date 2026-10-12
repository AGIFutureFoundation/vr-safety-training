# OMEGA-CLAW (`oc`, port 9146): the agents that run robot training and model testing

Loop 10, round 6b. Base 230105b7 (fast-forward). The only other console's work merged here is ROBO-ARENA's contract commit c720e927 (`ra-arena.js`, the `ra-lm.js` stub, and two additive `col-learn.js` exports). SmartCiti.X Holodeck · Powered by AGI Corp. What it is and is not: `docs/omega-claw.md`.

The agents are software and say so. There is no language model, no network call and no key. Robots are simulated, and the governor's rules stand. The persistent world never dispatches to a physical robot, stores nothing remotely and pauses when the tab is hidden. Learner data stays local, under DATAWORKS' gate.

## What is here

| File | What |
|---|---|
| `WebXR/shared/oc-claw.js` | The five agents (`OC_AGENTS`). `ocClaw({ arena })` provides `declare`, `train`, `evaluate`, `promote`, `auditAll`, `reportHumans`, `verify` and `judge`, over ROBO-ARENA's contract, which is injected, so the module has no imports. Also here: the hash chain (`ocVerifyChain`), the refusal reasons (`OC_REFUSALS`), `ocRaAdapter(ra)` (the arena plus each model's training seeds, derived from the arena's published constants), `ocPracticeNeeds` (people beside robots), and the declared protocol `OC_PROTOCOL` / `ocProtocolDeclarations`. |
| `WebXR/shared/oc-world.js` | `ocWorld({ seed, promoted, policyFor })` runs the hive (`ohHive`, read only) day after day with the promoted model per task. `ocWorldRestore` rebuilds a world by replay. `ocWorldLoop` runs it on a page: one simulated minute a second; paused on `visibilitychange`→hidden and on `pagehide`; catch-up on return capped at 480 minutes; the snapshot `oc-world-v1` = `{ seed, minutes, savedAt }` in local storage only. |
| `WebXR/shared/oc-panel.js` | `ocMountClaw(el, { record, human })`: roster; summary; declarations; per-scenario leaderboard with Wilson bars and each comparison's verdict; promotions; refusals with reasons; the chain re-walked in the browser; practice needs. `ocMountWorld(el, { loop })`: "Robots at work", with one Pause/Resume control (44 px). |
| `WebXR/shared/oc-claw-record.js` | `OC_RECORD`, generated from `docs/evals/claw.json` (`node tools/claw_eval.mjs --module-only`). |
| `tools/claw_eval.mjs` | Runs the protocol once, the probes and a 960-minute world, and writes `docs/evals/claw.json` plus the module. |
| `tools/check_claw.mjs` | 8 checks and the EVAL lines below. Listed in `check_all.mjs`, with an ESTIMATED 6 s baseline row. |
| `WebXR/parishes/js/app.js` | Mounts the claw panel in `menu-drills` for everyone (it carries no learner data). It passes the learner's drills (`drLoad`) and tutor state (`colTutor`) only when `!?demo && dxEligibility(...).eligible`. It starts the world 4 s after load (`?worldnow` starts it at once, `?noworld` never), with `raBuild` building the promoted model. Headless handles: `__parishTest.claw`, `__parishTest.clawWorld`. |
| `WebXR/instructor/*` | An "Omega Claw" tab (`tab-claw` / `view-claw` / `oc-root`), mounted on first open. It shows the record only, with `human: null`. |
| `tools/bundle_webxr.py` | Parishes: `rt6-learn`, `rt7-learn`, `rt8-learn`, `ra-lm`, `ra-arena`, then the four `oc-*` modules after `oh-panel.js` (214 modules). Instructor: `oc-claw`, `oc-claw-record`, `oc-panel` (117 modules). |

## Evals (before → after)

| Measure | Before (230105b7) | After | Source |
|---|---|---|---|
| Declared comparisons run once on held-out seeds | 0 | **45/45** (9 gym scenarios × 5 challengers; 8 models × 60 seeds × 9 = 3,600 episodes; seeds 7121–7180) | `node tools/claw_eval.mjs` (EVAL lines); `check_claw` 4 |
| Protocol committed before the run | n/a | `OC_PROTOCOL` in d592353c, an ancestor of the record's a757c667. The protocol hash 0f1f0548ef7b5658 is unchanged since. | `check_claw` 2 |
| Refusals exercised | 0 | **3 of 3** (undeclared 1, seed-reused 1, rule-broken 18), none of them running anything. Also recorded: not-better 18, not-applicable 9 (the small model's stub). | `docs/evals/claw.json` `counts`; `check_claw` 3, 4 |
| Promotions with a clear interval | n/a | **0 of 0**. DAgger (3 rounds) on AMR routing has 55/60 [0.819–0.964] against the clone's 42/60 [0.575–0.801], intervals clear, and **5 rule breaks: refused**. Every other challenger is not better or breaks rules. 45/45 verdicts re-derive from the record's numbers. On the stub arena, a clear win is promoted, and each of the 11 refusal reasons fires for its own case. | `check_claw` 3, 4 |
| Governor on the arena runs | n/a | 133,061/133,061 steps; physical 0 | `check_claw` 4 |
| Audit chain | n/a | Intact: 229 lines (228 at the audit, plus the audit's own line). A tampered line is caught at its index. Re-walked in the page and the console. | `check_claw` 3, 4; drive A.claw, C.console |
| Persistent world | none | Record: 960 simulated minutes (seed 1), the clone at every site, 163 jobs, governor 3,839/3,839, physical 0. Checker: 700 minutes, deterministic, replay-equal, 0 steps while hidden, catch-up capped at 480. Page: 613 minutes, 119 jobs, governor 2,562/2,562, physical 0; hidden for 4 s gave 0 steps. | `docs/evals/claw.json` `world`; `check_claw` 5; `$SP/loop10/oc/drive-out.txt` B.* |
| People beside robots | none | Robots need practice on 4 scenarios: teleop pick-place and AMR routing (rule breaks), port gantry hard (0.8 < 0.9), AMR hard (rule breaks). People: shown only when eligible. Fixture: 2 items eligible, 0 ineligible. The chain gets counts only. | `check_claw` 6 |
| Page | n/a | 0 page errors and 0 off-host requests (three.js from the CDN URL is answered from the vendored copy once). Phone 390×844: select 250×44, Pause 67×44, no horizontal scroll. | drive; `check_interface` 21/0 |
| `check_claw` | 0 passed, 8 failed | **8 passed, 0 failed** | `OC_ROOT=$SP/loop10/oc/base node tools/check_claw.mjs` → `$SP/loop10/oc/before-check.txt`; then the tree |

**Read honestly.**
- No model was promoted this round. The gate is strict by design: any rule break blocks a promotion, and the clone is already at 60/60 on four scenarios, where nothing can clear its interval. The promotion path is proven only on the stub arena.
- The small language-conditioned model was not compared. This branch has ROBO-ARENA's contract stub, which `raRun` reports as not applicable. Its comparison needs a new declaration on fresh seeds after integration. Re-running this protocol on 7121–7180 would reuse spent seeds.
- The leakage check uses training seeds derived from the arena's published constants (`RA_DEMOS`, `RA_DAGGER`) and ROBOTRAIN-6's pair seeds. It is only as good as that derivation. ROBO-ARENA does not export a seed list per model.
- The trainer schedules and records. The actual training happens inside the arena when a model is first built.
- In the page, the world advanced about 2 minutes per 6 s, not 6, at load average about 16. The first job of each task builds its model through `raBuild`; in Node at load 18 that took 16–330 ms per task.

## Budgets

Both panels are DOM only. The world loop steps the hive's simulation and draws nothing in three.js, so it adds no mesh, light, triangle, draw call or texture on any tier. The phone and headset tiers do not change. Bundle bytes (measured with `stat` against `git cat-file -s 230105b7:…`):
- `WebXR/parishes/dist/parishes.html`: 8,256,627 → 8,489,983 B (+233,356 B). About 101 KB of that is the record module, 74 KB is ROBO-ARENA's arena with ROBOTRAIN-6/7/8, and the rest is the claw modules.
- `WebXR/instructor/dist/instructor-console.html`: 4,317,158 → 4,469,165 B (+152,007 B).

The record module carries the full 229-line chain so the page can re-walk it. Trimming the chain to a head hash would save about 55 KB.

## Cycles

1. **Run the claw against the stub arena.** Reason: the claw must work before the arena lands. Check: a stub-arena script (scratch `t2.mjs`): declare, train, undeclared, run, already-run, promote. Act: `oc-claw.js` against an injected arena. Observe: the refusals fired, but the refusal line read "Refused: refused run of …" (doubled), and the random policy was "scheduled for training". Fixed: the refusal core carries the subject only, and `ocTrainable` skips models whose provenance is "nothing" or that have no learned parameters.
2. **Code to the contract's real shape.** Reason: the contract landed (c720e927). Check: read `raRun`'s return and time every family on non-held-out seeds 900001–900010 (scratch `t3.mjs`). Observe: `governorChecked` is a fraction, `steps` is a mean, `success` is a rate, and the counts are `successes`, `stepsRun` and `stepsChecked`. My first core would have compared a fraction with a mean. Act: `ocRow` reads the counts. Each declaration now names several challengers, each one a declared comparison, so the incumbent runs once per scenario. Without that, a second challenger would have hit the seed-reuse refusal. Committed with the protocol, d592353c, before any held-out run.
3. **Run the protocol once.** Reason: measure once on 7121–7180. Check: `node tools/claw_eval.mjs`. Observe: 45/45 comparisons, 0 promotions, refusals 3/3, governor 133,061/133,061, chain intact. The finding is that DAgger-3's clear win on AMR is blocked by its 5 rule breaks. Committed a757c667.
4. **Make the record usable in the page.** Reason: the page needs the record without re-running the held-out seeds. Check: the record module's size. Observe: 112 KB, with leaderboards duplicated. Act: a `--module-only` mode that regenerates the module from `docs/evals/claw.json` without running anything. Leaderboards and result hashes are dropped from the page copy (101 KB). The chain stays, so the page can re-walk it.
5. **Drive the built page.** Reason: the panels must work in the built pages. Check: a headless drive on 9146 (`$SP/loop10/oc/drive_claw.mjs`). Observe: everything passed: 0 errors, 0 off-host requests, 0 steps while hidden, phone controls 44 px. Two text problems showed in the stills. "10 declarations" counted the probe. The rule-broken example showed a weak case (DAgger-1 on teleop) instead of the telling one. Fixed in `oc-panel.js`: the probe is counted apart, and the example prefers a rule-broken challenger whose interval was otherwise clear. Re-driven and re-shot.
6. **Write the checker.** Reason: one checker proves every claim, with the before from the same script. Check: `check_claw` on the base archive and on the tree. Act: `tools/check_claw.mjs`, the `check_all` entry and the estimated baseline row. Observe: base 0/8, tree 8/0. Every record verdict re-derives through `claw.judge`, so the panel and the record cannot disagree with the rule. Committed a337fbd8.

## Seams

- ROBO-ARENA owns `ra-*.js`. I import `raBuild`, `raRun`, `raLeaderboard`, `raModels`, `raScenarios`, `RA_DEMOS`, `RA_DAGGER`, `RA_VERSION` and `RA_GOVERNOR`. If ROBO-ARENA also lists `ra-arena.js` or `rt6/7/8-learn.js` in the parishes bundle list, the bundler reports a clash; keep one copy.
- HIVE-6 owns `oh-*.js`. `oc-world.js` only calls `ohHive({ seed, nJobs, ticksPerDay, policyFor, sites })`, `step`, `now`, `metrics`, `jobs` and `on("complete")`.

## Left

- Compare the small model on fresh held-out seeds after integration, declared first.
- Show the people part with a real opted-in learner in a drive. This round's drive was not opted in, so the panel showed the "not opted in" text.
- Put the world's sites in the 3D scene (a status light per site), within the high tier's budget.
