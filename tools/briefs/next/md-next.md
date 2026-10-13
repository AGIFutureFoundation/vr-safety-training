# MOODS next (`md2`, or whichever console owns the mood seam next)

Read `docs/consoles/MOODS.md` (Evals, Read honestly, Seams, Left) and `docs/consoles/memory/MOODS.md`, then `WebXR/shared/aa-agent-hd.js`
(`AA_HD_MOOD_POSE`, `aaHdPose`), `WebXR/parishes/js/app.js` (`hiveScene({ seed, hold })`, `h3SceneTick`, `hiveSceneResume`),
`tools/check_hive6.mjs` §11, `tools/check_agent_avatars.mjs` §9m (the cue line) and `tools/drive_moods.mjs`. Single checkers only. Rebuild
(`python3 tools/bundle_webxr.py parishes`) before a drive, one drive at a time on your own port, and restore the committed dist and timing
files after (`git checkout WebXR/*/dist WebXR/dist docs/perf/phone-maps.json docs/perf/reactor.json`).

1. **The cue in a still at 8 m, judged.** `md-ops-room-from-door.png` shows one concerned figure from the entry pose; the §9m line says the
   wrists move 0.22 m or more (26 px at 8 m on 1080 px / 60°). Shoot the same frame with the figure calm (step the hive on, or seed a calm
   day) and put the two stills side by side; say whether the tablet's lowered glow reads at that distance in a flat still.
   - Check: two stills looked at, the distance printed beside each; §9m's cue line still true.
2. **Busy and relieved from the door.** Only concerned has a cue that reads from the door (busy is a tempo, relieved 1.2 cm of shoulder).
   If busy needs one, keep it inside the traits' ranges and never on the face or the stop hand; measure it as §9m measures concerned.
   - Check: a §9m line per cue; the stop-hand line (AA_HD_STOP_POSE in every mood) still 7 of 7.
3. **A native speaker's review of the Spanish** (`H6_MOOD_PHRASES.es`, `OH_CORES_BRIEF_ES` with `brief_fix` and `brief_lost`,
   `OH_SECOND_ES`, `OH_MOOD_WORDS.es`). Still open since HIVE-6. Do not mark it reviewed without one.
   - Check: `check_hive6` §10 passes; the changes are listed in the console note.
4. **Timing rows.** If MOODS could not re-measure `check_hive6` and `check_agent_avatars` at load under 2 (see its note), do it on a quiet
   gate and replace the estimates in `docs/perf/checkers-baseline.json`, labelled as measured with the load beside them.

## Rules that stay

Agents are software and say so: every caption keeps "(software agent)", every figure its label. No LLM or network call: a mood comes only
from the hive's own events, a correction only from its own award, and the grounding checks prove it. Safety lines never carry a mood phrase.
Moods never touch the face or the stop hand. The default hive, the default scene (no `hold`) and the figures with no mood event stay
byte-identical (`check_hive6` §1 and §11, `check_agent_avatars` §9m's pose hash). Voice is on-device only and off by default; captions
always show; nothing listens. The governor's rules stand. Never run `tools/check_all.mjs`; never commit `docs/perf/checkers-last.json`.
