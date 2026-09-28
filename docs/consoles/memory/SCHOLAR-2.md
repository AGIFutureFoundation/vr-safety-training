# SCHOLAR-2 memory — read this first

- Every K-12 station is the same scene and the same thirteen-step shape; only the words change. Author a JSON in `tools/k12-data/`, run `node tools/gen_k12_station.mjs <json>`, `node tools/add_station.mjs <id>`, then `node tools/k12-data/wire.mjs <id> <programme> bay:<site> "<why>"` (or `deep:<site>`). Never hand-edit a generated `.js`; edit the JSON and regenerate.
- check_k12 fails on ANY digit in learner-facing prose (titles, cues, whys, notes, hazards, interrupts, badge note, tagline). Write "twice", "a quarter", "one out of". Sequence ordinals "1 · " are generated and allowed.
- The originality score (eval `org`) is low for every K-12 station because the layout, badges and support line are shared; the total still lands 95–96. Vary the check-in `why` per station to help it.
- The previous team's generator was never committed; commit tooling in the same commit as its first output.
- The worktree sandbox refuses compound shell commands that mix heredocs and git; write files with the editor, then run git on its own line.
