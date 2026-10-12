# HIVE-4 memory (`h4`, loop 10 round 4)

- Base 048869d5 (fast-forward). Branch: the worktree branch. Port 9122. Scratch: `$SP/loop10/h4/`.
- The talk is opt-in in `ohHive({ exchanges, memory, variety })` so round 3's events stay byte-identical (check_hive4 §1 pins the
  seed-7 digest 703aa91da7bb9439, measured on a git archive of the base). The panel and the console tab turn all three on.
- Exchanges: handoff/confirm (dispatcher and winner), question_far or question_load/answer (steward and a contested winner from
  another map or with a load), report/ack (auditor and dispatcher, clean chain only). Speak events carry `exchange`, `toAgent`
  and `floor`; captions read "<speaker> (software agent) to <addressee>: …".
- Memory: `ohRecall(chain, agentId, taskType)` joins oh-award and oh-complete lines; the line says the count, the last site
  and its hive-clock time (`ohClock`). check_hive4 re-derives all three from the chain prefix (`logSeq`) with its own parser.
- Spanish: `OH_CORES_TALK_ES`, `OH_SECOND_ES` and `OH_TASK_NOUNS_ES` (by the event's `taskType`); captions use "a" for "to".
- The steward questions at most one bid every `OH_QUESTION_COOLDOWN` (6) hive minutes.
- Trait recovery readings, all reported: first 0.963/0.812/0.979/0.804, after the band fix 0.958/0.795/0.980/0.798, now
  0.959/0.832/0.977/0.799 (fewer questions in the re-said days). No tuning on the held-out seeds.
- Trait recovery was declared in ca8e2deb before the first held-out run; the first run's numbers are the reported ones.
- The instructor tab is `WebXR/instructor/js/h4-hive.js` (read-only replay, `audit: null`, the evals JSON by fetch).
