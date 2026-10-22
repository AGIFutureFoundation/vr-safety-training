# MOODS (`md`, port 9172): posture and glow from the first frame, a still of a mood, a mood you can read from the door

Loop 10, round 9. Base 61d85871 (fast-forward, confirmed). SmartCiti.X Holodeck · Powered by AGI Corp. One console owned the whole
mood seam this round (`aa-*`, `oh-*`, `h5-*`, `h6-*`, `h3-hive-day.js` and the page's scene lines in `app.js`), on top of HIVE-8's and
AVATARS-HD-5's next briefs (`tools/briefs/next/h8-next.md` items 1, 2, 4; `ah5-next.md` item 1).

Agents are software and say so: every figure keeps AGENT-AVATARS' "software agent · <role>" label and every caption its "(software
agent)". No LLM or network call: a mood comes only from the hive's own events and reaches a figure through the hive's `mood(id)` or the
scene relay's released moods. Moods never touch the face or the stop hand. The default hive and the default scene (no `hold`) are
byte-identical with the options off. Voice stays on-device only and off by default; nothing listens. The governor's rules are unchanged.

## What is here

| File | What |
|---|---|
| `WebXR/parishes/js/app.js` | **`hiveScene({ seed, hold })`.** `hold` names a beat (`"award"` for the busy planner): once that beat has played, with its events released and its caption up, the scene's clock stands still (`held`, `heldAt`; `t0` re-based every tick, so `t` does not move) and the room's figures keep animating in their mood. `hiveSceneResume()` lets it run on from where it stood. The hold is tested inside the beat loop, so a slow software-rendered frame that would have jumped two beats stops at the named one. Without `hold` the code path is the old one. `hiveSceneState()` adds `hold`, `held`, `moods` (the relay's released moods) and `room.posture` (the figures' posture moods). |
| `WebXR/shared/hw-hive-world.js` | **The robotics rooms seed too.** `hwMountRoomAgents` wrapped the source in `{ on, off }` only, so `aaMoodOf` found no `mood()` and a figure built mid-day or mid-scene in a robotics room started calm (the ops room was fine only because the page passes `moodOf`). The wrapper now passes `mood(id)` through (the hive's, or a scene relay's released mood). HIVE-IN-WORLD's file, unowned this round: a two-line pass-through, found by the §11 line below (30 of 40 before it). |
| `WebXR/shared/h3-hive-day.js` | The header's seam note for `hold` and the relay's `mood(id)` seeding. No behaviour change (the digests in `check_hive6` §11 are the base's). |
| `WebXR/shared/aa-agent-hd.js` | **The cue you can read from the door.** `aaHdPose`: a concerned agent's hands come to rest low in front. An agent with a tablet (Orrin, Ivo, Quen) lowers it from the chest to the hip (`AA_HD_MOOD_POSE.tabletLow`: shoulder −0.08, elbow −0.5 rad, inside the range the rest arms already span, shoulder x in [−0.34, 0.04] and elbow x in [−1.36, −0.14]); an agent without one clasps its hands in front (`concernedClasp` 1: the formal agents' own rest pose). AVATARS-HD-4's head pitch (+0.05 rad) and arms-in stay. Never the face; the right arm's stop pose is the same in every mood because the gesture lerps to `AA_HD_STOP_POSE`. |
| `tools/check_agent_avatars.mjs` | §9m, one new line: the cue measured on the built crowd figure with the real three.js (each wrist's world displacement calm → concerned, the tablet hand's height, what the least subtends at 8 m on a 1080-px, 60° view), the range rule, and that only concerned moves the hands (calm, busy, relieved within 1.2 cm). 125 checks (124 before). |
| `tools/check_hive6.mjs` | §11, two new lines: the cell hall reopened mid-scene (the page rebuilds it at "approved"; also at "walk-in" and "run", when the busy planner is in it): at the figures' first frame posture = `relay.mood(id)`, with at least one not calm; and the page's hold (a source check: `hold`, `held`, `heldAt`, `hiveSceneResume`, unchanged without `hold`). |
| `tools/drive_moods.mjs` (new, not in the gate) | The built page on high. A: the ops room entered mid-day after a refusal; posture, glow and the hive's mood compared at the figures' first frame and after 60 hive minutes (every frame between tallied); a still from the door (the entry pose) with a concerned figure, the distance printed. B: the scene with `hold: "award"`: the figures' posture against the relay while held, a still, then resumed to its end. Page errors and off-host requests throughout. |
| `docs/perf/checkers-baseline.json` | The two rows' notes (see Timing). |

## Evals (before → after)

