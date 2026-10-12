# HIVE-5 memory (`h5`, loop 10 round 5)

- Base e252b25f (fast-forward). Branch: the worktree branch. Port 9132. Scratch: `$SP/loop10/h5/` (drives `drive_h5.mjs`,
  `drive_h5b.mjs`; the before measure `measure-ops.mjs`; the quiet-minute scan `quiet.mjs`).
- The ops room is `hd4-hive-ops`; `hwSyncRoom` hands it to `h5MountOpsRoom` (h5-ops-room.js). The robot rooms are unchanged.
- Seven standard AGENT-AVATARS figures in the ops room make 9,078 triangles on high (over IX_BUDGET 6,000). `h5LiteFigure` rebuilds
  each primitive part coarser (caps in `H5_LITE_CAPS`): 1,008 → 408 triangles a figure; the room with seven speaking figures is
  88 / 4,878 / 21.58 MiB on high and 84 / 4,190 / 2.77 MiB on balanced (label scale 0.35). The phone builds no figures.
- "At its console" = holds no job (h3RoomPresence's jobs). In the page the seven stand together at quiet minutes (e.g. 279 of
  seed 1 in the drive); the headless replay's quiet minutes differ from the page's (the page's governor runs with its own context:
  seed-1 minute 259 is quiet headless, busy in the page). Pick the minute in the page, not from a headless scan.
- The screens repaint at most every 400 ms after a hive event, on the room's own canvases (0 bytes added). Words on high only.
- `ohHive({ homeward })` is off by default (check_hive4 §1's digest holds); the panel turns it on. Home moves carry `home: true`, no
  job id, no chain line. Seed 1: 89 of 89, completed 144 with and without.
- The console link: `H5_LIVE_CHANNEL` BroadcastChannel, opt-in per visit, never stored; the tab (`h4-hive.js`) reads with
  `h5LiveReader` and posts nothing. Snapshots post on a microtask after a step's events (a synchronous batch of steps posts once).
- Commit trailers: the plain `Co-Authored-By: Claude <noreply@anthropic.com>` (no model name, per the brief's rule).
