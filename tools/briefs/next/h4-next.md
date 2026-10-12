# HIVE-4 next (`h4`)

Read `docs/consoles/HIVE-4.md` (Declaration, Evals, Seams, Left) and `docs/consoles/memory/HIVE-4.md`, then `WebXR/shared/oh-hive.js`
(`exchanges`, `memory`, `variety`, `ohRecall`, `OH_FLOOR`), `oh-say.js` (`OH_CORES_TALK`, `OH_SECOND`, `ohSayMore`),
`WebXR/instructor/js/h4-hive.js` and `tools/check_hive4.mjs`. Single checkers only; rebuild the bundles before any drive.

1. **The talk in Spanish.** Add `talk` and `second` packs to `OH_PACKS.es` (handoff, confirm, question_far, question_load, answer,
   report, ack, memory, memory_reset), machine-assisted and marked for a native speaker's review.
   - Check: `check_voices` §10 still passes; a Spanish talk day in `check_hive4` §2 and §3 grounds N of N with every sentence in band.
2. **Figures follow the floor.** AVATARS-HD's mouth and gestures can start each speak event at `floor.startMs` when voice is off, so
   the two speakers of an exchange take turns in the world too.
   - Check: in a drive with voice off, no two figures' talk windows overlap within a step (N of N steps).
3. **The steward's repetition.** distinct-2 for the steward fell (0.145 -> 0.097) because it now asks about 100 questions a day from
   six templates. Add question variants or ask less often (a cooldown like the memory's).
   - Check: `check_hive4` §7 shows 7 of 7 agents at or above the before figure, and §2 still grounds N of N.
4. **The console tab, live.** Today it replays the seeded day. Read the learner's own hive lines when the console runs on the same
   device (only through a consented, local channel), and keep the replay as the fallback.
   - Check: `check_console` and `check_hive4` §8 pass; nothing is written by the tab.
5. **Re-measure** `check_hive4` on a quiet gate and replace the estimated row in `docs/perf/checkers-baseline.json`.

## Rules that stay

Agents are software and say so. No LLM or network call; every fact in a line comes from the event or the hive's own chain and a
grounding check proves it. On-device voices only, off by default; captions always show; nothing listens. The governor's rules
stand. New controls are at least 44 px on a 390x844 phone. Never run `tools/check_all.mjs`; never commit
`docs/perf/checkers-last.json` or measured timings.
