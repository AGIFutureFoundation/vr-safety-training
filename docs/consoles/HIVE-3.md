# HIVE-3 (`h3`, port 9111): the hive's day, remembered, in two languages

Loop 10, round 3. Base 41e41366 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This console builds on round 2's
HIVE-IN-WORLD (the hive's agents in the robotics rooms) and VOICES (on-device voices, the hive in Spanish).

Agents are software and say so: every figure keeps the "software agent · <role>" label (in Spanish, "agente de software"),
hologram tint and visor. Nothing here calls a model or the network, nothing listens, and voice stays on-device (`localService`
true) and off until the learner turns it on. Robots are simulated, and the governor's rules stand: the e-stop comes first and
the physical path stays disabled. Procedural assets only.

## What is here

| File | What |
|---|---|
| `WebXR/shared/h3-hive-day.js` (new) | Four pieces, no imports, no network. **Who is in a room:** `h3RoomPresence`, `H3_ROOM_FIGURES` (3). **Remembered settings:** `h3Settings`, `h3SettingsAllowed`, `H3_SETTINGS_KEY`. **The panel in Spanish:** `H3_PANEL_TEXT`, `h3PanelText`, `H3_ROLES_ES`, `h3RoleIn`, `H3_CHIPS_ES`, `h3ChipIn`. **"A day in the hive":** `H3_SCENE`, `H3_SCENE_PROLOGUE_STEPS`, `h3SceneJobs`, `h3SceneHive`, `h3SceneRelay`. Every top-level name carries `h3`/`H3_`. |
| `WebXR/shared/hw-hive-world.js` | `hwMountRoomAgents` now follows the hive: an agent sent to the room's site for a job comes in through the door to a free agent spot (its role's first), else a place inside the door, and walks out through the door when the job ends or the hive sends it elsewhere. Agents homed there leave while a job holds them elsewhere and come back when it ends. At most three figures at once; a figure that has walked out is released. The mount adds `presence`, `visitors()`, `waiting()`, `leaving()` and `log()`. |
| `WebXR/shared/aa-agent-avatars.js` | `release(id)`: takes one figure out and disposes its meshes and canvases. The agent stays listed, off the map, and gets a new figure on its next arrival. |
| `WebXR/shared/oh-panel.js` | The panel's text, the role sentences and the chips follow the hive's language. A language button switches it: the choice is kept and the page reloads. `settings` (h3Settings) remembers voice, "supervise every job" and the language. On a phone (coarse pointer or 600 px wide or less), buttons are at least 44 px. |
| `WebXR/shared/profiles.js` | `h3-hive-settings-v1` joins `GT_PROFILE_KEYS`, so it lands on `h3-hive-settings-v1::id-<digest>` for a signed-in account. |
| `WebXR/shared/auth.js` | `Auth.signOut` removes the hive settings for that profile before the session key goes. |
| `WebXR/parishes/js/app.js` | Hands the panel `h3Settings({ storage: gtStorage(), signals: dxReadSignals(), profile: gtProfile(), demo })` (`window.__parishTest.hivePrefs`). Adds the scene (`window.__parishTest.hiveScene`, `hiveSceneStop`, `hiveSceneState`, `hiveSceneDone`, `hiveSceneLast`, `?hivescene=<seed>`). While the scene plays, the room follows the scene's paced hive. The outdoor avatars take the scene's two outdoor points through `spotFor`. |
| `tools/check_hive3.mjs` (new) | 32 checks and the eval lines below. Listed in `check_all.mjs`; `docs/perf/checkers-baseline.json` carries an **estimated** row. |
| `tools/drive_hive3.mjs` (new) | The headless drive of the built page (not in the gate), sections A–D below. |
| `tools/bundle_webxr.py` | `h3-hive-day.js` goes in the parishes bundle after `oh-hive.js`, before `oh-panel.js` and `hw-hive-world.js`. |

## Evals (before → after)

