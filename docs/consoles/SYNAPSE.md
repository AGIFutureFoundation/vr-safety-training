# Console SYNAPSE

- Team: SYNAPSE
- Brief: `tools/briefs/robot-agent-brief.md` (with `tools/briefs/console-brief.md`)
- Branch: `claude/vr-ar-safety-training-wkwmve`

## Log

- 23:15 UTC · fast-forwarded to origin, read the brief, the episode/robot/embodiment/sharing/protocol/wallet/passport modules and the dataset tools · — · next: skill registry generator
- 23:24 UTC · `tools/gen_skill_registry.mjs` writes `WebXR/shared/skill-registry.js`: 9 primitives, 633 stations, 8473 nodes; preconditions by a documented keyword rule (166 lockout, 308 PPE); unions matched from certification text (70 unmatched, left null) · (this commit) · next: LeRobot-style and RLDS-style exports
- 23:25 UTC · failed: a doc comment with backticks inside the generator's template literal broke the parse; fixed by escaping them · — · next: exports
