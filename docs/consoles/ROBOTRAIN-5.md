# ROBOTRAIN-5: the open proof observed, the hard variants pinned (`rt5`, port 9081)

Loop 9 (SmartCiti.X Holodeck · Powered by AGI Corp). Base 8a16ec16, the pushed head of PR #1. This builds on ROBOTRAIN-4
(`docs/consoles/ROBOTRAIN-4.md`: `dxFlush`, the walker, the hard variants), ROBOTRAIN-3 (the failed page proof), ROBOSCENARIOS
and COLEARN. Read those first. Every robot here is simulated, and every "learner" is the scripted stand-in, labelled synthetic
where it is written. It goes through the same opt-in a person would click. No person was measured.

## What is here

1. **The page-level proof, observed in the built page.** The parishes bundle was rebuilt in this worktree, served on 9081 and
   driven headlessly through `tools/lib/pv_browser.mjs` (which launches through `tools/lib/pw.mjs`). The steps: an adult test
   profile signs in, opts in on the Me tab, makes three cell takes on the pad, the drive awaits `__parishTest.dxFlush()`, and the
   agent-jobs card reads **"your 3 takes"**. After a revoke the card reads "synthetic demonstrations" and the store holds
   **0** episodes. Page errors 0. External requests 0: the only off-host URL is three.js, which the harness serves from the
   vendored copy. The drive's output is pasted below.
2. **Why the card had never updated, fixed at the source** (`WebXR/shared/dx-data.js`). This loop found three bugs in the
   recorder's store write. None of them was in the check:
   - `dxFlush()` awaited only the writes that were still parked. If the idle slot had already started a write, that write was
     no longer parked, so the flush neither ran it nor waited for it. The flush resolved while the put was still in flight, and
     the next read missed the take. In the built page this showed as: 3 takes, the flush resolved, the store held 1, the card
     said "your 2 takes". Now writes that are in flight are tracked, and the flush waits for them.
   - While a flush was waiting on its first write, the idle slot could start the other parked writes, and the flush skipped
     them without waiting. On a slow store this showed as pending 3, flushed 1. Each parked write now *settles*: it runs now,
     or the flush waits for the put that has already started.
   - `dxRevoke()` cleared the store while a put could still be in flight, so a take could land after the clear. The revoke now
     deletes the consent, flushes (parked takes are discarded because consent is gone, and any put in flight is awaited), and
     only then empties the store.
   The privacy rules are unchanged: nothing is written unless the learner is collecting, there is no upload endpoint, and
   revoke deletes.
3. **The page wiring** (`WebXR/parishes/js/app.js`): `__parishTest.dxFlush` and `__parishTest.dx = { flush, pending, stored }`
   are read-only views of what the recorder has already done. When a take finishes, the app re-reads the takes for the
   provider and then re-renders the Me tab's episode count. Before this, the count still said "0 episodes stored" after three
   takes.
4. **Teleop tasks for the hard variants** (`WebXR/shared/rt-teleop.js`). `RT_TASKS` goes from 4 to 6 tasks:
   `rb-construction-drilling#hard` and `rb-port-gantry#hard` use the controls of their base scenarios, so `rtCompareAll()`
   reports recorded-vs-synthetic on them. The pad's task select used to label every task except pick-and-place as "Robot cell
   entry". Each task now carries its own label.
5. **`rb-amr-fleet-routing#hard`** (`rb-env.js`, `rb-robotics-data.js`, `col-learn.js`, `tools/col_eval.mjs`). The variant adds
   a second walkway crossing (column 3 or 5, seeded) with its own random timing, and one blocked aisle cell on the pick-up side.
   - The variant's random draws come after the base draws, and the extra state appears only in the variant's observation, so
     the base scenario and its `colearn.json` rows are byte-identical. The diff is insertions only.
   - COLEARN's AMR features read every walkway and the blocked cell. A base observation gives the same numbers as before.
   - The variant was trained and scored like the others, through `node tools/col_eval.mjs`, into `colearn.json` `variants`.
6. **Checkers.**
   - `tools/check_robotrain.mjs` section 9:
     - the flush, the in-flight write, two flushes at once, concurrent puts, and a revoke during a write;
     - the page handles;
     - `rtFollowCell` on a plain walker node, and the arm pose by mode;
     - the walker built on a cell site only;
     - the three hard variants: present, seeded, 60 held-out seeds, the gaps stated, the AMR variant re-measured live against
       the file;
     - six teleop tasks, with recorded-vs-synthetic on the hard ones.
   - `tools/check_roboscenarios.mjs`: one row for each hard variant.
   - The roadmap's Open item in `docs/wiki/Roadmap-and-Changelog.md` moves to Built.