| Measure | Before (41e41366) | After | Source |
|---|---|---|---|
| Job-moved agents shown in the rooms on their move (seed 1, 480 steps, six rooms, high + balanced) | **0 of 108**, measured: the base `hwMountRoomAgents` over the same day | **108 of 108**. 104 came in through the doorway, and 4 were still walking out when the hive sent them back, so they turned round inside. None had to wait outside. In the page, 1 of 1: the planner came in at step 24 and walked out at step 30. | `$SP/loop10/h3/before-visitors.txt` → `check_hive3` §1; drive A1 |
| A visitor walks out when its job ends / when the hive sends it elsewhere | never shown | **80 of 80** / **88 of 88** | `check_hive3` §1 |
| Rooms inside `IX_BUDGET` and `IXR_TEX_BUDGET` | 18 of 18 room-tiers, measured once (HIVE-IN-WORLD) | **5,760 of 5,760** room-steps through a whole day. Worst room: the cell hall with 3 figures (table below). In the page: worst 23.92 MiB over 42 steps. | `check_hive3` §1; drive A1 |
| Settings remembered across a reload for a signed-in adult profile | not remembered (HIVE-IN-WORLD and VOICES Left) | **3 of 3** (voice, supervise every job, language), under `h3-hive-settings-v1::id-<16 hex>` only. Nothing un-namespaced, nothing in sessionStorage. Another profile reads nothing. Sign-out clears them. | drive A3; `check_hive3` §2 |
| Hive settings stored for demo, K-12 and signed-out sessions | n/a (no setting) | **0**: 6 of 6 gate cases headless (unknown signals refused too); 3 of 3 sessions in the page, with no panel and no key | `check_hive3` §2; drive B |
| Spanish UI strings in the hive panel | **0 of 20**: the panel text was English only (VOICES Left) | **20 of 20**. Role sentences 7 of 7, chips 8 of 8. In the page, the Spanish panel shows 0 English UI strings, 7 cards say "agente de software", `lang` is es-US, and the review note shows. English is unchanged. | `check_hive3` §3; drive A4 |
| Talk light with voice on, room figures (stubbed `speechSynthesis`: one local and one network voice per language) | not driven (HIVE-IN-WORLD Left) | **15 of 15** lines on from onstart to just before onend; off after the agent's last line **14 of 14** | drive A2 |
| Network voices chosen | n/a | **0 of 94** utterances | drive A2 |
| "A day in the hive" runs end to end | no scene | **12 of 12** beats in order. The scene is 27 s long and the run took 28.1 s on its clock (a 1 s tail). Page errors 0, off-host requests 0. Two runs of seed 1 give the same 69 events. The story holds for 5 of 5 seeds. | drive C; `check_hive3` §5 |
| Hive panel buttons ≥ 44 px at 390×844 with touch (signed in) | not measured at base (5 px padding, 13 px font) | **5 of 5**, the new language button 149×44 px; no sideways scroll | drive D |
| `check_omega_hive` / `check_voices` | 15 / 0, 10 / 0 | **15 / 0, 10 / 0** | single runs |

**The worst room, measured** (`check_hive3` §1, the vendored three.js, the shell signs counted):

| Cell hall | Meshes | Triangles | Textures |
|---|---|---|---|
| High, 2 agents (HIVE-IN-WORLD) → 3 figures (here) | 38 → 47 (of 120) | 3,704 → 4,712 (of 6,000) | 23.50 → 23.92 MiB (of 24) |
| Balanced, 2 → 3 figures | 38 → 47 | 3,704 → 4,712 | 2.87 → 2.98 MiB (of 3) |
| Low (phone) | no figures | unchanged | unchanged |

A fourth figure would take the cell hall over 24 MiB on high and over 3 MiB on balanced (about +0.42 / +0.10 MiB each). This is
why `H3_ROOM_FIGURES` is 3. In the seed-1 day no room ever needed a fourth.

**Read honestly.**
- The room-world sends an agent home when its last job ends. Outdoors, the figure still stays where the hive last moved it,
  because the hive itself has no "go home" move. The two views differ there on purpose: the brief asks that a visitor leave the
  room when its job ends.
