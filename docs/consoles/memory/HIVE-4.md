# HIVE-4 memory (`h4`, loop 10 round 4)

- Base 048869d5 (fast-forward). Branch: the worktree branch. Port 9122. Scratch: `$SP/loop10/h4/`.
- The talk is opt-in in `ohHive({ exchanges, memory, variety })` so round 3's events stay byte-identical (check_hive4 §1 pins the
  seed-7 digest 703aa91da7bb9439, measured on a git archive of the base). The panel and the console tab turn all three on.
- Exchanges: handoff/confirm (dispatcher and winner), question_far or question_load/answer (steward and a contested winner from
  another map or with a load), report/ack (auditor and dispatcher, clean chain only). Speak events carry `exchange`, `toAgent`
  and `floor`; captions read "<speaker> (software agent) to <addressee>: …".
- Memory: `ohRecall(chain, agentId, taskType)` joins oh-award and oh-complete lines; the line says the count, the last site
  and its hive-clock time (`ohClock`). check_hive4 re-derives all three from the chain prefix (`logSeq`) with its own parser.
- Spanish: no talk cores yet; an exchange falls back to the single round-3 line and no memory line is said.
- Trait recovery was declared in ca8e2deb before the first held-out run; the first run's numbers are the reported ones.
- The instructor tab is `WebXR/instructor/js/h4-hive.js` (read-only replay, `audit: null`, the evals JSON by fetch).
