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