- The talk light comes on when the line arrives (the clock window), which can be before the voice's onstart: up to the stub's
  20 ms. From onstart to onend it stays on, and it goes off at the agent's last onend. Between two lines from the same agent it
  stays on through the gap. "Exact" here means on for the whole of every voiced line and off afterwards. It does not mean off
  until onstart.
- The settings gate is the hive panel's own gate: signed in, not K-12 and not the demo, with every signal known. It does not
  need the DATAWORKS adult attestation, which is about data collection. "Adult profile" here means a signed-in, non-K-12
  profile.
- The scene is scripted. The approval is made by the scene and stands in for the learner's click; the caption bar says
  "You approve". Every caption fact (job ids, bids, the reason text, steps) comes from the scene hive's own events, and the
  scene writes nothing to the learner's governance registry.
- The Spanish is machine-assisted and needs a native speaker's review. The panel says so in Spanish. Site names and task
  labels stay English, as they do in VOICES' Spanish lines.

## "A day in the hive" (for the reel)

- **Start:** signed in on sf-downtown, call `window.__parishTest.hiveScene({ seed: 1 })`, or open
  `parishes.html?parish=sf-downtown&hivescene=1`, which starts 1.5 s after load. It needs a signed-in, non-K-12, non-demo
  session, because the hive itself is gated. Await `window.__parishTest.hiveSceneDone` for the record (beats, captions, metrics).
- **Duration:** 27 s of beats plus a 1 s tail. 0 s intro in the cell hall · 0.5 s a job arrives · 2.5 s bids · 4.5 s the award
  (Brann, maintenance planner) · 6.5 s Brann walks out of the cell hall's door · 10 s outside, from the building's door, towards
  the street · 14 s the governor refuses a request with a person 1.2 m from the robot (reason captioned) · 17.5 s a job naming the
  physical robot asks the learner · 20 s "You approve: a simulated run only" · 21 s Brann walks back into the cell hall · 24 s it
  runs on the simulated robot (physical dispatches 0) · 27 s the audit-chain line.
- **Deterministic:** the same seed gives the same events and words, and the camera follows the figures' deterministic walks.
  Stills from the drive are in `$SP/loop10/h3/scene-*.png` (960×540).

## Cycles (reason → act → observe)

1. **Visitors in rooms.** The room showed only homed agents. A presence tracker now follows award, move, complete and refused,
   and the room mount stands visitors through the door. Check: `check_hive3` §1. Observed: 108 of 108 shown, but "through the
   door" was 104 of 108.
2. **Turn-backs.** The 4 misses were agents sent back while they were still walking out. They turn round inside, which is
   intended, so the check now counts them apart. Observed: 104 of 104, plus 4 turned back.
3. **Departure counting.** The leave counts read 80 of 254 and 88 of 314 because the checker counted each pending departure
   every step. It now counts each once. Observed: 80 of 80 and 88 of 88. Committed as b7c4cd66.
4. **The scene's jobs.** Seeded runs showed cobot jobs refused for over-speed (the cobot limit is 0.25 m/s) and the planner
   bouncing between sites. Lowered the speeds and moved the physical job to tick 9, after the planner's own dispatch. Observed:
   the story holds for seeds 1, 2, 3, 7 and 42.
5. **Settings and the Spanish panel.** Wired `h3Settings` and the text tables into the panel. `check_voices` then failed
   section 10, whose regex looks for the page-language read. Restructured the code to keep that read. Observed: 10 / 0.
6. **The built page.** Rebuilt and ran `drive_hive3`. Observed: every step passes on the first run, with 0 page errors and 0
   off-host requests. The stills showed the room toast over the scene, so the scene now hides it. Committed as f33130a5.
7. **The coordinator's 44 px note.** The new language button used the panel's 13 px button rule. Panel buttons now have a
   44 px minimum on a phone. Observed: `check_interface` 20 / 1, and the one failure is the known `me:vc-voice-character:244x36`
   (fixed on the head as d5054257).
