# HIVE-3 memory

- Base 41e41366 (loop 10 round 3). Prefix `h3`/`H3_`, port 9111. Module `WebXR/shared/h3-hive-day.js` (no imports; parishes bundle
  after `oh-hive.js`, before `oh-panel.js` and `hw-hive-world.js`). Checker `tools/check_hive3.mjs` (32 checks, in `check_all`,
  estimated baseline row). Drive `tools/drive_hive3.mjs [port] [outDir]` (rebuild `python3 tools/bundle_webxr.py parishes` first;
  not in the gate).
- Room presence is the room-world's, not the hive's: an agent is in a room while a job holds it at that site, and goes home when
  its last job ends (the hive never moves it home; outdoors it stays). Source of truth: award, move, complete and refused events,
  plus `jobs()`, `agentState()` and `pending()` once when the room opens. The `refused` winner comes from `e.winner`, else from
  the award map: the decline's event names the consent keeper, not the winner.
- The hive's `move` events must not reach the room figures. `hwMountRoomAgents` gives the avatar mount a relay without `move` and
  walks figures between pseudo-sites (`hw-room:spot:<id>`, `hw-room:door:<k>`, `hw-room:exit`) through `spotFor`. A real
  site id returns null from `siteAt`, so a figure is built only on its first placement.
- Budget: `ixrMeasure` counts every texture in `room.group`, hidden or not, so a departed figure has to be removed
  (`aaMountAgentAvatars(...).release(id)`). The cell hall holds 3 figures: 23.92 of 24 MiB on high and 2.98 of 3 MiB on balanced.
  A fourth goes over.
- `check_voices` §10 greps oh-panel.js for `ohLangFor(lang ?? document.documentElement?.lang`. The remembered language is
  therefore assigned to `lang` before that line. `check_hive_world` greps for `mk("span", "oh-label", OH_AGENT_LABEL)` and the
  avatar options ending `route: …, blocked: … });`. Keep those exact.
- `check_imports` reads a call to a parameter named like another module's export (`ohHive`) as a cross-module call. Hence
  `h3SceneHive(makeHive, …)`.
- Settings key `h3-hive-settings-v1` is in `GT_PROFILE_KEYS` (namespaced per account). `auth.js` signOut removes it.
  `h3SettingsAllowed` uses the hive's gate (signed in, not K-12, not the demo, every signal known), not the DATAWORKS adult
  attestation.
- The scene: `window.__parishTest.hiveScene({ seed })` on sf-downtown, signed in; `?hivescene=1` starts it 1.5 s after load.
  27 s of beats plus a 1 s tail. Its own six-job hive (`h3SceneJobs`), with four prologue steps before the clock. Cobot speeds
  must stay under 0.25 m/s or the governor refuses them for over-speed. The physical job arrives at tick 9, after the planner's
  Richland dispatch, so the planner does not bounce between sites.
- The coordinator's rule: any new control is at least 44 px on a 390×844 phone. Panel buttons get `min-height:44px` under
  `(pointer:coarse),(max-width:600px)`. `check_interface` loads the signed-out Orleans page, so the hive panel is measured only
  in drive D.