## The drive's output (the built page, `?parish=sf-downtown`, port 9081, reduced motion)

Script: `$SP/loop9/rt5/drive.mjs`, scratch. The takes are three skill-1 stand-in pose sequences replayed through the pad's XR
seam (`teleop.xr`). The drive does not call `vbLocal.refresh()` between the flush and the card. The card is what the app
rendered after its own `onTake` re-read.

```
A.signedOut.local {"rb-cell-entry":0,"rb-cobot-zone-setup":0,"rb-teleop-pick-place":0,"rb-amr-fleet-routing":0,"rb-construction-drilling":0,"rb-port-gantry":0}
A.signedOut.card {"job":"vbjob-fc99abc6ece1a8f8","task":"rb-cell-entry","provider":"Provider: COLEARN behaviour-cloning policy (k-nearest-neighbour), trained on synthetic demonstrations (scripted stand-in)"}
B.tabs {"tabs":["learn","play","map","me"],"current":"me","consentVisible":true}
B.consent.before off
B.optedIn Data sharing: ON since 2026-10-12 · licence CC0-1.0
B.takes [{"seed":11,"node":{"passed":true,"steps":31},"page":{"active":true,"fed":31,"status":"Recording · xr · restarted · cell entry: 2.003 m from the cell · e-stop tested, jam cleared, restarted","take":{"scenario":"rb-cell-entry","steps":31,"kept":true},"pending":1}},{"seed":12,"node":{"passed":true,"steps":31},"page":{"active":true,"fed":31,"status":"Recording · xr · restarted · cell entry: 2.004 m from the cell · e-stop tested, jam cleared, restarted","take":{"scenario":"rb-cell-entry","steps":31,"kept":true},"pending":2}},{"seed":13,"node":{"passed":true,"steps":33},"page":{"active":true,"fed":33,"status":"Recording · xr · restarted · cell entry: 2 m from the cell · e-stop tested, jam cleared, restarted","take":{"scenario":"rb-cell-entry","steps":33,"kept":true},"pending":3}}]
B.dxFlush {"pendingBefore":3,"written":0,"pendingAfter":0,"stored":3}
B.card {"job":"vbjob-fc99abc6ece1a8f8","task":"rb-cell-entry","provider":"Provider: COLEARN behaviour-cloning policy (k-nearest-neighbour), trained on your 3 takes (3 clean passes kept; consented, on this device)","phase":"COMPLETED","steps":30,"governorOnEvery":true,"audit":{"ok":true,"brokenAt":null,"lines":7}}
B.local {"rb-cell-entry":3,"rb-cobot-zone-setup":0,"rb-teleop-pick-place":0,"rb-amr-fleet-routing":0,"rb-construction-drilling":0,"rb-port-gantry":0}
B.consentCount 3 episodes stored in this browser.
C.revoked {"flush":0,"stored":0,"local":{"rb-cell-entry":0,"rb-cobot-zone-setup":0,"rb-teleop-pick-place":0,"rb-amr-fleet-routing":0,"rb-construction-drilling":0,"rb-port-gantry":0},"panel":"Data sharing for robot training: OFF (the default). Nothing is recorded unless you opt in."}
C.card {"job":"vbjob-fc99abc6ece1a8f8","task":"rb-cell-entry","provider":"Provider: COLEARN behaviour-cloning policy (k-nearest-neighbour), trained on synthetic demonstrations (scripted stand-in)","phase":"COMPLETED","steps":25,"governorOnEvery":true,"audit":{"ok":true,"brokenAt":null,"lines":15}}
errors {"pageErrors":0,"pageErrorText":[],"externalRequests":0,"offHost":[],"threeRoutedToVendoredCopy":2,"crashed":false,"seconds":67}
```

How to read `B.dxFlush`: three writes were pending or in flight when the drive called the flush. The app's own `onTake`
re-read had already queued a flush, and that flush settled all three, so the drive's call wrote 0 itself and the store held 3
when it resolved. Flushes run one after another, so "flushed" now means "on the store". The second card is the same COLEARN
cell-entry job (`vbjob-fc99abc6ece1a8f8`). The drive steps the panel's queue to the job that names the COLEARN policy, because
the queue cycles.

## Evals (before → after)

