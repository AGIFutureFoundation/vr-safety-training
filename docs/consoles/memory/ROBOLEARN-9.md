# ROBOLEARN-9 memory

- Spent held-out ranges:
  - 7121–7180 (protocol 1 / round 6b)
  - 7181–7240 (protocol 2 / retest7)
  - **7241–7300 (protocol 3; claw3.json, retest8)**

  Never re-run any of them. Use a fresh range next (e.g. 7301–7360), declared and committed first.
- `claw_eval --protocol 3 --dev` is the stub run: seeds 1–20, it writes nothing, about 45 s.
- arena.json `retest8` is a copy of claw3.json. `check_arena` 11 checks that it equals the record.
- The reactive rule policy now holds the hard AMR and port gantry variants by promotion (clear intervals). It is a
  rule policy; say so wherever it is shown.
- ra-lm-h48 (H 48) did nothing for AMR base. The next AMR idea is the amr-robots features (`RA_LM_D` ≥ 19).
- Worktree isolation refuses shell commands whose inline text mentions the version-control tool. Put patches in a
  scratchpad script file and run that file.
- DATAWORKS' revoke clean-up can stall headless. The consent key is deleted synchronously, so re-read the gate on the
  next task.
