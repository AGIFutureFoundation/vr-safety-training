# HIVE-6 next (`h6`)

Read `docs/consoles/HIVE-6.md` (Evals, Read honestly, Seams, Left) and `docs/consoles/memory/HIVE-6.md`, then
`WebXR/shared/h6-moods.js`, `oh-hive.js` (`moods`, `briefing`, `brief()`), `oh-panel.js`, `hw-hive-world.js` (`hwSyncRoom`),
`h5-ops-room.js` (the small screens), `WebXR/instructor/js/h4-hive.js` (`h4MoodPanel`) and `tools/check_hive6.mjs`. Single checkers
only; rebuild the bundles (`python3 tools/bundle_webxr.py parishes instructor`) before any drive and restore the committed dist after.

1. **Figures that show the mood** (with AVATARS-HD): the figures already receive `mood` events; a posture, gesture tempo or halo
   pulse per mood, no new geometry, and the phone tier unchanged.
   - Check: a drive steps the hive to a refusal and reads the figure's mood state = the hive's `mood(id)` (N of N agents); the ops
     room stays inside IX_BUDGET (`check_hive6` §7, `check_hive5` §2).
2. **Moods on the live console link**: add each agent's mood and cause to `h5LiveSnapshot` so the tab's moods panel is live when the
   cards are (keep the replay fallback; still receive-only, never stored).
   - Check: `check_hive5` §3 and a new `check_hive6` line: the live snapshot's moods equal the panel hive's `mood(id)`.
3. **The briefing after the learner's approvals**: when the learner approves a request in the first minutes, re-say the affected
   agent's first job (a one-line correction, grounded the same way), or say in the line that it is the plan before decisions.
   - Check: `check_hive6` §4 with a stand-in that approves at minute 1: first jobs said = first awards N of N.
4. **A native speaker's review** of `H6_MOOD_PHRASES.es`, `OH_CORES_BRIEF_ES`, `OH_MOOD_WORDS.es`.
   - Check: `check_hive6` passes; no English fragment in a Spanish line but names.
5. **Re-measure** `check_hive6` on a quiet gate and replace the estimated row in `docs/perf/checkers-baseline.json`.

## Rules that stay

Agents are software and say so. No LLM or network call: moods and briefing lines come only from the persona and the hive's own
events, queue, awards and chain, and a grounding check proves them. Safety lines never carry a mood phrase or a brighter voice.
Voice: on-device only, off by default, shifts inside the gentle band; captions always show; nothing listens. The governor's rules
stand. The default hive stays byte-identical with the options off. New controls are at least 44 px on a 390x844 phone. Never run
`tools/check_all.mjs`; never commit `docs/perf/checkers-last.json` or measured timings.
