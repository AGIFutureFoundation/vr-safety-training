# Console RESCUE

- Team: lands the unmerged work of six consoles interrupted before the history rewrite (CINEMA-2, SCHOLAR-4 / K-12, QUESTMASTER-3, REDWOOD-3, WAYFINDER-2, ATELIER-2) onto the Crescent tree.
- Base: a643c66 (claude/vr-ar-safety-training-wkwmve). Method: `git cherry HEAD <branch>`, read every '+' commit against the current tree, `git cherry-pick -x` what is still wanted, author and committer reset to Claude <noreply@anthropic.com>; generated files (dist, catalog, Guide KB, investor, Unity exports) are never hand-merged: the current tree's copy is kept and the repo's generators rebuild them.
- The four "Snapshot of the uncommitted work…" commits are unreviewed work in progress; each is read file by file and its verdict recorded below.

## Log

- 23:00 UTC · Opened. The worktree sat on 589f0d8 (older than a643c66); reset to a643c66 as briefed. `git cherry` per branch: CINEMA-2 2 commits, WAYFINDER-2 2, QUESTMASTER-3 2, REDWOOD-3 3, ATELIER-2 3, K-12 4.

### CINEMA-2 (worktree-agent-a0401454d0e75ae7d)

- **Picked** 6d5c030 (tools/record_backgrounds.mjs + .json, console log and memory): a standalone tool, collides with nothing.
- **Picked** 913b2a4 (snapshot). Reviewed: six new media files (summit/redwood loops, each within check_home's 1.2 MB budget), re-recorded underwater loop, backgrounds.json gains summit/redwood card, start and track slots; Summit and Redwood start screens mount their slot (`#menu`, `#scr-menu` exist; Redwood's NPC mount is untouched); `trackWorld` counts hosted stations across Deep, Summit, Redwood and Bay World sites (all four carry `stations`); check_home learns the new slots. The homepage's world cards already key their loop by `shot`, so Summit and Redwood gain video with no gen_home change; the Parishes card has no slot and stays a still.
- **Fixed** what the snapshot left half done: check_home's browser check still expected 5 background layers on the homepage; now 7 (hero plus six world cards).
- Regenerated tracks, homepage and bundles. check_home: all pass; check_tracks: all pass (60 pages); check_redwood 395 pass; check_summit 6145 pass; check_budget pass.

### QUESTMASTER-3 (worktree-agent-a50a5f3533288cddd)

- **Picked** 97df3e3 (side-game stage, cosmetics, K-12 gates, Fairway test hook, check_gates). Conflicts in the Bay World, Deep and Fairway apps, bundle_webxr.py and docs/skill-gates.md, all resolved keeping the Crescent tree: the Motor Pool and CT layer imports, the avatar figures (`ctAvatarLoad`), the K-12 kiosks, the NPC mount and the CT assets stay; the stage, cosmetics and K-12 imports are added beside them; the Deep's approach call moves below the landmark lookup as the console wrote it (the old call is dropped so it runs once). skill-gates.md keeps the tree's Treasures (21) and Parishes (35) rows and gains the K-12 row. gate-names-data.js taken from the tree and regenerated.
- **Fixed** a collision the console could not see: the Crescent tree's avatar re-dress (`bwSetAvatar` / `dvSetAvatar` on `ct:avatar` / `gt:profile`) empties the figure, which would have dropped the side-game decals; the listeners now re-apply `qmDressFromLedger` after the swap.
- **Picked** 7036026 (snapshot). Reviewed: decals sized up, a precomputed landmark set for the Deep's per-frame approach check, `holes` on Fairway's test hook, five browser-proof stills, memory and next brief: all consistent with the first commit. Its bundles, Guide KB and bundle_webxr .pyc were taken from the tree and regenerated.
- Regenerated gate names (153), the Guide KB (1488 chunks, 663 KB) and bundles. check_gates 6623 checks, 0 failed (189 gated items); check_parse, check_imports, check_k12, check_fairway, check_guide (266), check_bayworld, check_underwater, check_bayworld_game, check_underwater_game: all pass.