8. **Neighbour checkers.** `check_imports` flagged `ohHive()` called inside `h3SceneHive`, and `check_hive_world` flagged two
   wiring patterns. Renamed the parameter to `makeHive` and restored both patterns. Observed: imports 1,117 ok, hive_world 35 / 35.

## Checkers (single runs)

- `node tools/check_hive3.mjs`: all 32 checks pass.
- `node tools/check_hive_world.mjs`: all 35 checks pass.
- `node tools/check_agent_avatars.mjs`: all 70 agent-avatar checks pass.
- `node tools/check_omega_hive.mjs`: 15 passed, 0 failed.
- `node tools/check_voices.mjs`: 10 passed, 0 failed.
- `node tools/check_imports.mjs`: all 1,117 modules call only what they declare or import.
- `UX_PORT=9111 node tools/check_interface.mjs`: 20 passed, 1 failed. The failure is `me:vc-voice-character:244x36`, which is
  already fixed on the integration head as d5054257; per the coordinator, ignore it.
- `python3 tools/bundle_webxr.py parishes && node tools/drive_hive3.mjs 9111 $SP/loop10/h3`: all steps pass (A1–A4, B, C, D),
  page errors 0, off-host requests 0 (`$SP/loop10/h3/drive-final.txt`, on the bundle of ec30d380; f68a32cb after it only renames
  a parameter and reorders two option lists, which the checkers confirm).
- `node tools/check_newton.mjs`: 60 checks, 0 failed.
- Not run: `tools/check_all.mjs` (the coordinator gates), `eval_worlds` (no world subject changed) and `eval_content` (no
  station added).

## Seams

- **Rooms:** `hwMountRoomAgents({ room, three, agents, source, tier, reducedMotion })` reads `source.jobs()`,
  `source.agentState(id)` and `source.pending()` once (who is here as the room opens), then `award`, `move`, `complete` and
  `refused`. The hive's own `move` events never reach the room figures; the mount turns them into walks between its places
  (`hw-room:spot:<id>`, `hw-room:door:<k>`, `hw-room:exit`).
- **Presence:** `h3RoomPresence({ agents, source })` returns `{ at(id), here(siteId), jobsOf(id), onChange(fn), dispose() }`.
- **Avatars:** `aaMountAgentAvatars(...).release(id)`.
- **Settings:** `h3Settings({ storage, signals, profile, demo })` returns `{ allowed, reason, read(), write(patch), clear() }`.
  `ohMountHive(el, { settings, reload })`, panel API `language(code)`, and `state().lang` and `.remembered`.
- **Spanish:** `h3PanelText(lang)`, `h3RoleIn(agent, lang)` and `h3ChipIn(chip, lang)`. A third language is a new key in
  `H3_PANEL_TEXT`, roles and chips, beside VOICES' cores.
- **Scene:** `window.__parishTest.hiveScene({ seed })` returns `{ ok, seed, duration, beats, stop }`. `hiveSceneDone` is a
  promise of `{ beats, captions, metrics, verify, errors }`. `h3SceneRelay(hive)` holds a step's events and releases them by
  beat (`releaseThrough`, `releaseRun`, `releaseAll`).

## Left

- A native speaker's review of the Spanish (`H3_PANEL_TEXT.es`, `H3_ROLES_ES`, `H3_CHIPS_ES`, and VOICES' pack).
- The talk light comes on at the line's arrival rather than at onstart when voice is on (see "Read honestly").
- The scene's captions are English only. The reel's 1920×1080 capture of the scene is not taken here: the drive's stills are
  960×540.
- Outdoors, an agent still stays at its last job's site after the job ends. Only the rooms send it home.
- Settings are remembered on the parishes page only. Bay World, Summit and Redwood have no hive panel.
- The bundles were rebuilt for the drives and are not committed (the coordinator regenerates them). The `check_hive3` row in
  `docs/perf/checkers-baseline.json` is an estimate; re-measure it on a quiet gate.
