# ROBOLEARN-10 memory

- Spent held-out ranges: 7121–7180 (protocol 1), 7181–7240 (protocol 2 / retest7), 7241–7300 (protocol 3 / claw3.json,
  retest8). **7301–7360 were declared for round 9 but not used: protocol 4 was not declared** (items 1–3 were not all
  committed by minute 35). They are still fresh; the next console may declare on them (committed first).
- `docs/evals/arena-takes-declared-r9.json` (c3d3be3d) declares the consented-takes TRAINING run: dev seeds only
  (RA_DEMOS → episode seeds 100004–100043), no held-out seed, no evaluation. `check_arena` 12 reads it.
- `ra-takes-train.js` → `raTakesTrain({ store, signals, texts, tasks })`: ra-lm-h from the dev demos plus the learner's own
  receipted takes; `rows.human` and per-take `provenance`; after revoke the hash equals the no-takes model.
- The smartcity headless start: click `#enter-flat` (the intro's "Free explore"), then `#prebrief-start` only, both through
  `element.click()` in `evaluate` (Playwright's actionability click timed out at load 28). Never the guided tour.
- `dxRevoke` headless: no deadlock. Three serial IndexedDB opens (clear's transaction, deleteDatabase, the re-read) at 1–2 s
  each under load, behind the boot's 7 reads. The panel now redraws OFF before awaiting the clean-up.
- Port gantry: no programme station; the reason is `RP_SCENARIO_GAPS["rb-port-gantry"]` (rp-programme-data.js), held by
  `check_robotics_programme`. A station authored to the brief plus a track naming it closes the gap.
- Worktree isolation refuses shell commands with runtime variables next to node/sed; put patches in a scratchpad script file
  and run that file with plain arguments.
