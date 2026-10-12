# HIVE-6 (`h6`, port 9142): agents with moods and a morning briefing

Loop 10, round 6. Base 230105b7 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This console builds on OMEGA-HIVE,
VOICES, HIVE-4's talk and console tab and HIVE-5's operations room.

Agents are software and say so: every caption keeps "(software agent)", every tab row says "software agent", and the figures keep
AGENT-AVATARS' label, tint, visor and halo. No LLM or network call: a mood comes only from the hive's own events, a briefing line
only from the hive's own queue, awards and chain, and `check_hive6` re-finds every one. Voice stays on-device only, off by default;
a mood moves rate and pitch inside a gentle band; nothing listens. The governor's rules stand: it checks every step, the e-stop
comes first, the physical path stays disabled. `aa-*.js` were not edited (AVATARS-HD-3 owns them this round).

## What is here

| File | What |
|---|---|
| `WebXR/shared/h6-moods.js` (new; imports nothing) | **Moods.** `h6MoodTracker` derives each agent's mood from the hive's events: **calm** (the start, and after a mood runs out), **busy** (it holds two jobs or more, read from the hive's own job list), **concerned** (a refusal names it: the governor refused the job it won, the steward vetoed it, the learner declined it; the steward and the consent keeper too for their own refusals), **relieved** (a clean audit while it was concerned). Concerned lasts 30 hive minutes after the last refusal, relieved 20. Each change carries its `cause` (the event's type, time, job id and reason; the held job ids; or the mood that ran out). `h6WithMood` joins a mood phrase (by language, mood and register) to a line as a clause when it fits the speaker's band, and never to a safety kind (`H6_SAFETY_KINDS`: refusals, vetoes, halts, approvals, declines, coaching, a broken chain, supervision, the steward's questions, the steward's and keeper's briefing lines). `h6MoodVoice` / `h6VoicedAgent` shift rate and pitch by at most 0.05 inside `H6_VOICE_BAND` (rate 0.85–1.15, pitch 0.85–1.2); a safety line is never faster or higher than the agent's own voice. `h6BriefFirstJobs` reads each agent's first award. |
| `WebXR/shared/oh-hive.js` | `ohHive({ moods, briefing })`, **both off by default** (the default and the panel's days stay byte-identical). With `moods`: a `mood` event `{ agent, mood, from, cause }` right after its cause (or at the step where a mood runs out), `mood` / `moodCause` / `moodPhrase` on speak events, `hive.mood(id)`, `metrics().moodChanges`. With `briefing`: `brief()` (once, in the hive's first 30 minutes) — the dispatcher opens with the day's queue (its own job stream: jobs today, arrivals in the first hour), then each agent in roster order answers to the dispatcher with its first job (its first award: the live hive's, or the same seeded day played forward by a second hive with the same seed, options and `decide`), or its standing duty (the steward: every job the governor allows; the keeper: the standing approval or "supervise every job"; the auditor: the chain check every 5 closed jobs from line N). Speak events with `briefing: { id, turn, of }` on one floor; captions read "Name (software agent) · morning briefing to Orrin: …". Nothing goes to the chain; the governor sees nothing new. |
| `WebXR/shared/oh-say.js` | The briefing kinds `OH_CORES_BRIEF` (English) and `OH_CORES_BRIEF_ES` (Spanish, machine-assisted); slots `first`, `every`, `window`. The existing kinds' output is unchanged. |
| `WebXR/shared/oh-panel.js` | The panel's hive turns `moods` and `briefing` on. Each card shows a mood chip (`.oh-mood`, `data-mood`, the cause as its title) from the mood events; with voice on, a line is spoken at the mood voice (`h6VoicedAgent(agent, e.mood, e.about)`). `OH_MOOD_WORDS` (en, es). No new control. |
| `WebXR/shared/hw-hive-world.js` | `hwSyncRoom` asks the hive for the briefing when it mounts the operations room (`m.briefing = source.brief()`); the hive says no outside its window or a second time. |
| `WebXR/shared/h5-ops-room.js` | **Words on the balanced screens.** A small screen (128 × 64 cell) now paints a compact card in words (name, "software agent", the queue and its first job id, the last line's head) above the trait bars and the talk light; the small wall (256 × 64) paints the feed's last four captions and the last three refusals by job id, and "physical dispatches 0". Same canvases: 0 bytes added. `h5LiteFigure` and the mount are untouched (AVATARS-HD-3's area). |
| `WebXR/instructor/js/h4-hive.js` | The Omega Hive tab's new panel **"Moods and the morning briefing (read-only)"**: each agent's mood at the replayed minute with its cause in words, the day's mood changes so far, and the briefing's seven labelled lines, from a second replay of the same seeded day with moods and the briefing on (the first replay is unchanged). No button, no storage, no new request. |
| `tools/check_hive6.mjs` (new) | Seven sections and the EVAL lines below; in `check_all.mjs` with an **estimated** row in `docs/perf/checkers-baseline.json`. |
| `tools/check_hive5.mjs` | §1's balanced branch said "small screens take no words"; HIVE-6 changed that behaviour, so it now checks the small cards name the agent, say "software agent" and show the first held job, and the small wall shows the feed and the refusals by job id (bytes still unchanged). §5's regex follows `hwSyncRoom`'s new form (the mount is kept to hold the briefing). |
| `tools/bundle_webxr.py` | `h6-moods.js` before `oh-hive.js` in the parishes bundle (and before `oh-panel.js`) and in the instructor bundle. |

## Evals (before → after)

| Measure | Before (230105b7) | After | Source |
|---|---|---|---|
| Mood changes per seeded day (the panel's hive, seeds 1–5, 480 minutes) | **0** (no moods) | **168, 178, 198, 163, 155** (calm 232, busy 88, concerned 271, relieved 271) | `check_hive6` §2 |
| Mood changes traced to the hive's own events | — | **862 of 862** (each cause re-found in the log before it: the refusal that names the agent, the clean audit, the held jobs' awards, or the mood's start and its stated time) | `check_hive6` §2 |
| Lines that carry the speaker's mood / mood phrases in register, language and band | — | **7,137 of 7,137** / **1,163 of 1,163** (16.3% of lines carry a phrase) | `check_hive6` §2 |
| Safety lines with a mood phrase | — | **0 of 1,076** | `check_hive6` §2 |
| Mood voice inside the gentle band | — (one fixed voice per agent) | **1,434 of 1,434** lines (seed 1): shift ≤ 0.05, rate 0.87–1.15, pitch 0.92–1.2; safety lines never faster or higher **220 of 220**; stubbed synth: the shifted rate and pitch on the local voice, 0 utterances with voice off | `check_hive6` §3 |
| Briefing lines grounded | **0** (no briefing) | **35 of 35** (seeds 1–5, 7 turns a day); first jobs equal to the day's first awards **15 of 15**; queue counts re-derived from `ohJobStream`; all in the speaker's band | `check_hive6` §4 |
| Briefing turn-taking | — | **0 overlaps** (one floor, in roster order), headless and in the page | `check_hive6` §4; drive 2 |
| Balanced ops screens with words | **0 of 8** (colour, bars and lights only) | **8 of 8** (7 small cards: 28 words; the small wall: 10), texture bytes unchanged: balanced room with seven speaking figures **85 meshes / 4,394 triangles / 2.77 MiB** (≤ 120 / 6,000 / 3 MiB) | `check_hive5` §1–2 |
| The hive's output with the options off | digests 703aa91da7bb9439 (default, seed 7), 533938515253653d (the panel's day, seed 7), 03f3d7a40c26af91 (seed 1) | **byte-identical 3 of 3** | `check_hive6` §1; `check_hive4` §1 |
| Governor with moods and the briefing on | 154 of 154 checked, 0 physical | **154 of 154** dispatched jobs checked, **3,196 of 3,196** steps, **0** physical; completed, refused, vetoed, declined identical with and without (seeds 1, 7) | `check_hive6` §2, §4 |
| The briefing in the ops room (headless combined case) | — | high: 7 turns, 7 standing, 88 meshes / 4,878 triangles / 21.58 MiB; balanced: 85 / 4,394 / 2.77 MiB; once only | `check_hive6` §7 |
| In the page (oak-west-oakland, high, SwiftShader): entering the ops room at hive minute 0 | — | **7 turns** held, 0 overlaps, **7 of 7 standing**, **8 of 8** screens painted; 88 meshes, **4,878 triangles built**, 88 draw calls, 3 lights, 21.58 MiB; after 90 minutes 35 mood changes, the panel's chips calm/relieved/concerned; page errors 0, off-host 0 | drive 2 (`$SP/loop10/h6/drive2.txt`) |
| Console tab | no moods, no briefing | the moods panel: 7 rows ("software agent", the mood, its cause), 49 changes by minute 120, the 7 briefing lines; 0 buttons, 0 storage keys | drive 2 |

## Cycles (reason → act → observe)

1. **Pin the base before touching anything.** Reason: the options must leave the default and the panel's hive byte-identical.
   Check: the seed-7 default day and the panel's days (seed 7, seed 1) as event digests at 230105b7. Act: `moods` and `briefing`
   off by default; with them off, `speak()` takes round 3's path. Observe: 3 of 3 digests unchanged after every edit (§1).
2. **The checker's first run: three failures, two real.** (a) An agent turned **busy at its own completion**: the complete event is
   emitted after the load is released but before the job's status changes, so the held list still counted it. Fix: a job with a
   completion time or a governor rejection is not held. (b) **A briefed first job that the day did not keep** (seed 2, Brann: the
   look-ahead said minute 20, the day awarded at minute 10): the look-ahead ran with no decisions while the day's stand-in approved
   a physical request, which re-entered the bidding first. Fix: the look-ahead uses the hive's own `decide`. (c) The docs did not
   exist yet. Then §1–5 passed: 862/862 traced, 35/35 grounded, 15/15 first jobs.
3. **A re-queued job keeps its id.** The trace for "busy" first rejected a job refused (physical target) and then awarded again
   after approval. The trace now reads from that job's latest award (a checker rule, not a loosening: the job must still be awarded to
   this agent and not closed since).
4. **A checker that encoded the old behaviour.** `check_hive5` §1 required "balanced: small screens take no words"; the compact
   cards change that, so §1's balanced branch now checks what the small cards and wall say (same commit, with the reason in the
   file), and §5's regex follows `hwSyncRoom`'s kept mount. `check_hive5` 5/5.
