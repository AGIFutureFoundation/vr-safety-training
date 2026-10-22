# AVATARS-HD-5 memory

- Base a10f1ff8 (loop 10 round 8). Prefix `aa`/`AA_` (files), console prefix `ah5`, port 9163. Edited `aa-agent-avatars.js`, the
  ops-room mount line and the aa import line in `app.js`, `check_agent_avatars.mjs` (§9k regex, new §9n), and added the drive
  `tools/drive_avatars_hd5.mjs`. Did not edit `oh-*`, `h5-*`, `h6-*` (HIVE-8) or `rhd-*` (ROBOTS-HD-3). ROBOTS-HD-3's commits
  2085508a and c1d96403 came in by a merge to measure the combined robot rooms (their files, unedited here).
- Moods: the aa mount's posture only changed on a `mood` event, so a figure built mid-day stood calm while HIVE-7's glow (h5MountOpsRoom)
  seeded from hive.mood(id). Seed 1, entries at 0/150/300: 22 of 6,370 figure-steps disagreed. Fix: `aaMoodOf(source, id)` (hive.mood or a
  relay's `.hive.mood`, guarded) and `seedMood(f)` in addAgents and attach, from a `moodOf(id)` option or the attached sources. A seeded mood
  is not pushed to moodLog, so §9m's "log = mood events" stays true. The h5 relay had no mood(); HIVE-8 added one in 96bda3b0. The page's
  ops mount also passes `moodOf: (id) => aaMoodOf(h3Scene?.relay ?? window.__parishTest?.hive?.hive, id)`; either path is enough.
- The panel's hive (ohMountHive) runs with moods on since HIVE-6. In the page, `window.__parishTest.hive.hive.mood(id)`; the ops room's
  mount object is `window.__parishTest.hiveWorld.room()` with `.moods()` (glow) and `.avatars.state(id).mood` (posture).
- Robot rooms: the only hidden meshes under the six rooms at a10f1ff8 were ROBOTS-HD's floor zones (shown when the learner is inside 6 m)
  and the figures' talk lights. Neither is hidden for good, so the cap must keep counting them. AH4's 7,450 built against 6,324 drawn was
  frustum culling. The rule agreed with ROBOTS-HD-3: the cap counts every mesh that can be drawn (as ixrMeasure counts); a mesh hidden for
  good leaves the group. ROBOTS-HD-3 trimmed the room AMR (996 → 484) so the warehouse's own triangles fit three crowd figures.
- Ops room: `aaRoomHeadroom(parent, agents, cap)` replaces the constant 414 for the nearest-console choice. As built it equals 414.
- Bash here refuses loops over variables and `cd x && complex`: write a python runner in the scratchpad (`$SP/loop10/ah5/runchecks.py`).
- The §9 voice-timing lines are wall-clock bound and fail once in a while under a drive (158 of 159 words); rerun alone.
- Commit trailers carry "Co-Authored-By: Claude" with no model name.
