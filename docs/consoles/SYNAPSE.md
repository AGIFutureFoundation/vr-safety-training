# Console SYNAPSE

- Team: SYNAPSE
- Brief: `tools/briefs/robot-agent-brief.md` (with `tools/briefs/console-brief.md`)
- Branch: `claude/vr-ar-safety-training-wkwmve`

## Log

- 23:15 UTC · fast-forwarded to origin, read the brief, the episode/robot/embodiment/sharing/protocol/wallet/passport modules and the dataset tools · — · next: skill registry generator
- 23:24 UTC · `tools/gen_skill_registry.mjs` writes `WebXR/shared/skill-registry.js`: 9 primitives, 633 stations, 8473 nodes; preconditions by a documented keyword rule (166 lockout, 308 PPE); unions matched from certification text (70 unmatched, left null) · (this commit) · next: LeRobot-style and RLDS-style exports
- 23:25 UTC · failed: a doc comment with backticks inside the generator's template literal broke the parse; fixed by escaping them · — · next: exports
- 23:31 UTC · LeRobot-style (`lerobot/`) and RLDS-style (`rlds/`) layouts in `tools/export_dataset.mjs` via `tools/lib/dataset_formats.mjs`, every episode labelled (station, programmes, union, hazards, interruptions, source app, licence, consent, crew-tag hash only) · f1262dc · next: eval and baseline
- 23:37 UTC · `eval_dataset.mjs` validates both layouts (reported, not scored); `robot_train.mjs --from-lerobot` per-primitive baseline; `check_dataset_tools.mjs` covers both · b6d0e99 · next: roadmap, agent definition, checker
- 23:40 UTC · failed: check_agent imported eval_dataset.mjs, whose main exits without a path; fixed by listing the engine's step kinds in the checker. Failed: milestone heading regex missed "## 6. Milestones"; fixed · — · next: commit and gate
- 23:44 UTC · `docs/agent-roadmap.md` (Virtuals section from the adapter and public knowledge, marked unverified), `agents/foreman/agent.json` draft, `tools/check_agent.mjs` in check_all · 05351ab · next: gate
- 23:46 UTC · default export: 294 episodes; lerobot 294 episodes / 36722 frames / 49 tasks; rlds 294 episodes / 36722 steps · — · next: check_all
- 00:20 UTC · failed: first check_all run had check_investor stale (checker count now 62; fixed by running gen_investor, 748c249) and check_ui losing its browser under machine load (passes alone, 442 checks); rerun clean · 748c249 · next: hand-back
- 00:40 UTC · HAND-BACK · "All 62 checkers pass." · exports: lerobot 294 episodes / 36722 frames / 49 tasks, rlds 294 episodes / 36722 steps (default run) · eval scores unchanged (formats reported, not scored); both layouts structurally valid