5. **The drive, then looking at the stills.** Drive 1 (65 s, page errors 0): the briefing held 7 turns at minute 0, 0 overlaps,
   7 standing. Looking at the stills: the opener's caption read "morning briefing: Morning briefing: …" (template changed to
   "Good morning: …"); the front view put the figures' labels over the wall (retaken from the door-side corner); the panel still
   showed the room, not the panel (dropped: the tab shows the moods instead). Drive 2 (68 s) after the rebuild: all three fixed.
6. **The combined case (round 5's integration lesson).** §7 builds the ops room, enters it at minute 0 through `hwSyncRoom` and
   checks the briefing, the seven figures, the wall and the budget on high and balanced. First run: balanced failed on "the wall
   carries 'morning briefing'": the 256-px wall's half cuts each caption at about 30 characters. The check now requires the heads of
   the last four briefing captions there (what the small wall can show); the limit is in "Read honestly".
7. **Neighbours.** `check_hive4` 11/0 (digest and the tab), `check_hive5` 5/0, `check_omega_hive` 15/0, `check_voices` 10/0,
   `check_hive3` 32, `check_hive_world` 35 — all on the first run after the change.

## Checkers (single runs)

- `node tools/check_hive6.mjs`: **7 passed, 0 failed** (§6 checks these docs).
- `node tools/check_hive5.mjs`: 5 passed, 0 failed. `check_hive4`: 11 passed, 0 failed. `check_omega_hive`: 15 passed, 0 failed.
  `check_voices`: 10 passed, 0 failed. `check_hive3`: all 32 pass. `check_hive_world`: all 35 pass.
- `check_newton`, `check_imports`, `check_parse`: see the hand-back (run last). `check_interface`: not required (no control added or
  changed; the mood chip is a label).
- Not run: `tools/check_all.mjs` (the coordinator gates).

## Stills (`$SP/loop10/h6/`, 1920 × 1080, each looked at)

- `h6-briefing-room.png`: the hive operations room at hive minute 0 from the door-side corner: the seven agents at their consoles
  under their "software agent · role" labels, the wall's feed carrying the briefing's labelled captions ("00:00 Brann (software
  agent) · morning briefing to Orrin: First up for me is vbjob-… at Fabrication Robot Cell (procedural)" and the turns after it).
- `h6-briefing-wall.png`: the wall and the middle consoles close up: "Today's feed · hive minute 0 (00:00)" with five labelled
  briefing captions, "Governor refusals: No refusals yet", "physical dispatches 0", and the consoles' cards with each agent's
  briefing line under "Last lines".
- `h6-console-moods.png`: the instructor console's Omega Hive tab, "Moods and the morning briefing (read-only)" at hive minute 120:
  each agent's mood and its cause ("concerned — after the governor's refusal of vbjob-241c… (physical-target) at 01:56", "relieved —
  after a clean audit at 01:54 (160 chain lines intact)") and the seven briefing lines.
- `h6-briefing-wall-balanced.png` and `h6-briefing-room-balanced.png` (drive 3, balanced, 57 s, page errors 0, off-host 0; in the page
  85 meshes, 4,394 triangles built, 2.77 MiB, 7 briefing turns): the small console cards in words ("Ivo · software agent · Queue 0 ·
  00:00 Supervisor (this device) h…", "Tamsa … 00:00 I start with vbjob-1cc7b1…") and the small wall's cut captions
  ("… (software agent) · mo…", "physical dispatches 0"). In the close view Ivo's figure stands in the left foreground; in the front
  view the figures' labels cover part of the wall.

## Read honestly

- The moods are rules over the hive's events, not feelings: four states, fixed thresholds, a fixed phrase set (two per mood and
  register). Concerned and relieved come in pairs because every clean audit relieves every concerned agent; with an audit after
  every five closed jobs, concern rarely lasts its full 30 minutes.
- The briefing's "first job" is the hive's own seeded queue played forward with the hive's own decisions. In the page the learner
  decides; an approval re-queues a job, so a learner who approves a physical request in the first minutes can change who wins a
  job first. Headless with the same decisions it holds 15 of 15.
- The briefing runs only when the learner enters the ops room in the hive's first 30 minutes, once; later entries hold none.
- The balanced screens' words are small (6–10 px on a 128 × 64 cell; 6–8 px on the 256 × 64 wall, each caption cut at about 30
  characters): legible close to a console, not from across the room. More pixels would cost about 0.75 MiB the 3 MiB room
  budget does not have (2.77 MiB with seven figures).
