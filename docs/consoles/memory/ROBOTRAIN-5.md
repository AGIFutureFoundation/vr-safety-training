# ROBOTRAIN-5 memory (loop 9, `rt5`, port 9081)

- Base 8a16ec16 (fast-forward). Branch `worktree-agent-a15b3981572de9ec8`. Commits: ad49f46b (flush waits for in-flight writes,
  page handles), bf353214 (RT_TASKS 4 → 6, a label per task), 1c991858 (`rb-amr-fleet-routing#hard`), 7bf150c9 (settle and revoke
  races), e635f6c6 (roboscenarios rows), 5543ab5c (section 9, console note, roadmap), 1807e828 (bundles), e9a31355 (shared
  export), 11abc861 (`tools/drive_robotrain_page.mjs`).
- The page-level proof holds in the built page: `python3 tools/bundle_webxr.py parishes && node tools/drive_robotrain_page.mjs 9081`.
- Footguns met:
  - `dxFlush` awaited only parked writes. A write the idle slot had started was missed, and so were writes the idle slot started
    while the flush awaited an earlier one. Use `settle()` and the in-flight set.
  - `dxRevoke` must flush before it clears the store.
  - The vb panel queue cycles. Step `next()` to the job whose `request.policyId` is `vb-colearn-bc-knn`, rather than counting 7.
  - The onTake re-read had to re-render the Me tab's count (`npDxPanel.render()`).
  - In the AMR variant, delivered robots stay parked at the drop-offs, so a blocked cell in a drop-off aisle walls a goal in.
    Keep the blocked cell on the pick-up side (x 1–2).
  - A variant's random draws must come after the base draws, and its extra fields must appear only in the variant's
    observation. That keeps the base `colearn.json` rows byte-identical.
  - The roboscenarios hygiene regex forbids several model-family words in `rt-teleop.js`.
  - `check_bridge` needs `node tools/export_shared.mjs` after any change to the scenario data.
  - The worktree guard refuses heredocs that write outside the worktree. Write scratch scripts with the editor and run them
    with `python3 <file>`.
