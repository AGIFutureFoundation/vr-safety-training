# HIVE-7 next (`h7`)

Read `docs/consoles/HIVE-7.md` (Evals, Read honestly, Seams, Left) and `docs/consoles/memory/HIVE-7.md`, then
`WebXR/shared/h5-ops-room.js` (`H5_MOOD_GLOW`, the mount's `moods()`), `h5-hive-live.js` (`h5LiveMoods`), `oh-hive.js` (`briefSaid`,
`briefFix`), `WebXR/instructor/js/h4-hive.js` (`h4LiveMoodPanel`) and `tools/check_hive6.mjs` §4, §8–§10. Single checkers only;
rebuild the bundles (`python3 tools/bundle_webxr.py parishes instructor`) before any drive and restore the committed dist after.
Do not edit `aa-*.js` unless the round gives them to you.

1. **The two mood cues agree** (with AVATARS-HD): once the figures take `mood` on the bones (posture), check the posture's mood and the
   glow's mood are the same for every agent at every sampled minute, and decide one owner for the glow material if their figure code
   also brightens it (talk, gesture).
   - Check: a new `check_hive6` line (posture mood = glow mood = `hive.mood(id)`, N of N), and the drive's 7 of 7.
2. **A correction when a briefed job goes to someone else**: today the agent says nothing until its own first award. When the job it
   briefed is awarded to another agent, it could say so at once ("vbjob-… went to Lio; I wait for the next one").
   - Check: `check_hive6` §4's page case: every briefed job given to another agent has a line at that award, grounded, N of N.
3. **A native speaker's review** of the Spanish (`H6_MOOD_PHRASES.es`, `OH_CORES_BRIEF_ES` with `brief_fix`, `OH_SECOND_ES`,
   `OH_MOOD_WORDS.es`); HIVE-7's re-read was a software agent's, for fluency only.
   - Check: `check_hive6` §10 passes; the review's changes listed in the console note.
4. **Re-measure** `check_hive6` on a quiet gate (load under 2) and replace the 30 s estimate in `docs/perf/checkers-baseline.json`
   (the coordinator's gate, or a quiet machine).

## Rules that stay

Agents are software and say so. No LLM or network call: moods, briefing and correction lines come only from the persona and the
hive's own events, queue, awards and the learner's approvals, and a grounding check proves them. Safety lines never carry a mood
phrase or a brighter voice. The mood on a figure never adds geometry or touches a face; reduced motion holds it still; the phone tier
builds no figure. Voice: on-device only, off by default; captions always show; nothing listens. The governor's rules stand. The
default hive stays byte-identical with the options off. New controls are at least 44 px on a 390x844 phone. Never run
`tools/check_all.mjs`; never commit `docs/perf/checkers-last.json` or measured timings.
