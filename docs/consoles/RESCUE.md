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

### WAYFINDER-2 (worktree-agent-ab5bbb7e483472d46)

- **Picked** 07aa8d3 (main landmark on every canvas page, the Treasure Map as a document page, --hm-nav-w on the track pages and the Treasure Map, 44 px phone tap targets, check_seo audits every page for a main landmark). Applied cleanly; its dist and track-page copies were regenerated rather than kept.
- **Picked** cb4bdee (snapshot). Reviewed: the account and language chips join the 44 px phone rule; SmartCiti.X's title and description follow the open station (`SIMS_META_BY_ID` exists in the current app). Kept.
- **Fixed** two things the console never ran into: (1) the Parishes page arrived after WAYFINDER-2 and had no main landmark, which its own stricter check_seo would fail: `parishes.html`'s menu screen is now `role="main"` (one attribute, nothing else of KREWE's or GOLDEN's touched); (2) the 44 px phone chips pushed the shared bar over the worlds' HUD panels (check_mobile: 9 overlaps in Bay World, the Regatta, the Deep, Fairway, Redwood and Summit). The rule now applies only on document pages: `ctlMount` marks the bar `ctl-doc` when the page has a real `<main>` element (homepage, track pages, Treasure Map, 404), so the worlds keep the 32 px bar their HUDs were laid out under.
- Regenerated tracks, homepage and bundles. check_seo 4413 pass; check_mobile 158 pass; check_treasures pass (273 treasures, nothing leaked); check_parishes 6461 pass; check_links: see below.
- check_links was started after this branch but stopped at the 35-minute mark: another console's check_links was loading the machine and a full run did not finish in 12 minutes; left for the coordinator's gate (see "Left" below).

### REDWOOD-3 (worktree-agent-a93031609d954e521)

- **Picked** 5a2e762 (understory colliders from a pure `rwChunkUnderstory` layout; the high-tier triangle budget: per-chunk near/mid/far levels by ring, impostor trees, open trunks; triangles per view roughly halved). rw-world.js had not changed since the branch point; applied cleanly (the tree's `__redwoodTest` hook gains renderer stats).
- **Picked in part** 6acc4f2: the drawn UTV (rw-world.js `vehicle`, placed from `rwPlaceCamera`, re-placed on a drive toggle, guarded until the scene exists) and two stills. **Dropped** its shared lock UI for Redwood (board rows, lock toast, map pins, RW_GATED reshaped with steps/anchor, bundle entries): superseded — the Crescent tree already mounts the shared skill-gates UI in Redwood (1fc8b6d: `qmBoardRows` with a "Skill locks here" box, `qmLockToast` on approach, `qmDrawPin`, the Side games chip) beside GRIOT's NPC mount; landing both would have drawn two lock boxes on every board. The redwood-board-locks still showed the dropped rows and is dropped too.
- **Picked** 1e56868 (next brief, memory, re-taken still); its flat build was left to the bundler; a rescue note in the memory marks the dropped lock-UI lessons.
- Rebundled. check_redwood 395 pass; check_npc 15308 checks pass (Redwood's figures still mount); check_mobile 158 pass.

### ATELIER-2 (worktree-agent-ad894b6deeeb374dd)

- **Picked** 52ebc3a (design system on Summit, Redwood, the Treasure Map, the privacy page and the Cohorts tab; five illustration kinds; check_design covers the new pages). Conflicts: `gen_tracks.mjs` — WAYFINDER-2 and ATELIER-2 both reserved the chip bar's width on the track band (`--hm-nav-w` vs `--at-nav-w`); WAYFINDER-2's is kept, ATELIER-2's duplicate (and its phone rule hiding the brand line) dropped. `instructor/index.html` — ATELIER-2's underline tabs (already 44 px) plus WAYFINDER-2's 44 px phone rule for the row buttons. `privacy.html` — the tree's gen_seo-stamped head (which already links design.css) kept. `treasures.html` — ATELIER-2's pill buttons plus WAYFINDER-2's header, breadcrumb and footer. Homepage, track pages and dist taken from the tree and regenerated.
- **Picked** 1a1153e (before/after captures, README, memory, next brief): documentation only.
- **Picked** 1b4bed9 (snapshot). Reviewed: empty states on the instructor console's Live, Roster and Log views (`.at-empty` exists in design.css; `bus.available` exists in the app), re-taken instructor captures. Kept.
- Regenerated tracks, homepage and bundles. check_design pass (174 pages, 32 contrast pairs); check_seo 4413 pass; check_home pass; check_tracks pass; check_treasures pass.
