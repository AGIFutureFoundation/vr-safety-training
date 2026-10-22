# MOODS memory (`md`, loop 10 round 9)

- Base 61d85871 (fast-forward, confirmed). Branch: the worktree branch. Port 9172. Scratch: `$SP/loop10/md/` (edit scripts `ed1-3.py`,
  checker outputs, `drive-after.txt`, the stills). This console owned the whole mood seam: `aa-*`, `oh-*`, `h5-*`, `h6-*`,
  `h3-hive-day.js`, and the page's scene lines in `app.js`.
- The page has two hives: the **panel's** (`window.__parishTest.hive.hive`, moods on since HIVE-6) feeds the ops room; the **scene's**
  (`h3SceneHive`, moods on since HIVE-8) is paced by `h3SceneRelay`, whose `mood(id)` is the released mood. Both the glow
  (`h5MountOpsRoom`, from `source.mood(id)`) and the posture (`aa` mount's `seedMood` via `moodOf`/`aaMoodOf`) seed from the same source,
  so posture = glow from the first frame (AVATARS-HD-5 did the seeding; this round measured it at the first frame and at minute 60).
- `hiveScene({ seed, hold })`: `hold` is a beat id; once that beat has played the clock stands still (`S.held`, `S.heldAt`; `S.t0` is
  re-based each tick) until `hiveSceneResume()`. The hold check lives in the beat loop (a slow frame can jump two beats). Without `hold`
  the code path is the old one (`check_hive6` §11 regex). `hiveSceneState()` now carries `hold`, `held`, `moods` (relay) and
  `room.posture`.
- The concerned cue (`aaHdPose`): tablet agents (Orrin, Ivo, Quen) lower the tablet (`AA_HD_MOOD_POSE.tabletLow` shoulder −0.08,
  elbow −0.5); the others clasp (`concernedClasp` 1, the formal agents' rest pose). Measured in `check_agent_avatars` §9m on the built crowd
  figure: wrists move 0.22–0.48 m, 26 px at 8 m (1080 px, 60°). The right arm's stop pose is untouched (it lerps to AA_HD_STOP_POSE).
- Bash here refuses heredocs and loops over variables: write Python edit scripts with the Write tool into the scratchpad and run them with
  `python3 -I`. `/usr/bin/time` is absent; time with `date -u +%H:%M:%S`.
- In software rendering a 1920×1080 screenshot takes 30–150 s; the scene's `hold` is what makes a still of a mood possible.
- Commit trailer: `Co-Authored-By: Claude <noreply@anthropic.com>`. Never `check_all`; never commit `checkers-last.json`.
