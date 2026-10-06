# ROBOTRAIN-2 — deeper two-way robot training (`rt2`, port 9052)

Loop 6 (SmartCiti.X Holodeck · Powered by AGI Corp). Base 22771a9d (the loop-5 integration). Builds on ROBOTRAIN
(`rt-teleop.js`, the four `rt-*` gap stations), VBRIDGE (`vb-*`), COLEARN (`col-learn.js`), ROBOPROG (`rp-programme*.js`),
LA-K12 / LA-COHORTS (`lk-la-lessons.js`, `lco-la-flows.js`) and DATAWORKS (`dx-data.js`). Read `docs/consoles/ROBOTRAIN.md`,
`VBRIDGE.md`, `COLEARN.md` and `ROBOPROG.md` first; this file adds to them.

## What is here

1. **A WebXR controller pose source for `rtMountTeleop`** (`WebXR/shared/rt-teleop.js`).
   - `rtXRPose(inputSource, frame, refSpace, { origin, scale })` — pure over the WebXR shapes: the grip pose (else the target
     ray) mapped into the bench frame by `RT_XR_FRAME`, the gamepad's trigger (button 0), squeeze (1) and e-stop (3 or 4, the
     face buttons). Null without a space or a pose this frame. Nothing is stored.
   - `rtMountTeleop(el, { rig, hand })` gains `xr(frame, refSpace)` (the preferred hand's controller takes the pose over; the
     pad returns after 1.5 s without an XR pose), `source()` (`pointer` / `touch` / `xr`) and touch: pointer events with
     `touch-action: none`, a second finger steps the squeeze, `pointercancel` opens the trigger.
   - **The 3D rig follows the pose live**: `rtFollowRig(rig, obs)` turns the drawn rig's yaw toward the effector and pitches
     the arm child (`userData.pivot`); `rtReleaseRig(rig)` hands it back. **0 new meshes** — the mesh budget is untouched
     (`check_robotics` 19/0, ≤ 8 meshes per site). `rb-world.js` gained `rigNode(id)` on the mount's return and a one-line guard
     in `rbPoseRig` (`userData.rtDriven`), so the sweep yields while a pose drives the rig. The parishes app hands the map's
     first cobot or cell rig to the mount; the app has no WebXR session loop yet, so `teleop.xr(frame, refSpace)` is the seam
     such a loop calls (documented at the mount).
   - Recording still goes only through DATAWORKS' `dxRecorder` (inert unless an adult, signed-in, non-K-12, non-demo learner
     has opted in; local only; revoke deletes). The XR source adds no storage path.
2. **VBRIDGE's agent-jobs panel runs a COLEARN-trained policy as the provider** (`WebXR/shared/vb-colearn.js`, new).
   - `vbColearnProvider({ n, seed, skill, demosFor })` → `policyFor(policyId, env, seed)`: for `vb-colearn-bc-knn` (already a
     registered, current policy in `VB_PROVIDER_POLICIES`) it trains one COLEARN k-NN behaviour-cloning model per task, lazily
     and cached, on clean passes of synthetic demonstrations (labelled "synthetic human stand-in"); every other id returns null
     and vb-bridge.js runs its scripted policies. `demosFor(sc)` lets a caller hand in consented local episodes instead; the
     module reads no store and fetches nothing.
   - `vb-panel.js` takes `policyFor`, runs the preview and the final run through it, says what the provider is on the card, and
     queues two COLEARN-provided jobs (107 cell entry, 108 cobot zone set-up) after the six scripted ones. The parishes app
     mounts it guarded (`window.__parishTest.vbColearn`); `vb-colearn.js` sits in the bundle list after `vb-bridge.js`.
   - **The governor still checks every step**: `vbRun` calls `governor.monitor` per step whatever the provider; every step of
     every COLEARN-driven run carries `info.governor`, and the e-stop halts a COLEARN run (checked).
   - `vbProviderCompare({ jobsPerTask, seed })` — the eval below.
3. **A K-12 version of the agent-supervision station**, "a robot waits for a grown-up's OK", as a Louisiana lesson in the
   `lk-lesson-robot-knows-to-stop` pattern:
   - station `k12-rt-a-robot-waits-for-a-grown-ups-ok` (`tools/k12-data/rt-robot-waits.json` → `gen_k12_station.mjs`,
     registered with `add_station.mjs`): a helper program asks a practice robot for a job, a rule checker with three "no" lamps
     (stop pressed, somebody too close, not on the list) looks first, the grown-up in charge at the OK desk says OK or no, a
     watcher keeps a hand near the stop. Interruptions: the program asks again, faster → say no; a classmate steps inside the
     ring → press stop and wait. No fear framing, no digit in learner text. **eval_content 95** (variety 94, decisions,
     explanation, grounding, standards 6/6, feedback, scene 100; originality 0: 40% structural prose shared with the robot-stop
     station, both from the K-12 generator).
   - `LK_LESSONS` entry `lk-lesson-robot-waits-for-ok` (k12-science, upper primary, three one-idea steps, one check question),
     fixed anchor `la-meta-richland/lmr-workforce-centre` (a campus by a data-centre build: where helper programs live), the
     workforce-centre character fallback on the other Louisiana maps (79 session places, 51 by character);
   - `k12-science` curriculum line (`tools/k12-data/lk-wire.mjs`); `RP_K12` so the station sits in every robotics track's
     awareness level (`check_robotics_programme` ok, 713 checks, coverage 30/30);
   - apply game `lco-apply-ok-desk` ("OK Desk", three rounds) in `lco-la-flows.js`; FlowHub flow `lk-robot-waits-for-ok.json`
     via `gen_lco_flows`; a line in `docs/flowhub.md`; `gen_cg_units`, `gen_lco_guides`, `check_interop --write`, `gen_packs`,
     `export_unity`, `gen_catalog`, `gen_competency_programmes`, `gen_bingo_hazards` re-run; `WebXR/dist/packs/` re-synced the
     way the bundler does it (the page copy and the one changed manifest) so `check_packs` reads the current pack.
