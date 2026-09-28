# Console VIRTUALS — SmartCiti.X on the Virtuals agent platform

Team: VIRTUALS · Brief: `tools/briefs/virtuals-brief.md` with `console-brief.md` · Branch: `claude/vr-ar-safety-training-wkwmve`

Facts rule for this console: nothing on-chain, nothing signed, nothing sent; no wallet, key, secret, seed phrase or wallet address; no price, supply, fee, valuation or return for `$Citi`; the only verifiable source is the owner's `acp-cli` repository (read-only), and anything about the wider Virtuals OS is marked "to verify against the official docs".

- 02:41 UTC · Fast-forwarded to the branch of record (947f38b); read the virtuals and console briefs · next: read acp-cli (README, SKILL.md, docs, commands, lib) and the platform files.
- 02:43 UTC · Read acp-cli (README, SKILL.md, tokenization, headless deployment, migration, offering/provider/job/events/skill commands, walletGate) and the platform files; wrote `docs/virtuals/strategy.md` — four provider offerings, three buyer uses, the acp-cli concept map with README command names only, tokenization as acp-cli describes it with no figures, milestones V0–V5 and a risk register · next: the `agents/smartcitix/` package.
- 02:46 UTC · Built `agents/smartcitix/`: agent.json (extends Foreman, $Citi as a label only), four offerings in acp-cli's offering shape with null prices, SKILL.md, hermes/ profile and tool manifest (conventions to verify), runbook with README commands and placeholders, acp-commands.json vendored from the README · next: the local provider stub.
- 02:48 UTC · Wrote `tools/smartcitix_provider.mjs`: four handlers (evaluateStation via robot.js runEpisode, exportDatasetSlice via export_dataset.mjs, curriculumQuery and composeLessonJob), acp-cli-shaped job events, schema validation; three dry runs produce deliverables (electrical passes at 3 stars; 29 LeRobot frames = 29 RLDS steps; 8 stations for electrical-first-period) · next: `tools/check_virtuals.mjs` in check_all.
