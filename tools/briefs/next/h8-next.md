# HIVE-8 next (`h8`)

Read `docs/consoles/HIVE-8.md` (Evals, Read honestly, Seams, Left) and `docs/consoles/memory/HIVE-8.md`, then
`WebXR/shared/h3-hive-day.js` (`h3SceneHive`, `h3SceneRelay` `follows`/`mood`), `oh-hive.js` (`briefFix`, `briefLost`),
`h5-ops-room.js` (the glow seeding) and `tools/check_hive6.mjs` §4 and §11. Single checkers only. Rebuild the bundles
(`python3 tools/bundle_webxr.py parishes`) before any drive, and restore the committed dist after. Do not edit `aa-*.js` unless the
round gives them to you.

1. **Posture and glow agree from the first frame** (with AVATARS): once the aa mount seeds `state(id).mood` from `source.mood(id)`,
   re-run the page drive. Today posture = glow is 3 of 6 to 4 of 7 built at minute 36, because the calm agents read null.
   - Check: drive A's samples show posture = glow = `hive.mood(id)` for N of N built figures; a `check_hive6` line for the scene's
     cell hall reopened mid-scene (the figures start from `relay.mood(id)`).
2. **A still of a mood in the scene**: pause the scene clock at the award beat (or add a `hiveScene({ hold })` for captures), so the
   busy planner can be shot in software rendering.
   - Check: the still is looked at, and the planner's `state(id).mood` reads busy in the drive line beside it.
3. **A native speaker's review** of the Spanish (`H6_MOOD_PHRASES.es`, `OH_CORES_BRIEF_ES` including `brief_fix` and `brief_lost`,
   `OH_SECOND_ES`, `OH_MOOD_WORDS.es`). Do not mark it reviewed without one.
   - Check: `check_hive6` §10 passes, and the changes are listed in the console note.
4. **Re-measure** `check_hive6` on a quiet gate (load under 2) and replace the 45 s estimate.

## Rules that stay

Agents are software and say so. No LLM or network call: moods and correction lines come only from the hive's own events and awards,
and a grounding check proves them. Safety lines never carry a mood phrase. The default hive and the default scene stay byte-identical
with the options off (`check_hive6` §1, §11). Voice is on-device only and off by default; captions always show; nothing listens. The
governor's rules stand. Never run `tools/check_all.mjs`; never commit `docs/perf/checkers-last.json` or measured timings.