| Measure | Before (61d85871) | After | Source |
|---|---|---|---|
| Posture = glow = `hive.mood(id)` at the figures' **first frame**, the built page (oak-west-oakland, high, ops room entered at minute 158 after 23 refusals) | not measured at the first frame (AVATARS-HD-5 sampled 3 s after entry: 352 of 352; HIVE-8 at the base before seeding: 3 of 6) | **6 of 6** (frame 1; 1 not calm: concerned) | drive A, `$SP/loop10/md/drive-after.txt` |
| The same **after 60 hive minutes** (minute 218) | — | **6 of 6** (1 not calm) | drive A |
| Every frame between (one frame per hive minute) | — | **352 of 352** figure-samples (138 not calm) | drive A |
| The cell hall reopened mid-scene, headless (seeds 1, 2, 3, 7, 42; "approved", "walk-in", "run"): first-frame posture = `relay.mood(id)` | not checked | **40 of 40** (10 not calm: the busy planner at walk-in and run); **30 of 40 before the `hw` pass-through** (the planner read calm) | `check_hive6` §11 |
| A mood still in the scene | none: in software rendering the screenshot (30–150 s) outran the 27 s scene (HIVE-8) | **taken**: `md-scene-award-held.png`, the scene held at the award, the planner's released mood busy, 4 beats played, the planner's posture busy in the cell hall (posture = relay 3 of 3), still held after a 37 s screenshot, resumed to 12 of 12 beats, physical 0, chain intact | drive B |
| A concerned figure's cue at a distance (wrist displacement calm → concerned, built crowd figure) | head +0.05 rad, arms in: about 1 px of head travel at 8 m (1080 px, 60°) | **0.22–0.48 m on 7 of 7 agents** (least 0.22 m = **26 px at 8 m**); the tablet hand drops 0.25, 0.28, 0.25 m (1.19 → 0.94 m, 1.33 → 1.05 m, 1.17 → 0.92 m) | `check_agent_avatars` §9m |
| The stop hand in every mood | 7 of 7 the same (AA_HD_STOP_POSE) | **7 of 7** | `check_agent_avatars` §9m |
| Only concerned moves the hands (calm, busy, relieved within 1.2 cm) | — | **7 of 7** | `check_agent_avatars` §9m |
| The default hive's output with the options off | byte-identical 3 of 3; the scene and relay 5 of 5 | **byte-identical 3 of 3, scene 5 of 5** (the hold adds no event) | `check_hive6` §1, §11 |
| The figures with no mood event (pose hash twice) | the same | **the same** | `check_agent_avatars` §9m |
| Governor | 154 of 154 checked, 0 physical | **154 of 154**, 0 physical; the scene's run physical 0, chain intact | `check_hive6` §2, §4, §11; drive B |
| Ops room in the built page (high, 6 standing, 1 away) | 43 meshes / 5,484 triangles built (AVATARS-HD-5) | **43 meshes / 5,484 triangles built** (margin 516), 43 draw calls, levels room 1 / crowd 5 — the same | drive A |
| Page errors / off-host requests | 0 / 0 | **0 / 0** (drive A + B, 640 s at load 24–34; drive B rerun) | drive |

## Cycles (reason → act → observe)

1. **Where does first-frame disagreement come from?** Reason: HIVE-8 read 3 of 6 because the aa mount did not seed; AVATARS-HD-5 added
   `seedMood` but sampled 3 s after entry. Act: `drive_moods.mjs` samples at the first animation frame after the room mounts. Observe: frame
   1, 6 of 6 (one concerned), so the seed is in place before the first frame is drawn.
2. **The headless reopen.** Act: §11 remounts the cell hall at "approved", where the page rebuilds it. Observe: 10 of 10 agree but **0 not
   calm**, so the line proved nothing; the concerned agents were outside. Act: remount at "walk-in" and "run" too, when the busy planner
   is in the room. Observe: **40 of 40** (10 not calm: the busy planner at walk-in and run); **30 of 40 before the `hw` pass-through** (the planner read calm).
3. **A still of a mood.** Reason: the screenshot outran the scene. Act: `hold` at a beat, tested inside the beat loop. Observe, first drive:
   **5 beats played, t 6.72** and the still showed "Out of the cell hall's door" with the planner gone. On a slow software-rendered frame the
   clock was already past walk-out's 6.5 s when the award played, and the next tick's beat loop ran before the held guard. Act: while held
   the clock is pinned before the loop and no beat plays (§11's source line changed with it, the reason in the commit). Observe, rerun: 4 beats, t 9.2, the planner busy in the room, posture = relay 3 of 3, still held after the 37 s screenshot, resumed to 12 of 12 beats, 0 errors.
4. **A cue from the door.** Reason: AVATARS-HD-5's head and arms read at 2–3 m only. Act: the hands come to rest low in front (tablet
   lowered, free hands clasped), inside the rest arms' own range. Observe: §9m: 0.22–0.48 m, 26 px at 8 m, the stop hand 7 of 7 unchanged.
