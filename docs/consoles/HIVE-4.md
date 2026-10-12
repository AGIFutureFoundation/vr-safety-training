# HIVE-4 (`h4`, port 9122): the hive's voices, memory and console

Loop 10, round 4. Base 048869d5 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This console builds on OMEGA-HIVE,
VOICES, HIVE-IN-WORLD and HIVE-3.

Agents are software and say so. No LLM or network call: every line, exchange and memory reference is generated on the device
from the persona and the hive's own events and chain, and a grounding check proves every fact. Voice is on-device only
(`localService` true), off until the learner turns it on; captions always show; nothing listens. The governor's rules stand:
the e-stop comes first, the physical path stays disabled, and the learner approves anything that names a robot.

## Declaration (committed before the held-out run)

This section was committed before `tools/check_hive4.mjs` first ran the held-out trait-recovery test. The result is reported
below exactly as measured, whatever it is.

**Trait recovery from text.**
- **Unit:** a persona-day. Personas come from seeds 1–100. Each persona's four traits are drawn uniformly in [0, 1]
  (mulberry32 seeded with `seed * 7919 + 13`, rounded to 3 decimals). Its padding lexicon is that of `OH_AGENTS[seed % 7]`,
  which is unrelated to the drawn traits. Its style is `ohStyleFromTraits(traits, lexicon)`.
- **Lines:** each persona re-says every speak event of the seeded hive day for its own seed (`ohHiveDay(seed, { nJobs: 60,
  ticksPerDay: 160, decide: <the checker's seeded stand-in>, exchanges: true, memory: true, variety: true })`), from the event's
  facts only, through `ohSay(persona, facts, { variety: true, recent: <its last four lines> })`.