4. **`rtCompare` on a second task** — Robot Cell Entry through the pose path. `RT_TASKS` holds the pose → action mapping and
   the scripted stand-in per task; `rtCompare({ scenario })`, `rtRecordTakes({ scenario })`, `rtCompareAll()`.
   - `rtPoseToActionCell(pose, obs)`: the pose is `{ p: [hand x, hand y, body z] }` — the body's place along the approach line
     and the hand's offset; a trigger with the hand on a control (`RT_CELL_CONTROLS`: e-stop, lock hasp, verify meter, gate
     handle, jam point, restart) is that control's action (a light squeeze on the e-stop tests it, a firm one holds it in), a
     body shift walks, standing still waits.
   - `rtScriptedHumanCell`: the expert's intent through a walking body and a reaching hand with lag and tremor (labelled
     synthetic). A footgun met: while the walker is inside the cell the observation reads distance 0, so a body that "settles
     on the approach line" drifted to the cell and produced a stray walk after `remove-lock`; cloned, that walk tied with
     `restart` at the gate and the policy walked in place to the step cap (recorded success 0). The body now holds while
     inside → recorded 1.0.
5. `tools/check_robotrain.mjs` section 7 (XR pose, rig follow, second task, provider, K-12 lesson) and hygiene over
   `vb-colearn.js` and this file. The summary line prints every figure below.

## Evals (before → after)