| Measure | Before (8a16ec16) | After | Source |
|---|---|---|---|
| Open roadmap proofs (the card after a take, in the built page) | 1 | **0**: observed, output above | this file; `docs/wiki/Roadmap-and-Changelog.md` |
| Takes on the store when `dxFlush()` resolves (built page, 3 takes) | 1, then 2 on a later read: "your 2 takes" | **3**: "your 3 takes" | the drive, above |
| Store writes `dxFlush()` waits for | parked only | parked, plus started by the idle slot (settled), plus in flight | `check_robotrain` section 9 |
| A take landing after a revoke while its put was in flight | possible | **0** in the check | `check_robotrain` section 9 |
| Hard variants pinned by a checker | 0 | **3** (drilling, port, AMR) | `check_robotrain` section 9; `check_roboscenarios` rows 9 |
| `check_robotrain` checks | 291 | **334** | `node tools/check_robotrain.mjs` |
| `check_roboscenarios` rows | 10 | **12** | `node tools/check_roboscenarios.mjs` |
| Recorded-vs-synthetic tasks (`rtCompareAll`) | 4 | **6** | `WebXR/shared/rt-teleop.js` `RT_TASKS` |
| Hard variants with a measured random / clone / expert result | 2 | **3** | `docs/evals/colearn.json` `variants` |

Recorded-vs-synthetic on the hard variants (`rtCompare`, N = 40 takes or demonstrations, 60 held-out seeds 7001–7060, printed
by `check_robotrain`):

| Task | Recorded (scripted stand-in through the pose path) | Synthetic demonstrations | Random | Expert |
|---|---|---|---|---|
| `rb-construction-drilling#hard` | 1.000 (clean 1.000), kept 23/40 | 1.000 (clean 1.000), kept 20/40 | 0.000 | 1.000 |
| `rb-port-gantry#hard` | **0.650 (clean 0.900)**, kept 21/40 | 0.717 (clean 1.000), kept 24/40 | 0.000 | 1.000 |

Read honestly: on the hard port lane the clone of the lagging, tremoring stand-in completes fewer runs than the clone of the
synthetic demonstrations. It is also the only arm here with runs that are not clean: 6 in 60 are held at the crossing by the
env. The synthetic arm agrees with `colearn.json` (0.717). The port gap to the expert is **0.283**, as ROBOTRAIN-4 measured
it.

The new hard variant (`docs/evals/colearn.json` `variants`, 60 held-out seeds):

| Scenario (hard) | Demos kept | Random | Clone | Clone + reservation shield (a rule) | Expert | Gap to expert |
|---|---|---|---|---|---|---|
| `rb-amr-fleet-routing` (base, for reference) | 37 of 40 | 0.000 | 0.817 (clean 0.817) | 0.867 (clean 0.917) | 1.000 | 0.183 |
| `rb-amr-fleet-routing#hard` | 32 of 40 | 0.000 | **0.050** (clean 0.900) | 0.067 (clean 1.000) | 1.000 (clean 1.000) | **0.950** |

That is the result as measured. With a second crossing and a blocked aisle, the k-NN clone over the hand-written features
completes 3 of 60 runs. It mostly fails by waiting until the step cap (mean 113 steps), not by colliding: 0.900 of runs are
clean. No tuning was done to close the gap.

## Cycles

1. Reason: the card had never been seen to update in the built page; check = the headless drive on 9081 after
   `__parishTest.dxFlush` was exposed. → Act: exposed `dxFlush` and the store count, wrote the drive. → Observe: **failed**. After
   3 takes and a resolved flush the store held 1. The card said "your 2 takes". The Me tab still said "0 episodes". The
   post-revoke card showed a different job because the panel queue cycles. Cause: the flush did not wait for a write the idle
   slot had started.
2. Reason: a flush must wait for writes in flight, the Me tab must re-read after a take, and the drive must read the same job;
   check = the same drive. → Act: an in-flight set in `dx-data.js`, `onTake` re-renders the consent panel, the drive selects the
   COLEARN cell job by policy. → Observe: store 3 when the flush resolved, card "your 3 takes", the job COMPLETED (30 steps,
   governor on every step, audit chain intact); revoke → "synthetic demonstrations", store 0; page errors 0, external requests 0.
   Committed ad49f46b.
3. Reason: `rtCompareAll` should report the hard variants; check = a run of `rtCompareAll()`. → Act: two `RT_TASKS` entries on the
   base controls, and a label per task (the select mislabelled drill and port as cell entry). → Observe: 6 tasks; drilling#hard
   1.000 / 1.000; port#hard recorded 0.650 (clean 0.900) vs synthetic 0.717 (clean 1.000); `check_robotrain` 291 and
   `check_roboscenarios` 10/0 unchanged. Committed bf353214.
