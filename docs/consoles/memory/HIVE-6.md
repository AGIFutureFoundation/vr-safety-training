# HIVE-6 memory (`h6`, loop 10 round 6)

- Base 230105b7 (fast-forward). Branch: the worktree branch. Port 9142. Scratch: `$SP/loop10/h6/` (drive `drive_h6.mjs <repo> <out>
  [A,B] [tier]`; base digests `digest.mjs`; tries `try.mjs`, `dbg.mjs`; edit scripts `ed*.py`).
- Base digests (events JSON, FNV-1a 64): default seed 7 703aa91da7bb9439; the panel's day (exchanges, memory, variety, homeward)
  seed 7 533938515253653d, seed 1 03f3d7a40c26af91. Pinned in `check_hive6` §1.
- `ohHive({ moods, briefing })` off by default. Moods live in `h6-moods.js` (imports nothing; listed before `oh-hive.js` in both
  bundles). The tracker hooks `emit()` (after the listeners) and the start of `step()` (mood expiry). `heldBy` must skip a job with
  `doneT` set or a REJECTED phase: the complete event fires before the job's status changes.
- The briefing's look-ahead is a second `ohHive` with the same seed, jobs, options and `decide` (say: () => "", no audit). Without
  the same `decide` the first awards drift (a stand-in approval re-queues a job ahead of others).
- A job refused for naming a physical robot and approved keeps its job id when re-queued: trace from the latest award.
- Safety kinds never carry a mood phrase, and their mood voice is never faster or higher (`H6_SAFETY_KINDS`).
- The page: the ops room is entered with `window.__parishTest.hd4.opsRoom()`; the mount is `window.__parishTest.hiveWorld.room()`
  and carries `briefing`. The hive starts at minute 0 on load (signed in), so entering at once holds the briefing.
- Balanced ops screens: 128 × 64 cells, 256 × 64 wall; the compact cards add 0 bytes. More pixels would not fit 3 MiB.
- Commit trailers: the plain `Co-Authored-By: Claude <noreply@anthropic.com>`.