| Part | Measure | Before (22771a9d) | After |
|---|---|---|---|
| 1 | pose sources for `rtMountTeleop` | 1 (pointer pad) | 3 (pointer, touch, WebXR controller via `rtXRPose`) |
| 1 | rigs that follow the teleop pose live | 0 | 1 per map (first cobot/cell site), 0 new meshes; `check_robotics` 19/0 before and after |
| 2 | providers the agent-jobs panel can run | 2 scripted (expert, lapsing) | 3 (+ COLEARN-trained BC, `vb-colearn-bc-knn`) |
| 2 | seeded safe jobs COMPLETED, scripted expert | 30/30 (3 tasks × 10) | 30/30 |
| 2 | seeded safe jobs COMPLETED, COLEARN-trained provider | n/a (no learned provider) | **28/30** — cell entry 10/10, cobot zones 10/10, AMR fleet 8/10 (2 halted by the governor on a deviation: `conflict` / `yield-missed`, as COLEARN's AMR eval predicts at 0.817) |
| 2 | governor verdict on COLEARN-driven steps | n/a | **413/413** steps (every step) |
| 3 | K-12 versions of the agent-supervision station | 0 | 1, eval_content **95**; Louisiana lessons 8 → **9**; `check_k12` all pass (3352 checks), `check_la_cohorts` ok (2216; 9 flows played to the end), `check_scholar` all pass, `check_cognition` 648/0, `check_packs` all pass (51978) |
| 4 | tasks `rtCompare` covers | 1 | **2** |
| 4 | Teleop Pick-and-Place, 60 held-out seeds, N = 40 | recorded 0.967 / synthetic 0.967 / random 0 / expert 0.983 | unchanged (same figures) |
| 4 | Robot Cell Entry, 60 held-out seeds, N = 40 | n/a | recorded **1.0** (kept 28/40, 812 rows, 29.1 steps) / synthetic **1.0** (kept 24/40, 24.6 steps) / random 0 / expert 1.0 |

Read honestly: the cell-entry task is discrete apart from the walk, so cloning the pose path reaches the expert on every
held-out seed — the pose path costs about four more steps per episode (the hand's lag before each control). The COLEARN
provider's two AMR halts are the governor doing its job on a learned policy that coordinates poorly, which is the point of
having it in front of the robot. No person was measured anywhere here; every "human" is a scripted stand-in labelled as such.

## Cycles

1. Reason: the K-12 agent-supervision station must score 95+ from the K-12 generator; check: `gen_k12_station` + `add_station` + `eval_content --station`. Observed: **95** (240 meshes, 29 interactables, 6/6 standards in scope, variety 94 "run of 3", originality 0 at 40% shared with `k12-rp-how-a-robot-knows-to-stop`). Committed 71918542.
2. Reason: the lesson follows the Louisiana pattern end to end and the five named checkers pass; check: `check_k12`, `check_la_cohorts`, `check_scholar`, `check_cognition`, `check_packs`. Observed first: la_cohorts ok 2216, scholar ok, cognition 648/0; `check_packs` 4 ✗ (k12-science Unity export 28 vs pack 29, packs dist index stale) → `export_unity` + the dist sync → all 51978 pass; `check_k12` 2 ✗ → 1 ✗ → 0: "lesson text states a figure (a digit)" — the digit was the **2 in "ROBOTRAIN-2"** in `programmeWhy`, the station header and the curriculum line lk-wire had already copied → "second loop" → All K-12 checks pass (3352).
3. Reason: a COLEARN policy as the provider completes seeded safe jobs under the governor; check: `vbProviderCompare` + `check_vbridge`. Observed: scripted 30/30, COLEARN 28/30 (AMR 8/10, 2 governor halts), 318 ms; the first "governor checks" count read the audit log, which holds only refusals and stops (32 lines) — replaced by `info.governor` on every step: 413/413; `check_vbridge` 14/0 unchanged.
4. Reason: a pure XR pose and a rig that follows with no new mesh; check: stubs through `rtXRPose` / `rtFollowRig`. Observed: grip (0.2, 1.25, −0.8) → bench [0.2, 0.25, −0.3], trigger 0.8, squeeze 0.3, e-stop from the face button; null without a space; the rig stub's yaw/pitch set and `rtDriven` true, released to 0.
5. Reason: a second task through the pose path trains as well as synthetic demonstrations; check: `rtCompareAll`. Observed first: the scripted walker passes cell entry (31 steps, score 1.79, 0 violations) but the clone of its takes scored **0** (160 steps, walking in place at the gate: a stray walk after `remove-lock` from the body drifting while inside) → the body holds while inside → recorded **1.0** vs synthetic 1.0, random 0, expert 1; teleop unchanged at 0.967/0.967. Committed 582c4516.
6. Reason: one gate proves all of it and the neighbours stay green; check: `check_robotrain` (section 7), `check_imports`, `check_robotics`, `check_robotics_programme`, `check_smartcity`. Observed: see the hand-back (`check_imports` "All 1103 modules call only what they declare or import", `check_robotics` 19/0, `check_robotics_programme` ok 713).

## Seams

- `rtXRPose(inputSource, frame, refSpace, { origin, scale })`, `RT_XR_FRAME`, `rtFollowRig(rig, obs)`, `rtReleaseRig(rig)`,
  `rtMountTeleop(el, { seed, store, signals, reducedMotion, rig, hand })` → `{ start, step, pose, xr(frame, refSpace), source, rig, stop, status }`,
  `RT_TASKS`, `RT_TASK_IDS`, `RT_CELL_CONTROLS`, `rtPoseToActionCell`, `rtScriptedHumanCell`, `rtRecordTakes({ scenario })`,
  `rtCompare({ scenario })`, `rtCompareAll()` — `WebXR/shared/rt-teleop.js`.
- `rbMountRobotics(...).rigNode(id)` and the `userData.rtDriven` guard in `rbPoseRig` — `WebXR/shared/rb-world.js`.
- `vbColearnModel(sc, opts)`, `vbColearnProvider(opts)` → `{ policyFor, models, id, label }`, `vbSafeJobFor(sc, k, policyId, seed)`,
  `vbProviderCompare(opts)`, `VB_COLEARN_POLICY_ID`, `VB_COLEARN_LABEL` — `WebXR/shared/vb-colearn.js` (after `col-learn.js` and
  `vb-bridge.js` in the parishes bundle). `vbMountDispatch(el, { policyFor })`; `window.__parishTest.vbColearn`.
- **WHITEPAPER-R / CAPTURE-R**: the figures above are printed by `node tools/check_robotrain.mjs` (one line) and returned as plain
  JSON by `rtCompareAll()` and `vbProviderCompare()`; the panel's COLEARN jobs are queue entries 7 and 8 (`next()` ×7).
- **A WebXR session in the parishes app** (none yet): call `window.__parishTest.teleop.xr(frame, refSpace)` from the frame callback.
- DATAWORKS rules stand: no ROBOTRAIN-2 file stores, uploads or fetches anything; the recorder path is unchanged.

## Left

- The parishes app has no WebXR render loop, so the controller source is exercised with stubs (the checker) and the pad in the
  page; a headless browser drive of the pad with the rig following (port 9052) was not done in this hour.
- The teleop pad drives the pick-and-place task only; the cell-entry pose path runs in the eval and the API, not on the pad.
- The COLEARN provider trains on synthetic demonstrations in the page; wiring `colLocalDemos` through `demosFor` (consented,
  local, adult-only episodes) is a one-line follow-up once a learner has takes.
- `check_smartcity` over all 733 simulators was started at the end of the hour (see the hand-back for its line).
- The generated dist bundles (parishes, smartcity) are rebuilt by the coordinator at integration; only `WebXR/dist/packs/` was
  re-synced here, because `check_packs` reads it.