4. Reason: the AMR variant, measured like the others; check = `node tools/col_eval.mjs` and a diff showing only insertions. →
   Act: second walkway and blocked cell in `rbAmrSim`, features over every walkway, `COL_VARIANTS`. → Observe first: the expert
   passed only 0.55 (27 of 60 seeds failed, all three robots waiting). Diagnosis: delivered robots stay parked at the drop-offs,
   so a pallet in a drop-off aisle (x 6–7) walls a drop-off in for good. That made the variant unsolvable, which says nothing
   about the learner. Moved the cell to the pick-up side (x 1–2). Then: expert 60/60 clean, clone 0.050, gap 0.950; base rows
   byte-identical; `check_colearn` 46/0, `check_robotics` 19/0. Committed 1c991858.
5. Reason: pin it all; check = `check_robotrain` section 9. → Observe first: **FAILED** "pending 3 → flushed 1" on a slow store.
   While the flush awaited the first write, the idle slot started the other two, and the flush skipped them unawaited. Writing the
   revoke check exposed a second race: a put in flight could land after `dxRevoke` cleared the store. → Act: `settle()` per
   parked write; the revoke flushes before it clears. → Observe: only the console-note checks failed (this file did not exist
   yet); `check_dataworks` 59/0. Committed 7bf150c9.
6. Reason: a row per hard variant in ROBOSCENARIOS; check = `check_roboscenarios`. → Observe first: the port#hard row failed.
   The skill-1 stand-in at seed 5 is held at the crossing (its hand lags into the stop zone as a pedestrian steps on). Across
   seeds 1–20 it passes 8 (the base lane, 13). → Act: the row reports the stand-in's pass rate, requires at least one pass, and
   allows only the env's crossing hold as a recorded rule. The check was not loosened to hide the rate. → Observe: 12 passed,
   0 failed. Committed e635f6c6.
7. Reason: the console note and the final gate lines; check = `check_robotrain`, the neighbouring checkers, and the drive re-run
   on the final bundle. → Observe: the lines under **Checkers run** below.

## Checkers run (single checkers; last lines)

- `node tools/check_robotrain.mjs`: ok, 334 checks. The line ends with: hard variants pinned 3 (construction-drilling#hard random 0 / clone 1 / expert 1, gap 0; port-gantry#hard random 0 / clone 0.717 / expert 1, gap 0.283; amr-fleet-routing#hard random 0 / clone 0.05 / expert 1, gap 0.95) · teleop tasks 6
- `node tools/check_roboscenarios.mjs`: 12 passed, 0 failed
- `node tools/check_colearn.mjs`: 46 passed, 0 failed
- `node tools/check_dataworks.mjs`: 59 passed, 0 failed
- `node tools/check_robotics.mjs`: 19 passed, 0 failed
- `node tools/check_imports.mjs`: All 1103 modules call only what they declare or import.

## Seams

- `dxFlush()` (`WebXR/shared/dx-data.js`) → `Promise<n>`. It resolves once every take that was parked or being written when it
  was called is on the store. `n` counts the takes this call saw land. `dxPendingCount()` counts both parked and in-flight
  writes. `dxRevoke()` awaits a flush before it clears.
- `window.__parishTest.dxFlush` and `window.__parishTest.dx = { flush(), pending(), stored() }` (`WebXR/parishes/js/app.js`).
  These are read-only views. **CAPTURE-R3 / WHITEPAPER-R4**: the page proof is the drive output above; figures come from this
  file and `docs/evals/colearn.json`.
- `RT_TASKS[id].label`, and `RT_TASKS` covering `rb-construction-drilling#hard` and `rb-port-gantry#hard`
  (`WebXR/shared/rt-teleop.js`). `rtCompareAll()` now runs six tasks.
- `rbEnv("rb-amr-fleet-routing#hard")`: its observation adds `walkways: [{ column, busy }]` and `blocked: [x, y]`, in the
  variant only. `COL_VARIANTS` has three entries. A variant row in `colearn.json` may carry `bcFilteredShield`; the AMR row
  does.

## Left

- The drive script stays in scratch (`$SP/loop9/rt5/drive.mjs`). The page proof is observed and pasted here, but no gate
  re-runs it. A browser checker that drives the page (opt in → takes → card → revoke) would turn this observation into a check.
- The AMR hard clone completes 0.050 of runs. Closing that gap needs better features (the second crossing's timing ahead, a
  route around the pallet) or more demonstrations. That is a learning problem, left open on purpose and measured as it is.
- No AGENTGYM baseline exists for the hard variants. The AMR variant has no teleop task, because fleet routing is not a
  single-hand pose task.
- A real headset session is still untested (the XR seam is proven with stubbed sessions only).
- The bundles were rebuilt in this worktree (the parishes, instructor and SmartCiti.X dists and `WebXR/dist`). The coordinator
  regenerates them at integration.