- A mood phrase is joined to the first sentence that fits the band, which is sometimes the closer ("Good teamwork, …, careful after
  that refusal."). The Spanish phrases and briefing lines are machine-assisted and need a native speaker's review.
- The figures receive the `mood` events but AVATARS-HD-3's code does not use them yet (`aa-*.js` were not mine to edit).

## Seams

- `ohHive({ moods, briefing })`; events `{ type: "mood", agent, mood, from, cause }`; speak events' `mood`, `moodCause`,
  `moodPhrase`, `briefing: { id, turn, of }`; `hive.brief()`, `hive.mood(id)`, `hive.briefed()`, `metrics().moodChanges`.
- `H6_MOODS`, `H6_MOOD_RULES`, `H6_SAFETY_KINDS`, `H6_MOOD_PHRASES`, `H6_VOICE_SHIFT`, `H6_VOICE_BAND`, `H6_MOOD_VOICE`, `H6_BRIEF`,
  `h6MoodTracker`, `h6WithMood`, `h6MoodVoice`, `h6VoicedAgent`, `h6BriefFirstJobs` (h6-moods.js).
- **AVATARS-HD-3:** a figure can listen for `mood` (e.g. posture or halo tempo); `briefing.turn` orders the room's talk.
- The ops-room mount returned by `hwSyncRoom` carries `briefing` (the speak events, or null).

## Left

- Figures that show the mood (AVATARS-HD: posture, gesture tempo or halo; no new geometry needed).
- The live console link (`h5LiveSnapshot`) does not carry moods; the tab's moods panel is a replay even when the cards are live.
- A larger balanced cell grid if ENV-HD can free texture budget in the room (measure before and after).
- A native speaker's review of `H6_MOOD_PHRASES.es`, `OH_CORES_BRIEF_ES` and `OH_MOOD_WORDS.es`.
- `check_hive6`'s baseline row is an estimate; re-measure on a quiet gate. The dist bundles were rebuilt for the drive and restored.
