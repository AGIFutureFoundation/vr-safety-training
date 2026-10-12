# HIVE-7 (`h7`, port 9153): figures that show the mood, moods on the live link, a briefing that corrects itself

Loop 10, round 7. Base 40d97421 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This console does HIVE-6's next brief
(`tools/briefs/next/h6-next.md`) in order, on top of OMEGA-HIVE, VOICES, HIVE-4's talk and tab, HIVE-5's operations room and
HIVE-6's moods and morning briefing.

Agents are software and say so: every caption keeps "(software agent)", every tab row says "software agent", and the figures keep
AGENT-AVATARS' label, tint, visor and halo. No LLM or network call: a mood still comes only from the hive's own events, and a
correction line only from the hive's own awards and the learner's approvals. Voice stays on-device only, off by default; nothing
listens. The governor's rules stand: it checks every step, the e-stop comes first, the physical path stays disabled. `aa-*.js` were
not edited (AVATARS-HD-4 owns them this round).

## What is here

| File | What |
|---|---|
| `WebXR/shared/h5-ops-room.js` | **The figures show the mood.** The ops-room mount listens for the hive's `mood` events and seeds each agent from `hive.mood(id)` when the room opens; every frame each built figure's glow (the high tier's one glow mesh: visor band, eyes, halo, badge; the balanced figure's halo) is set to its built colour times a brightness factor, `h5MoodGlow(mood, t)` from `H5_MOOD_GLOW`: calm steady (1), busy a quick shallow pulse (0.9 Hz, down to 0.88), concerned a slow deeper one (0.35 Hz, down to 0.72), relieved a slow faint one (0.2 Hz, down to 0.92). Brightness only: the role colour's hue stays, never brighter than built, no mesh or triangle added, no bone or face touched (posture by mood is AVATARS-HD-4's, in `aa-*.js`), reduced motion holds it at 1, the phone tier builds no figure. `mount.moods()` reads `{ mood, cause, glow }` per agent; the figure group carries `userData.h7Mood`. |
| `WebXR/shared/h5-hive-live.js` | **Moods on the live console link.** For a hive with moods on, `h5LiveSnapshot` adds `moods` (each agent's mood and its recorded cause, the hive's own fields only: type, time, job, reason, by, held jobs, chain lines, mood), `moodChanges` and `briefing` (the briefing captions and turns). A hive without moods sends the old shape (`check_hive5` §3 unchanged). Still receive-only on the tab side, nothing stored. |
| `WebXR/instructor/js/h4-hive.js` | The tab's "Moods and the morning briefing" panel is **live** when the snapshot carries moods (`h4LiveMoodPanel`: heading "(live, read-only)", `data-live="true"`, each agent's live mood and cause, the live day's changes and briefing); without one it keeps HIVE-6's seeded replay. No button, no storage, no request. |
| `WebXR/shared/oh-hive.js` | **The briefing after the learner's approvals.** `brief()` now remembers what each agent said its first job was (`briefSaid`). At an agent's first award after the briefing, if the job differs (a learner's approval re-queued a job ahead of others, which the look-ahead could not know: in the page the learner decides), or an agent briefed "nothing in the first 120 minutes" gets one inside them, the agent says the change in one line to the dispatcher: `brief_fix` names the award it got and the approval since the briefing; `brief_fix_q` says the queue moved (no approval found). The line is a speak event with `briefing: { id, fix: true, said }`, captioned "· morning briefing to Orrin", once per agent, none when the briefing held. Nothing goes to the chain; the governor sees nothing new; the default hive (and every hive without `briefing`) is byte-identical. |
| `WebXR/shared/oh-say.js` | The kinds `brief_fix`, `brief_fix_q` (English and Spanish) with their second sentences in `OH_SECOND` / `OH_SECOND_ES`, and the slot `approved`. **Spanish re-read**: the keeper's briefing line "sigue necesitando una decisión" (the English "still needs"), the supervise line "Hoy {supervisor} aprueba…". |
| `WebXR/shared/h6-moods.js` | **Spanish re-read** of `H6_MOOD_PHRASES.es`: busy "con las manos ocupadas", concerned casual "con los ojos bien abiertos tras ese rechazo" / "con más cuidado tras ese rechazo" (it no longer repeats the formal phrase), relieved "más tranquilo con la auditoría limpia". By a software agent for fluency, **not a native speaker**. |
| `tools/check_hive6.mjs` | §4 grows the page's case (no `decide`, the learner approves every waiting request from minute 1 to 30); new §8 (figures show the mood), §9 (moods on the live link), §10 (Spanish lines without English fragments); §6 covers HIVE-7's files and docs. |
| `docs/perf/checkers-baseline.json` | `check_hive6`'s row raised from an 8 s to a 30 s **estimate** (the new sections step eight ops rooms and thirteen more days); not a measurement. |

## Evals (before → after)

| Measure | Before (40d97421) | After | Source |
|---|---|---|---|
| Figures whose state shows the hive's mood, headless ops room (seed 1, 240 minutes, 41 refusals; the app's crowd mount on high, today's figure on balanced) | **0** (the figures did not take `mood`) | high **1,680 of 1,680** figure moods = `hive.mood(id)` (7 agents × 240 minutes); balanced **1,680 of 1,680**; moods seen busy, calm, concerned, relieved | `check_hive6` §8 |
| Glow in its band, hue kept (built figures) | — | **1,576 of 1,576** (high), **1,576 of 1,576** (balanced); reduced motion held at 1 | `check_hive6` §8 |
| Geometry added by the moods | — | **0**: the room with moods equals the room without them in meshes and triangles at **12 of 12** sampled minutes (high and balanced) | `check_hive6` §8 |
| **The combined ops room in the built page** (oak-west-oakland, high, SwiftShader; briefing on, seven crowd figures standing, captions up; AVATARS-HD-3's figures at the base) | 46 meshes, 5,586 triangles built, 46 draw calls, 3 lights, 21.58 MiB (round 6, coordinator) | at entry **46 meshes, 5,586 triangles built, 5,504 drawn, 46 draw calls, 3 lights, 21.58 MiB** (≤ 120 / 6,000 / 24 MiB); 7 briefing turns, 7 standing, 8 of 8 screens; after 31 hive minutes 43 / 5,082 (fewer figures standing: agents out on jobs) | drive 1 (`$SP/loop10/h7/drive1.txt`) |
| Figure mood = hive mood(id) in the page | — | **7 of 7** at each of 5 sampled minutes (0, 10, 17, 24, 31), through 8 refusals: concerned at a glow of 0.725 at minute 10, relieved 0.93–0.99 later; an agent out on a job reads "(out)" (no figure, no glow) | drive 1 |
| Moods on the live console link | **0** (the tab's moods panel was a replay even when the cards were live) | headless **1,435 of 1,435** (seed 3, 205 snapshots × 7) live moods = `hive.mood(id)`; causes with the hive's own fields only 1,435 of 1,435; briefing 7 of 7 captions; old shape without moods; in the page the tab's panel "(live, read-only)" at hive minute 32 with **7 of 7** moods equal to the page hive's, 14 changes, 0 buttons, 0 storage keys | `check_hive6` §9; drive 1 |
| The briefing after the learner's approvals (page-like: no `decide`, every waiting request approved from minute 1 to 30) | first jobs said = first awards **29 of 30** (seeds 1–10); 117 of 120 (seeds 1–40) | **30 of 30** (seeds 1–10) with 1 correction line, grounded and in band 1 of 1; **120 of 120** (seeds 1–40, 3 corrections, all naming the approval) | `check_hive6` §4; `$SP/loop10/h7/try3.mjs` |
| Corrections when the briefing held (the stand-in days, seeds 1–5) | — | **0** | `check_hive6` §4 |
| Spanish lines with an English fragment (but names and ids), moods, briefing and corrections on | not checked | **0 of 2,788** (seeds 1–2); phrase and word lists 40 of 40 | `check_hive6` §10 |
| The hive's output with the options off | digests 703aa91da7bb9439, 533938515253653d, 03f3d7a40c26af91 | **byte-identical 3 of 3** | `check_hive6` §1 |
| Governor with moods and the briefing on | 154 of 154 checked, 0 physical | **154 of 154**, 3,196 of 3,196 steps, **0** physical; outcomes unchanged | `check_hive6` §2, §4 |
| Page errors / off-host requests (drive 1, 98 s) | — | **0 / 0** | drive 1 |

## Cycles (reason → act → observe)

1. **Who shows the mood on the body.** Reason: h6-next 1 says "with AVATARS-HD", and AVATARS-HD-4's brief (ah3-next 3) puts the
   posture by mood on the bones in `aa-*.js`, which are theirs. Act: HIVE-7 takes the one channel outside the figure code, the glow's
   brightness, set from the ops-room mount (mine), and leaves posture alone; a heartbeat note told AVATARS-HD-4 that
   `AA_EVENT_TYPES` has no `"mood"`, so their figures do not receive it yet. Observe: 0 lines changed in `aa-*.js`.
2. **The first §8 run: two failures, both the checker's.** The room builder's floor skin needs `createLinearGradient` (my canvas stub
   had none), and the summary line printed before §8 (it sat above the new section). Fixed the stub (the gradient and image-data
   calls of §7's) and moved the summary. Then `check_hive5` §5 failed on the prefix rule: `H7_MOOD_GLOW` in an `h5` module. Renamed
   to `H5_MOOD_GLOW` / `h5MoodGlow` / `h5ApplyGlow` (the rule, not loosened). §8 1,680 of 1,680 on both tiers.
3. **"No geometry" measured, not asserted.** A second room with the same seed and moods off is stepped beside the first; meshes and
   triangles equal at 12 of 12 sampled minutes on high and balanced.
4. **The live snapshot's shape.** `check_hive5` §3 pins the snapshot's keys for the panel's hive without moods; the moods fields are
   added only when the hive has moods, so §3 holds unchanged and §9 pins the moods shape.
5. **How often does the briefing go wrong?** Measured first (scratch `try3.mjs`): with no `decide` and approvals from minute 1, the
   briefed first job missed 1 of 30 (seeds 1–10), 3 of 120 (seeds 1–40). The correction line closes all of them. The first wording
   ("Change of plan: I start…") read "Noted: change of plan: …" behind a formal opener; now "Change of plan, I start…".
6. **The Spanish scan.** A scan of 4,140 Spanish lines for English words found one hit, a reason id (`near-limit-with-person`) in a
   veto line: an id like a job id, allowed by §10 as a name. Then the re-read changed five phrases and lines (see What is here).
7. **The combined room in the built page.** Drive 1 enters the ops room at minute 0: 46 / 5,586 / 21.58 MiB with the briefing and
   seven crowd figures (the round-6 numbers: the moods add nothing), steps to the first refusals (minute 10: three agents concerned,
   glow 0.725), samples four more minutes (7 of 7 each), then turns the console link on and opens the tab: live, 7 of 7.

## Checkers (single runs)

- `node tools/check_hive6.mjs`: **10 passed, 0 failed** (base 7 sections; §4 extended, §8–§10 new).
- `check_hive5` 5 passed, 0 failed; `check_hive4` 11 passed, 0 failed; `check_omega_hive` 15 passed, 0 failed; `check_voices` 10
  passed, 0 failed; `check_hive3` all 32 pass.
- `check_newton`, `check_imports`, `check_parse`: see the hand-back (run last). `check_interface`: not required (no control added or
  changed; the tab's live panel has no button).
- Not run: `tools/check_all.mjs` (the coordinator gates).

## Stills (`$SP/loop10/h7/`, 1920 × 1080, each looked at)

- `h7-ops-room-moods-high.png`: the operations room at hive minute 31 from the door-side corner, the agents at their consoles
  (one out on a job), labels "software agent · role", the wall's feed and refusals. The glow pulse is a brightness change over seconds:
  a still shows the figures but not the pulse (the drive's numbers are the evidence).
- `h7-console-moods-live.png`: the instructor tab's "Moods and the morning briefing (live, read-only)" at hive minute 32: Orrin calm
  ("the start of the day"), Selka and Brann relieved ("after a clean audit at 00:16 (19 chain lines intact)"), Tamsa and Lio relieved
  (00:31, 43 lines), the seven briefing lines.

## Read honestly

- The mood on the figure is a brightness pulse of the glow, a small cue: at its deepest (concerned) the visor and halo dim to 72%
  and back over about three seconds. It reads close up, not across the room, and a still cannot show it. Posture is AVATARS-HD-4's.
- The figures' state follows the mount's mood map, which the hive's events fill; it is checked against `hive.mood(id)`, so it can
  only be as right as the hive's own moods (HIVE-6's rules over events, not feelings).
- The correction fires at the agent's first award after the briefing. A briefed job taken by another agent while the briefed agent
  waits says nothing until that agent's first award; the `brief_fix_q` path (no approval found) never fired in 40 seeds.
- With the hive's own `decide` (headless) the briefing already held 15 of 15; the corrections matter for the page, where the learner
  decides. The approval named is the latest one since the briefing, which is the cause in every measured case but is not proven
  to be the only one.
- The Spanish was re-read by a software agent for fluency, not by a native speaker; that review stays open. Reason ids (e.g.
  `near-limit-with-person`) appear in Spanish veto lines as ids, as job ids do.
- `check_hive6`'s baseline row is still an estimate (30 s); the machine was at load 30–36 the whole round.

## Seams

- `H5_MOOD_GLOW`, `h5MoodGlow(mood, t, reducedMotion)` (h5-ops-room.js); the ops-room mount's `moods()` → `{ [agentId]: { mood, cause, glow } }`;
  a figure group's `userData.h7Mood`; the glow mesh's `userData.h7Base` (its built colour).
- `h5LiveSnapshot(hive)` adds `{ moods: [{ agent, mood, cause }], moodChanges, briefing: [{ t, agent, turn, caption }] }` for a hive
  with moods on.
- Speak events `about: "brief_fix" | "brief_fix_q"` with `jobId`, `to`, `siteName`, `said`, `approved?`, `briefing: { id, fix: true, said }`.
- **AVATARS-HD-4:** posture by mood stays yours; `AA_EVENT_TYPES` needs `"mood"` for your figures to receive it. The glow is set every
  frame from the built colour, so a talk or gesture brightening of the same material would need one owner (say which).

## Left

- Posture by mood on the bones (AVATARS-HD-4), and then a check that the two cues agree.
- Re-measure `check_hive6` on a quiet gate (h6-next 5): not possible this round (load 30–36).
- A native speaker's review of the Spanish (`H6_MOOD_PHRASES.es`, `OH_CORES_BRIEF_ES`, the correction kinds, `OH_MOOD_WORDS.es`).
- A balanced-tier drive of the moods (headless §8 covers balanced; the page drive ran high only).
- The dist bundles were rebuilt for the drive and restored.