- **Fit seeds:** 1–50. **Held-out seeds:** 51–100. Nothing from seeds 51–100 is used to fit or tune.
- **Features** (text only, per line, averaged over the persona's lines), eight:
  1. words per sentence (`ohWords` over `ohSentences`);
  2. sentences per line;
  3. opener share: the line starts with one to four words ending in "," or ":" and its first word is not an agent's name;
  4. warm words per line: `thanks|thank|glad|nice|good|cheers|everyone|team|teamwork|friends|hi|hey|great|pleased|gladly|kindly|patience`;
  5. formal words per line: `note|noted|record|recorded|confirming|kindly|please|verified|logged|clarity|may`;
  6. careful phrases per line: `simulated robot only|e-stop|governor agrees|site's limits|safe|checking`;
  7. brisk phrases per line: `without delay|right away|as quick as the rules allow|moving on|next|done here|onward|that is all`;
  8. commas per sentence.
- **Regressor:** per trait, ridge regression (lambda = 1) on the features z-scored with the fit set's mean and SD, with an
  unpenalised intercept.
- **Reported:** the Spearman rank correlation per trait over the 50 held-out personas. Secondary: the seven real agents
  re-saying the seed-101 day (a rank correlation over 7 points; small n, reported but not the claim).

**Repetition (distinct-2).** Per agent, over its lines in the seed-7 day (the checker's stand-in decisions). Tokens are lowercased
words with facts masked (a job id becomes J, a site name S, an agent name A, a number or clock N). Bigrams are taken within a
line; distinct-2 is unique bigrams over all bigrams. **Before** is the default hive (`check_hive4` shows it is byte-identical to
the base); **after** is the panel's configuration (exchanges, memory, variety). A third column, variety only on the same events
as before, separates the wording from the new lines.

## Evals (before → after; `node tools/check_hive4.mjs`, rows also in `WebXR/instructor/hive4-evals.json`)

| Measure | Before (048869d5) | After | Source |
|---|---|---|---|
| Exchanges per seeded day (seed 7, 200 jobs) | 0 | **258** (handoff 173, question 45, report 40); seeds 1–5 at 120 jobs: 174, 163, 162, 156, 158 | check_hive4 2 |
| Exchange lines grounded (facts re-derived from the award, the winning bid or the chain) | n/a | **516 of 516**; 776 of 776 sentences in the speaker's band | check_hive4 2 |
| Turn-taking | n/a | 258 of 258 replies directly after their opener; 0 overlaps over 1,294 lines on the floor; stubbed voice: 56 of 56 in order, local only, at most 1 at once | check_hive4 2, 5 |
| Memory references per seeded day | 0 | **36**, from 4 agents; **36 of 36** grounded in the chain prefix; planted errors caught 3 of 3 | check_hive4 3 |
| Spanish: exchanges and memory references (the panel's Spanish hive, seed 7) | 0 and 0 (an exchange fell back to the single round-3 line) | **258 and 36**; 516 of 516 and 36 of 36 grounded; 869 of 869 sentences in band; 0 English fragments but names; captions "… (software agent) a …" | check_hive4 3b |
| Governor with the talk on | 161 of 161 checked, 3,631 of 3,631 steps, 0 physical | **161 of 161, 3,631 of 3,631, 0 physical**; outcomes identical; e-stop held: 0 runs | check_hive4 4 |
| Trait recovery, Spearman, held-out personas 51–100 | not measured | **Now:** warmth 0.959, formality 0.832, verbosity 0.977, caution 0.799. Earlier readings, all reported: the first run right after the declaration 0.963, 0.812, 0.979, 0.804; after the band fix (padding only) 0.958, 0.795, 0.980, 0.798; the current figures follow the steward's question cooldown (fewer questions in the re-said days). The seven agents (n = 7): 0.964, 0.929, 1, 0.643 | check_hive4 6 |
| Distinct-2 per agent (fact-masked) | Orrin 0.057, Selka 0.145, Brann 0.078, Ivo 0.237, Tamsa 0.060, Quen 0.116, Lio 0.050 | Orrin 0.075, Selka 0.159, Brann 0.161, Ivo 0.320, Tamsa 0.110, Quen 0.155, Lio 0.115: **7 of 7 up** (before the steward's cooldown the steward fell to 0.097); variety only on the same events: 7 of 7 up | check_hive4 7 |
| Omega Hive tab | none | 7 cards (7 portraits, 7 "software agent" labels), 65 lines (32 exchange turns, 3 memory), 20 refusals, 12 eval rows; 0 buttons; phone: tab 96×44, select 116×44, no sideways scroll; page errors 0, off-host 0 | drive `$SP/loop10/h4/drive_stills.mjs` part I |

**Read honestly.** Trait recovery is high because the style grammar is a deterministic function of the traits and the features read
that grammar's vocabulary; it shows the traits reach the text, not that the text is natural. The steward first repeated more with the talk
on (about a hundred questions a day from six templates); a cooldown and more variants fixed that (cycle 9). The question rule (contested, another map or a load) is a
rule, not a judgement. The learner in the checker is a seeded stand-in.

## Cycles

1. Reason: exchanges and memory must not move round 3's figures. Check: the seed-1 and seed-7 default days byte-identical to a git
   archive of the base. Act: all three options off by default. Observe: identical (digest 703aa91da7bb9439, pinned in §1).
2. Reason: every fact grounded by a strict check, not the speak event. Check: §2 and §3. Observe: 632/632 and 36/36 on the first run.
3. Reason: lines in the band. Check: §2, §3 sentences in band. Observe: **failed**, 28 of 943 and 2 of 93: closers ran out of fresh
   padding. Fix: fresh pads first, then the agent's others. Then 943/943 and 93/93.
4. Reason: the declared held-out test, once. Observe: the figures above (first run and final both reported).
5. Reason: the tab must read its JSON from the page. Check: the drive. Observe: the drive serves `WebXR/` as root, so `docs/` was
   unreachable; the JSON moved beside the page and the tab tries the dist path, then the source path. Then 10 eval rows, page errors 0.
6. Reason: neighbours. Observe: check_omega_hive 15/0, check_voices 10/0, check_hive_world 35/35, check_imports 1,119 ok, check_newton
   pass, check_console pass. Then `check_parse` (all 2,698 shipped modules parse) and `UX_PORT=9122 check_interface` (21 passed,
   0 failed): nothing to fix.
7. Reason: a still of two figures in an exchange, in the world. Check: both figures' caption bubbles carry the two turns of one
   exchange at the moment of the shot (read from the room's avatar state). Act: `$SP/loop10/h4/drive_world.mjs`: step the page's hive
   outdoors to t=132 (the room reads who is present only when it opens, so the figures carry no backlog of lines), enter the cell hall,
   step t=133 (Selka questions Brann, both at the SoMa cell, neither moves), poll until both bubbles show their turn. Observe: the
   first frame from the room's preset camera had Brann standing in front of Selka; the second, framed from the side, stood inside
   the cell's fence with a post through Brann's bubble; the third, from the far side, shows both figures and both labelled bubbles.
8. Reason: the talk in Spanish, with the same slots and the same strict grounding. Check: check_hive4 3b on the panel's Spanish hive.
   Act: `OH_CORES_TALK_ES`, `OH_SECOND_ES`, `OH_TASK_NOUNS_ES` (a task kind is named by the event's task type, so no English noun is
   left in a Spanish line) and the caption's connector by language ("a"). Observe: passed on the first run (632 of 632 and 36 of 36
   grounded, 1,037 of 1,037 in band, 0 English fragments); check_voices 10/0 and check_omega_hive 15/0 unchanged.
9. Reason: the steward's repetition. Check: check_hive4 7 shows 7 of 7 agents at or above the before figure. Act: the steward questions
   at most one bid every 6 hive minutes (`OH_QUESTION_COOLDOWN`), with two more question variants per kind and two more answers (true
   under tied bids: "no bid beat …"), in both languages. Observe: questions 103 -> 45 a day, the steward 0.145 -> 0.159, 7 of 7 up.
   The t=133 exchange survived the cooldown with new wording, so the cell-hall still was taken again on the rebuilt bundle.

## Checkers (single runs)

- `node tools/check_hive4.mjs`: 11 passed, 0 failed.
- `node tools/check_omega_hive.mjs` 15/0; `check_voices` 10/0; `check_hive_world` all 35 pass; `check_console` all pass.
- `node tools/check_imports.mjs`: all 1,119 modules; `node tools/check_newton.mjs`: all pass; `node tools/check_parse.mjs`: all 2,698
  shipped modules parse.
- `UX_PORT=9122 node tools/check_interface.mjs`: 21 passed, 0 failed (the base's known `vc-voice-character` line did not fail here).
- Not run: `tools/check_all.mjs` (the coordinator gates), `eval_worlds` and `eval_content` (no world subject or station changed).

## Stills (`$SP/loop10/h4/`, 1920x1080, each looked at)

- `h4-world-exchange.png`: the cell hall (sf-downtown, seed 1, hive minute 133). Selka (software agent · safety steward) and Brann
  (software agent · maintenance planner) side by side, each under a bubble that names speaker and addressee: "Selka (software agent)
  to Brann: For the record, Brann, your load is 1; is a bid of 0.35…" and "Brann (software agent) to Selka: It holds, Selka: skill 1
  and the top bid at 0.35. Thanks for checking with…". The camera was placed by the drive; page errors 0, off-host 0.
- `h4-panel-memory.png`: the Omega Hive panel (the menu's Learn tab), the feed at hive minute 16 with Lio's memory line in italics
  ("That makes 2 routing runs for me today. Last one: Automated Warehouse Aisle (procedural), 00:09 hive time.") and the auditor's
  report with the dispatcher's reply indented under it.
- `h4-console-hive-tab.png` and `h4-console-evals.png`: the instructor console's Omega Hive tab (cards, lines, refusals with reasons,
  the ten eval rows).

## Seams

- `ohHive({ exchanges, memory, variety })`; speak events carry `exchange: { id, kind, turn, of, with }`, `toAgent`, `floor: { startMs,
  endMs }` and, for memory, `memory: true`, `count`, `kinds`, `lastSite`, `lastSiteId`, `lastJobId`, `lastAt`, `clock`, `logSeq`.
  AVATARS-HD: start a figure's mouth at `floor.startMs` when voice is off so the two speakers take turns in the world.
- `ohRecall(chain, agentId, taskType)`, `ohClock(at)`, `ohLineMs(text)`, `OH_FLOOR`, `OH_EXCHANGES`, `OH_TASK_NOUNS`,
  `OH_QUESTION_COOLDOWN`; Spanish: `OH_CORES_TALK_ES`, `OH_SECOND_ES`, `OH_TASK_NOUNS_ES` in `OH_PACKS.es` (memory events carry `taskType`).
- `h4MountHiveTab(root, { seed, steps })`; the portrait is `aaPortraitImg` (swap in AVATARS-HD's export when it lands).

## Left

- The Spanish talk lines are machine-assisted and need a native speaker's review, like the rest of the Spanish pack.
- A pad can repeat across the sentences of one line (the round-3 grammar does the same); the padding could skip pads already used in
  the line.
- The tab replays a seeded day rather than reading the learner's own hive.
- Dist bundles were rebuilt for the drive and are not committed. The `check_hive4` baseline row is an estimate.
