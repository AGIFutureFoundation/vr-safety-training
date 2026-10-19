# ROBOLEARN-10 (`rl10`, port 9170): a real station pass, takes into training, the revoke seam

Loop 10, round 9. Base 61d85871 (fast-forwarded and confirmed). Owns `ra-*`, `oc-*`, `tools/arena_eval.mjs`,
`tools/claw_eval.mjs` and the robotics programme generator. Every robot is simulated. Every model is trained here, with no
network call, external API or key. ra-lm-h is a small language-conditioned model trained here, not a large language model.

## Declared before running

- **c3d3be3d (01:46 UTC):** `docs/evals/arena-takes-declared-r9.json`, committed before the first run and named in a
  heartbeat line. It declares a **training** run only: ra-lm-h (RA_LM_H_TRAIN unchanged) on the arena's development-seed
  demonstrations (RA_DEMOS → episode seeds 100004–100043) plus the learner's own receipted takes, on the device, with no
  held-out seed, no comparison and no claim. 7121–7300 stay spent; **7301–7360 are not touched.**
- **Protocol 4 was not declared.** The brief allowed it only if items 1–3 were committed by minute 35; they were not (item 1's
  drive was still running at load 25–32). The amr-robots features remain the next AMR idea, on 7301–7360, declared first.

## Evals (before → after)

