# ROBOLEARN-9 (`rl9`, port 9160): protocol 3, the arena panel and the claw's people side

Loop 10, round 8. Base a10f1ff8 (fast-forwarded and confirmed). Owns `ra-*`, `oc-*`, `tools/arena_eval.mjs` and
`tools/claw_eval.mjs`. Every robot is simulated. Every model is trained here, with no network call, external API or key.
ra-lm, ra-lm-h and ra-lm-h48 are small language-conditioned models trained here, not large language models. The
reactive agent is a hand-written rule policy, not a trained model.

## Declared before running (docs/evals/arena-declared-r8.json)

- **ec8bf4c5 (20:19 UTC):** the declaration, committed before any run on 7241–7300, with a heartbeat line naming it.
  - Gym seeds 7241–7300. Station seeds 7241–7250 are reserved and were not run.
  - Challengers: ra-lm-h (new to the claw), ra-lm-h48 (the one declared AMR change: H 48 instead of 24, nothing else),
    reactive (a challenger for the first time) and random (the negative control). The incumbent is bc. 9 × 4 = 36
    comparisons.
  - Consumers: STRANDS-2 may run one parity check (bc, ra-lm-h) citing ec8bf4c5. Its counts must equal claw3.json.
- **96a38192, amendment 1:** the code (`OC_PROTOCOL_3`, ra-lm-h48, `claw_eval --protocol 3`) plus a stub run on
  development seeds 1–20. Nothing was tuned. The reactive agent has no rules for cell entry, cobot or teleop, so those
  three comparisons end as not-applicable.
- `claw_eval --protocol 3` refuses to run if the file is uncommitted or modified, if the code differs from it, or if
  claw3.json already exists. It ran once, in 3b06415a.

## Evals (before → after)

| What | Before | After | Source |
|---|---|---|---|
| Declared comparisons, each run once | 90 | **126** (protocol 3: 36/36, 5,220 episodes) | `claw3.json`; `check_claw` 12 |
| Promotions only with a clear interval | 0 of 0 | **2 of 2**, both the reactive rule policy: AMR hard 59/60 [0.911, 0.997] vs bc 2/60 [0.009, 0.114]; port gantry hard 60/60 [0.94, 1] vs 50/60 [0.72, 0.907]; 0 rule breaks | `claw3.json` `promotions` |
| AMR change: ra-lm-h48 − bc, AMR base | ra-lm-h − bc −0.100 [−0.247, 0.052] (7181–7240) | **−0.067 [−0.235, 0.108]**, 32/60 vs 36/60. The interval spans 0, so no claim. | `arena.json` `retest8.comparisons.amrHeadline` |
| The change's effect, ra-lm-h48 − ra-lm-h, AMR | — | **0 [−0.173, 0.173]** (32/60 each) | `retest8.comparisons.changeOnAmr` |
| ra-lm-h − bc, port base | −0.033 [−0.114, 0.031] (7181–7240) | **−0.117 [−0.222, −0.033]**, 53/60 with 7 rule breaks: ra-lm-h falls short here | `retest8.comparisons.lmHPort` |
| Reactive − bc, hard variants pooled | not declared | **+0.372 [0.300, 0.445]** (179/180 vs 112/180) | `retest8.comparisons.reactiveHardPooled` |
| ra-lm-h / ra-lm-h48 verdicts | not run by the claw | not-better on 4 scenarios each; rule-broken on 5 each (teleop, AMR, port, port hard, AMR hard) | `claw3.json` `challengerRows` |
| Refusals exercised | 3 of 3 + not-held-out | 3 of 3 + not-held-out again; the probes ran nothing | `check_claw` 12 |
| Governor / physical | — | **184,742 of 184,742 steps**, physical 0; chain intact (273 lines); world 960 minutes, 0 physical dispatches | `check_claw` 12 |
| Panel: the claw's model per scenario | 0 | **9 of 9 gym scenario cards**, read from claw3.json (7 kept bc, 2 promoted reactive). The 3 station cards say they are not under the claw. | `check_arena` 8 |
| retest7 and protocol-3 cards | none | both, static HTML, figures compared with arena.json | `check_arena` 8; `WebXR/robotics/programme.html` |
| `arena.json` retest8 | — | 36 rows copied from claw3.json (not a second run), plus a live bc row that reproduces the file | `check_arena` 11 |
| People blocks on opt-in, no reload | needed a reload | none → **local** on opt-in; local → **none** on revoke; 0 navigations, 0 page errors | `$SP/loop10/rl9/drive_rl9.mjs` → `drive-out.txt` |
| A real station pass, headless | fixture | **not done** (see Left) | — |
| Page module `oc-claw-record.js` | 101,403 B (2 records) | 160,167 B (3 records, chains trimmed) | `check_claw` 10 |

## Checkers (single checkers)

- `check_arena`: 11 passed, 0 failed (was 10)
- `check_claw`: 12 passed, 0 failed (was 11)
- `check_dataworks`: 59 passed, 0 failed
- `check_roboexport`: 8 passed, 0 failed
- `check_robotics_programme`: ok, 714 checks
- `check_newton`: all pass
- `check_imports`: 1,141 modules pass
- `check_parse`: 2,726 modules parse
- `check_interface`: not run. No control was added; the cards are static.
- The bundles were rebuilt for the drive. The committed dist was restored afterwards.

## Cycles

1. **Reason:** STRANDS-2 waits on the range. **Act:** declared first. **Check:** ec8bf4c5 at 20:19, with a heartbeat
   line naming it.
2. **Reason:** check the protocol code without touching held-out seeds. **Act:** a dev stub on seeds 1–20.
   **Observe:** ra-lm-h48 = ra-lm-h on AMR (12/20). The reactive agent is not applicable on 3 scenarios. **Check:**
   amendment 1, nothing tuned.
3. **Act:** ran once. **Observe:** 2 clear promotions (reactive on the hard variants). The AMR change moved nothing.
   **Check:** `check_claw` 12: declaration → protocol → record ancestry, and the verdicts re-derive.
4. **Act:** the claw's model per scenario plus the retest cards on the programme page. **Check:** `check_arena` 8
   compares them with arena.json and claw3.json.
5. **Act:** re-mount the people blocks from DATAWORKS' `onChange`. **Observe:** this failed first on revoke. The panel
   stayed `local`, because `dxRevoke` deletes the consent key at once, but in the headless drive its async clean-up
   (flush, then store clear) did not finish within 15 s, so `onChange` never fired. **Act:** also re-read on the next
   task after an Opt in / Revoke click. **Check:** the drive shows local → none with no reload.

## Seams

- **DATAWORKS:** in the built parishes page, headless, `dxRevoke`'s async part did not resolve within 15 s (the panel
  kept saying "ON"), although the consent key was already deleted. This needs a look by DATAWORKS' owner.
- **STRANDS-2:** use 7241–7300 only for the parity check, citing ec8bf4c5.
- `raModels()` now lists 10 models (ra-lm-h48 after ra-lm-h). `check_arena` 1 was updated.

## Left

- **The real station pass:** not done. The drive's start-button heuristic clicked "Start guided tour", which opened
  charge-point instead of robot-cell, and the run was then killed by the timeout. The next try should click only the
  pre-brief's "I've read it — start the run", then play through `__smartcityTest`.
- The smartcity page requests React from cdnjs. These are off-host requests from that page; they already existed.
- The port gantry programme station (item 3) and consented takes into training (item 4, ra2-next 5): not started.
