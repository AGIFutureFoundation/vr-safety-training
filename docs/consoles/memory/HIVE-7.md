# HIVE-7 memory (`h7`, loop 10 round 7)

- Base 40d97421 (fast-forward). Branch: the worktree branch. Port 9153. Scratch: `$SP/loop10/h7/` (drive `drive_h7.mjs <repo> <out>
  [tier]`; the briefing trial `try3.mjs <repo>`; the Spanish scan `es-scan.mjs <repo>`; edit script `ed4.py`).
- Ownership this round: `oh-*.js` and `h5-ops-room.js` (and the hive's other `h5`/`h6` modules no other console owns); never `aa-*.js`.
- Names in `h5-ops-room.js` must carry `h5`/`H5_` (`check_hive5` §5 enforces it), so HIVE-7's glow names are `H5_MOOD_GLOW`,
  `h5MoodGlow`, `h5ApplyGlow`; HIVE-7 shows only in comments and `userData.h7Mood` / `userData.h7Base`.
- The figures' glow: high and crowd figures have `userData.parts.glow` (one MeshBasicMaterial with vertex colours, colour white);
  balanced figures have `parts.halo` (MeshBasicMaterial, the accent colour). Each figure builds its own material. The mount sets
  colour = built colour × factor every frame in `animate`.
- `aa-agent-avatars.js`'s `AA_EVENT_TYPES` has no `"mood"`: the figures never received HIVE-6's mood events; the room mount listens
  itself (`source.on("mood")`) and seeds from `hive.mood(id)`.
- Headless ops room: §7's canvas stub (or §8's) must answer `createLinearGradient` / `getImageData`, or the floor skin throws.
- `h5LiveSnapshot` adds the moods fields only for a hive with `moods` on; `check_hive5` §3 pins the old key set for a hive without.
- The briefing's correction: `briefSaid` is set in `brief()`; `briefFix` runs right after each award emit. In the page the learner
  decides (no `decide`), so the look-ahead plays the day with no decisions; an approval in the first minutes can change a first award.
- The page: enter the ops room with `window.__parishTest.hd4.opsRoom()`; the mount is `window.__parishTest.hiveWorld.room()`
  (`moods()`, `briefing`, `standing()`, `counts()`); step with `window.__parishTest.hive.step()`; the console link button is
  `[data-oh="console-link"]`; the tab's moods section is `#h4-moods` with `data-live`.
- Machine load 30–36 through the round; check_hive6 ran in about a minute or two wall time even so.
- Commit trailers: the plain `Co-Authored-By: Claude <noreply@anthropic.com>`.