| What | Before | After | Source |
|---|---|---|---|
| A real station pass, headless | fixture (round 7, 8) | ITEM1_RESULT | `$SP/loop10/rl10/drive_rl10.mjs` → `drive-out.txt` |
| Port gantry programme station | 0, no reason in code | **0, with the reason stated** in `RP_SCENARIO_GAPS["rb-port-gantry"]` and held by a check: gym scenarios with a learner track 5 of 6, stated gaps 1 (rb-port-gantry) | `check_robotics_programme` (714 → 721 checks) |
| Takes in training (fixture store, one gym task) | none | signed out **0**; opted-in adult **1 take → 24 human rows of 608** (584 synthetic), receipt id on the provenance row, task source "human"; K-12 **0**, demo **0** | `check_arena` 12 |
| Deleted after revoke | — | **1 → 0** takes, human rows 24 → 0, and the rebuilt model's weights hash **equals the no-takes model** | `check_arena` 12 |
| Training seeds vs held-out | — | demo seeds 100004–100043, disjoint from 7121–7360 | `check_arena` 12 |
| Protocol-4 verdicts | — | not run (not declared) | — |
| Governor / physical | 184,742 of 184,742 steps, physical 0 | unchanged: **184,742 / 184,742, physical 0**; world 960 min, 0 physical dispatches; chain 273 lines | `check_claw` 12 |
| Revoke → panel OFF, built parishes page, headless | predecessor: not within 15 s (load ≈ 10 consoles) | diagnosed: **5,120 ms** at load 19 before the fix, no deadlock; after the fix the panel redraws OFF before awaiting the clean-up (Node: consent gone before the first await, clean-up 60 ms behind it) | `$SP/loop10/rl10/diag_revoke.mjs` → `diag-revoke-out.txt`; `check_dataworks` (59 → 61) |
| IndexedDB opens behind a revoke | — | 3 serial (clear's transaction 2.2 s, deleteDatabase 0.5 s, re-read 1.1 s), queued after the boot's 7 reads at 1–2 s each | `diag-revoke-out.txt` `idb-after-revoke` |

## What is here

- **`WebXR/shared/ra-takes-train.js`** (new; in the robotics bundle list after `ra-arena.js`): `raTakesCollect` (the learner's
  own receipted takes, [] unless `dxCollecting()`), `raTakesDevDemos` (RA_DEMOS, the same call ra-arena makes),
  `raTakesTrain` (ra-lm-h from both, with per-take provenance, `rows.{synthetic,human,refusedEpisodes}` and the weights hash),
  `RA_TAKES_TRAIN` (the declaration it runs under). Gym tasks only; station takes need the station texts.
- **`tools/check_arena.mjs`** check 12: the declaration (first commit c3d3be3d), seed disjointness, signed out / opted in /
  K-12 / demo / revoke, and the rebuilt model equal to the no-takes model byte for byte. 11 → 12 passed.
- **`WebXR/shared/dx-consent-ui.js`**: Revoke renders OFF before awaiting `dxRevoke`'s clean-up; `onChange` and a second
  render follow when the deletion is done. **`tools/check_dataworks.mjs`**: the consent is gone before `dxRevoke`'s first
  await (a slow fixture store), and the panel's handler redraws first. 59 → 61 passed.
- **`WebXR/shared/rp-programme-data.js`** `RP_SCENARIO_GAPS` (re-exported by `rp-programme.js`); **`check_robotics_programme`**
  holds every gym scenario to a track or a stated gap, and every gap to a gym scenario no track covers.
- `$SP/loop10/rl10/drive_rl10.mjs`: the round-8 drive with the start loop replaced (intro `#enter-flat`, then
  `#prebrief-start`, both through the element's own `click()`), revoke moved to `diag_revoke.mjs`.

## Cycles

1. **Reason:** the revoke seam first, because its diagnosis decides whether the drive can revoke at all. **Act:** instrumented
   `indexedDB.open` / `deleteDatabase` in the built parishes page. **Observe:** the first run clicked Revoke 800 ms after
   opt-in and found no button: the panel appends `#dx-revoke` only after `await dxStore.list()`, which took seconds. The
   second run: 7 serial opens at boot (1–2 s each), then Revoke → 3 more → OFF after 5.1 s. No `blocked`, no error.
   **Check:** `diag-revoke-out.txt`. **Fix and check:** render OFF first; `check_dataworks` 61.
2. **Reason:** the predecessor's start heuristic clicked the tour. **Act:** click only `#enter-flat` then `#prebrief-start`.
   **Observe:** the pre-brief appeared; Playwright's actionability click then timed out at load 28. **Act:** dispatch the
   element's own `click()`. **Observe:** session `robot-cell`, 14 steps. **Check:** `drive-out.txt` E.session.
3. **Reason:** training on takes must be declared before it runs. **Act:** c3d3be3d first; the module in the same commit;
   the check and the bundle list after. **Observe:** 1 take adds 24 rows; revoke returns the hash to the baseline. **Check:**
   `check_arena` 12.
4. **Reason:** a port-gantry station is a content round, not a mapping. **Act:** the reason in code with a check that a gap
   can never be both claimed and taught. **Check:** `check_robotics_programme` 721.

## Checkers (single checkers)

- `check_arena`: 12 passed, 0 failed (was 11)
- `check_claw`: 12 passed, 0 failed
- `check_dataworks`: 61 passed, 0 failed (was 59)
- `check_roboexport`: 8 passed, 0 failed
- `check_robotics_programme`: ok, 721 checks (was 714)
- `check_newton`: 60 checks, 0 failed
- `check_imports`: 1,149 modules pass (was 1,141)
- `check_parse`: PARSE_RESULT
- `check_interface`: not run; no control was added or changed (the Revoke button's handler changed, not the control).
- The bundles were rebuilt for the drives; the committed dist and timing files were restored afterwards.

## Seams

- **DATAWORKS:** the panel's count and Revoke button appear only after an IndexedDB read; under load that is seconds. A
  cached count, or the button before the count, would make the panel usable at once. `dxIdbBackend.clear()` fires
  `deleteDatabase` without awaiting it and `dxRevoke` reopens the database at once for `remaining`; that is 2 of the 3 opens.
- **STRANDS-3:** 7301–7360 are untouched; nothing to cite this round.

## Left

- Protocol 4 (the amr-robots features on 7301–7360): not declared, not run.
- A page control for the takes-trained model, and station takes in it (gym tasks only now).
- The smartcity page requests React from cdnjs (pre-existing off-host requests).