5. **Load.** The round ran at load 7–34 (ten consoles' drives). `check_agent_avatars`' §9f wall-clock line read 158 of 159 words at load 28,
   as in rounds 7 and 8; see Timing.

## Stills (1920 × 1080, `$SP/loop10/md/`)

| File | What |
|---|---|
| `md-ops-room-from-door.png` | The ops room on high from the entry pose by the door, mid-day after a refusal: seven figures at their consoles, every label "software agent · <role>", the hive feed on the wall at minute 219. Lio (logistics, concerned, crowd level) stands at the far right **14.6 m** from the camera, partly behind Ivo and Quen, so its clasped hands cannot be judged in this still; Orrin's tablet (calm) at chest height reads clearly at 8 m. The cue's measure is §9m's; a side-by-side at one distance is md-next 1. |
| `md-scene-award-held.png` | The cell hall held at the award: the caption bar reads "The best bid wins — Brann (software agent) wins vbjob-…: Set and test a cobot's safety zones". Brann (maintenance planner, busy) stands by the cell's fence under its label; Quen (auditor, calm) in the foreground with the tablet at chest height; the robot arm behind the fence. Busy is a tempo (×1.12 idle), so the still shows the pose at the beat, not a visible mood cue: that is what `hold` is for (a frame at a chosen beat), and the drive's line beside it reads the planner busy. |

## Timing (item 4)

The brief asked for a re-measure of `check_hive6` and `check_agent_avatars` at load under 2 after the drives. **The load never fell
under 2** during this round (1.9 at 01:34 before any console's drive, then 7–36 throughout, 26–31 when the drives were done), so the
rows in `docs/perf/checkers-baseline.json` **stay estimates** (45 s and 14 s), with the notes updated to say why. What was measured,
for the record and not for the rows: one run of each after the drives, in sequence, `$SP/loop10/md/runchecks.py` —
`check_hive6` **114.0 s wall at load 31 → 26** (11 of 11), `check_agent_avatars` **64.9 s wall at load 26 → 29** (124 of 125: §9f's
wall-clock line again, 158 of 159 words). Both numbers are load-bound, not quiet measurements. The next console on a quiet gate
replaces the estimates (md-next 4).

## Checkers (single runs)

- `check_agent_avatars`: **124 of 125 at load 28** — the new §9m cue line passes; the one failure is §9f's wall-clock mouth-boundary line
  (158 of 159 words), the known load-bound line. Re-run once after the drives (item 4) at load 26–29: the same 124 of 125, the same §9f line; the load was never under 2, so it is listed as load-bound, not waved away.
- `check_hive6`: **11 passed, 0 failed** (runs at 01:52 and in the item-4 run below). `check_hive5`: **pass** (the guard `aaOpsMount = aaCrowdAvatarMount({` holds). `check_hive3`: **all 32 pass**.
- `check_newton`, `check_imports`, `check_parse`: all pass (`check_newton` 60 of 60; `check_imports` 1,148 modules; `check_parse` 2,733 modules, 626 s at load 28). `check_interface` was not required: `hold` is a programmatic option, not a control.

## Read honestly

- The first-frame and minute-60 checks ran in one browser drive at load 28–34; the counts are exact, the wall times are not meaningful.
- The 26 px at 8 m is a computed subtense (1080 px tall, 60° vertical field), not a measured read of the still; the still from the door
  is the look at it. Busy (a tempo) and relieved (1.2 cm) still have no cue that reads from the door.
- The reopened cell hall's non-calm figures are the busy planner at "walk-in" and "run"; the refusal's concerned agents are outside the room.
- The Spanish stays machine-assisted and unreviewed (h8-next 3, not in this round's section).

## Seams

- `hiveScene({ seed, hold })` → `{ ok, seed, duration, hold, beats, stop, resume }`; `hiveSceneResume()`; `hiveSceneState().{hold, held, moods, room.posture}`.
- `AA_HD_MOOD_POSE.tabletLow { sh, el }`, `concernedClasp`; `aaHdPose`'s concerned pose moves the left arm (tablet) or both arms (clasp). The stop pose, face and the balanced figure are untouched.
- `check_hive6` §11 and `check_agent_avatars` §9m carry the new lines; `tools/drive_moods.mjs` is the page drive.

## Left

- Two stills (calm and concerned) from the same door pose, judged side by side (md-next 1).
- A cue for busy from the door, if wanted (md-next 2).
- The Spanish review (md-next 3). 
- The quiet re-measure of the two timing rows (md-next 4): the machine never went under load 2 this round.
