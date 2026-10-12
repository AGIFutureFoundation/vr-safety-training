# ROBOTRAIN-2 memory (loop 6, `rt2`, port 9052)

- Base 22771a9d (fast-forward). Branch `worktree-agent-a0ef1cd327cb1de09`. Commits: 71918542 (K-12 station), 582c4516 (lesson
  wiring, vb-colearn.js, rt-teleop.js XR/rig/cell task), then the checker + docs commit.
- Station `k12-rt-a-robot-waits-for-a-grown-ups-ok` from `tools/k12-data/rt-robot-waits.json` (eval_content 95). Lesson
  `lk-lesson-robot-waits-for-ok` anchored at `la-meta-richland/lmr-workforce-centre`; game `lco-apply-ok-desk`; flow
  `lk-robot-waits-for-ok`. Generators re-run: lk-wire, gen_catalog, gen_lco_flows, gen_cg_units, gen_lco_guides,
  check_interop --write, gen_packs, gen_robotics_programme, gen_competency_programmes, gen_bingo_hazards, export_unity.
- `vb-colearn.js`: `vbColearnProvider().policyFor` for `vb-colearn-bc-knn`; `vbProviderCompare` → COLEARN 28/30 vs scripted
  30/30 (AMR 8/10, governor halts), governor verdict on 413/413 steps. Panel queue entries 107/108 use it.
- `rt-teleop.js`: `rtXRPose`, `rtFollowRig`/`rtReleaseRig` (rb-world `rigNode(id)`, `userData.rtDriven` guard), `RT_TASKS` with
  `rb-cell-entry` (`rtPoseToActionCell`, `rtScriptedHumanCell`), `rtCompareAll`: teleop 0.967/0.967, cell 1.0/1.0.
- Footguns met: a digit anywhere in K-12 learner text fails check_k12 — "ROBOTRAIN-2" counts (write "second loop"); lk-wire is
  idempotent so a fixed `programmeWhy` must also be fixed in curricula.js by hand; the governor's audit log holds only refusals
  and stops (count `info.governor` on steps instead); a scripted walker that settles on `-obs.distance` drifts into the cell
  while inside (distance reads 0) and the clone then walks in place at the gate; `check_packs` reads `WebXR/dist/packs/`, which
  the bundler copies from `WebXR/packs/flat/index.html` and the manifests (sync those two by hand, no full rebundle).
