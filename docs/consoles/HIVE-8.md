# HIVE-8 (`h8`, port 9162): moods on in the page, and a correction when a briefed job goes to someone else

Loop 10, round 8. Base a10f1ff8 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This console does the HIVE-8 section of the
round-8 brief on top of HIVE-7's next brief (`tools/briefs/next/h7-next.md`, items 1–3): the page's hive moods on (with
AVATARS-HD-5), the correction line when a briefed job goes to another agent, and the Spanish left flagged for a native speaker.

Agents are software and say so: every caption keeps "(software agent)" and the figures keep AGENT-AVATARS' label. No LLM or network
call: a mood comes only from the hive's own events, and a correction line only from the hive's own award. Voice stays on-device only
and off by default, and nothing listens. The governor's rules stand. `aa-*.js` were not edited (AVATARS-HD-5 owns them this round).

## What is here

| File | What |
|---|---|
| `WebXR/shared/h3-hive-day.js` | **The scene's hive with moods.** `h3SceneHive(makeHive, { seed, moods })`: `moods: true` passes HIVE-6's moods option to the scene's hive. Without it the call is what it was, so the hive's output is byte-identical. `h3SceneRelay` hands each mood change on with its cause (a mood follows its cause at once, so it travels with it the way the speak lines do; a hive without moods has none, so the relay releases what it did before). `relay.mood(id)` gives the mood released so far (seeded from the hive when the relay is made; null for a hive without moods), so a mount opened mid-scene can start from it, as `h5MountOpsRoom` starts from `hive.mood(id)`. |
| `WebXR/parishes/js/app.js` | The page's scene (`window.__parishTest.hiveScene`) builds its hive with `moods: true`. The panel's hive (`ohMountHive`) has run with `moods: true` since HIVE-6. |
| `WebXR/shared/oh-hive.js` | **`briefLost`.** When the job an agent named as its first in the morning briefing is awarded to another agent, and the briefed agent is still waiting for its first award, it says so at that award, once, to the dispatcher. The line is a speak event `about: "brief_lost"` with `jobId`, `winner`, `winnerName` and `briefing: { id, fix: true, lost: true, said }`, captioned "· morning briefing to Orrin". Its own first award after that says nothing more, because it already said the plan changed. An agent that already had its first award said its change then (`brief_fix`), so it says nothing here, where "I wait for the next one" would be false. Hives without the briefing are unchanged. |
| `WebXR/shared/oh-say.js` | The kind `brief_lost` (English: "{job} went to {winner}; I wait for the next one" / "{job} is with {winner} now, so I wait for the next job"; Spanish machine-assisted, awaiting a native speaker) and the slot `winner` (the award winner's name). |
| `tools/check_hive6.mjs` | §4's page case runs seeds 1–40 and checks the `brief_lost` line (new behaviour, so the check changes with it). New §11 covers the page's hives with moods on. |
| `docs/perf/checkers-baseline.json` | `check_hive6` row raised from 30 s to 45 s. This is an **estimate**, not a measurement. |

## Evals (before → after)

| Measure | Before (a10f1ff8) | After | Source |
|---|---|---|---|
| Mood events reaching the figures, **the panel's hive** in the built page (ops room, oak-west-oakland, high; hive minutes 0–36) | **16 of 16** (the panel's hive already ran with moods; AVATARS-HD-4's figures subscribe) | **16 of 16** (unchanged); outdoor figures 16 of 16; glow mood = hive mood 7 of 7 built (base) and 6 of 6 (after) at minute 36 | drive A, `$SP/loop10/h8/drive-base.txt`, `drive-after.txt` |
| Mood events reaching the figures, **the scene's hive** (sf-downtown, "A day in the hive", seed 1) in the built page | **0** | **1** (the planner turns busy at the award, in the cell hall; the refusal's moods fall while the camera is outside, with the room closed) | drive B, `drive-base.txt`, `drive-after1.txt`, `drive-afterB.txt` |
| The same, headless (cell hall open through every beat, seeds 1, 2, 3, 7, 42) | 0 | **25**; figure mood = released mood **25 of 25**; relay mood(id) = hive **35 of 35** | `check_hive6` §11 |
| The scene's beats with moods on | — | **5 of 5** seeds unchanged (non-mood events, beat by beat) | `check_hive6` §11 |
| The default hive's output with the options off | digests 703aa91da7bb9439, 533938515253653d, 03f3d7a40c26af91; scene 13307c62…, e689091a…, ba4f0b27…, 4772e790…, fb9b7fae… | **byte-identical 3 of 3**, scene and relay **5 of 5** | `check_hive6` §1, §11 |
| Briefed jobs given to another agent while the briefed agent waits: a line at that award (page's case: no decide, approvals from minute 1 to 30) | **0 of 1** (seeds 1–40); 0 of 2 (seeds 1–200) | **1 of 1**, grounded and in band (seeds 1–40); **2 of 2** (seeds 1–200) | `check_hive6` §4; `$SP/loop10/h8/lost.mjs`, `lost200.txt` |
| First jobs said = first awards (the same case) | 117 of 120 | **120 of 120** (seeds 1–40); 30 of 30 (seeds 1–10) | `check_hive6` §4 |
| Governor | 154 of 154 checked, physical 0 | **154 of 154**, 3,196 of 3,196 steps, **0** physical; the scene's runs physical 0, chain intact | `check_hive6` §2, §4, §11; drive B |
| **Combined ops room in the built page** (high, briefing on, 1 room-level + 6 crowd figures) | 46 meshes, 5,988 triangles built, 5,890 drawn, 46 calls, 3 lights, 21.58 MiB | **the same** | drive A |
| Page errors / off-host requests | 0 / 0 | **0 / 0** (drives A, B, three runs) | drives |

## Cycles (reason → act → observe)

1. **Which hive lacks moods?** Reason: the brief and AVATARS-HD-4's note say the page's hive has moods off. Act: read `app.js`. The
   panel's hive (`ohMountHive`) sets `moods: true` (HIVE-6), and only the scene's `h3SceneHive` does not. Observe: the base drive
   confirms it. The ops room got 16 of 16 mood events, the scene 0.
2. **Turn the scene's moods on without changing it.** Act: add a `moods` option (off by default) and let the relay release mood
   changes with their cause, so `releaseRun("bid")` is not cut short by a mood. Check: scene beats unchanged 5 of 5, digests with
   the option off equal the base module's 5 of 5. Heartbeat posted at 20:20 for AVATARS-HD-5.
3. **A mount opened mid-scene.** The scene closes the cell hall for the outside shots, so the reopened room's figures miss the
   refusal's moods. Act: `relay.mood(id)` (released moods only). Observe: §11 relay mood(id) = hive 35 of 35. Seeding the aa
   figures from it is AVATARS-HD-5's (heartbeat).
4. **How often does a briefed job go elsewhere?** Measured first (`lost.mjs`): 2 of 120 in seeds 1–40, with no line at either
   award. The first wording had Lio say "I wait for the next one" although it had already started another job (its first award at
   minute 2, corrected then). Act: the line is said only while the agent still waits. Observe: 1 of 1 (seeds 1–40), 2 of 2 (1–200).
5. **The check changes with the behaviour.** §4 counted every `briefing.fix` line as a `brief_fix`. It now separates `brief_lost`
   and requires no later correction from that agent, and it runs seeds 1–40 so the case occurs (seed 29). This is stricter, not
   looser: a `brief_lost` without a briefed job given away fails.
6. **The combined room in the built page.** Drive A, after: 46 / 5,988 / 5,890 / 46 calls / 21.58 MiB, the base's numbers.

## Checkers (single runs)

- `check_hive6` **11 passed, 0 failed**; `check_hive5` 5/0; `check_hive4` 11/0; `check_omega_hive` 15/0; `check_voices` 10/0;
  `check_hive3` all 32 pass.
- `check_newton` all 60 pass; `check_imports` 1,141 modules pass; `check_parse`: see the hand-back. `check_interface` was not
  required, because no control was added or changed.

## Stills (`$SP/loop10/h8/`)

- `h8-scene-cell-hall-afterB.png` (1920 × 1080, looked at): the cell hall at the end of the scene, the auditor's figure labelled
  "software agent · auditor", the robot cell behind its fence. A mood is a pose or glow change over seconds and cannot be seen in a
  still. In software rendering the screenshot took longer than the scene (27 s), so a still of the busy planner at the award was
  not caught.

## Read honestly

- The page's panel hive already had moods on (HIVE-6). AVATARS-HD-4's note that it did not was about the scene's hive. So the page
  eval "0 → N" holds for the scene only: 0 → 1 in the built page, 0 → 25 headless with the room kept open.
- In the page the aa figures' posture reads `null` until each figure's first mood event, because the aa mount does not seed from
  `source.mood(id)`. Posture = glow was 4 of 7 built at minute 36 in the base drive and 3 of 6 in the after drive (one agent out on a job), with the calm agents reading null. That seam
  belongs to AVATARS-HD-5.
- The `brief_lost` case is rare: 1 in 40 seeded days, 2 in 200. In the other 2 of 4 cases in 200 seeds the agent had already
  corrected itself at its first award, so it says nothing.
- The Spanish (`brief_lost` included) stays machine-assisted and is **not** reviewed by a native speaker.
- `check_hive6`'s baseline row is an estimate (45 s). One run took 31 s of CPU, about 2 min wall, at load 30–38.

## Seams

- `h3SceneHive(makeHive, { seed, moods })`; `h3SceneRelay(hive).mood(id)` → `{ mood, cause } | null` (released moods only).
- Speak events `about: "brief_lost"` with `jobId`, `winner`, `winnerName`, `said`, `briefing: { id, fix: true, lost: true, said }`.
- **AVATARS-HD-5:** seed `state(id).mood` from `source.mood(id)` when a figure is built (the panel's hive and the scene's relay both
  have it). Glow is set by `h5-ops-room.js`, posture by `aa-*.js`.

## Left

- Posture seeding (AVATARS-HD-5), then the "posture = glow N of N" check in the page.
- A native speaker's review of the Spanish (`H6_MOOD_PHRASES.es`, `OH_CORES_BRIEF_ES` with `brief_fix` and `brief_lost`,
  `OH_SECOND_ES`, `OH_MOOD_WORDS.es`).
- A quiet re-measure of `check_hive6`.
- A still of a concerned or busy figure in the scene: it needs a faster renderer, or the scene paused at the beat.
