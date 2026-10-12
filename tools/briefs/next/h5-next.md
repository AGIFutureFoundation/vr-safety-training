# HIVE-5 next (`h5`)

Read `docs/consoles/HIVE-5.md` (Evals, Read honestly, Seams, Left) and `docs/consoles/memory/HIVE-5.md`, then
`WebXR/shared/h5-ops-room.js`, `h5-hive-live.js`, `hw-hive-world.js` (`hwSyncRoom`), `oh-hive.js` (`homeward`),
`WebXR/instructor/js/h4-hive.js` and `tools/check_hive5.mjs`. Single checkers only; rebuild the bundles
(`python3 tools/bundle_webxr.py parishes` and `instructor`) before any drive and restore the committed dist files after.

1. **A lighter figure from AVATARS-HD in the ops room.** `h5LiteFigure` coarsens AGENT-AVATARS' figure (1,008 → 408 triangles) so
   seven fit IX_BUDGET; the heads and torsos read faceted. Use AVATARS-HD's lighter variant when it lands (pass it as the mount's
   figure, drop `lite()`), and HD for the console nearest the learner if it fits.
   - Check: `check_hive5` §2 still 7 of 7 standing and inside IX_BUDGET and IXR_TEX_BUDGET at every step on high and balanced.
2. **Walk round the consoles.** Figures walk straight between the door and their spots; route them round the room's colliders
   (`room.colliders`, the consoles and chairs) with `hwRouter`-style routing or the mount's `route`.
   - Check: in a seeded day, no walk segment crosses a console or chair box (N of N walks).
3. **Words on balanced screens.** Balanced draws 128 × 64 cells (no words). A 256 × 128 cell grid on balanced may fit its 3 MiB with
   seven figures (today 2.77 MiB); state the budget and measure it.
   - Check: `check_hd4` §6 and `check_hive5` §1–2 on balanced; the room stays ≤ 3 MiB.
4. **A native speaker's review** of `H5_SCREEN_TEXT.es` and `H5_LIVE_TEXT.es` (with the rest of the Spanish pack).
   - Check: `check_hive5` passes; no English fragment in a Spanish screen but names.
5. **Re-measure** `check_hive5` on a quiet gate and replace the estimated row in `docs/perf/checkers-baseline.json`.

## Rules that stay

Agents are software and say so (the label, hologram tint, visor and halo; the cards say "software agent"). No LLM or network call:
every word on a screen and in the tab comes from the hive's own events. The console link stays opt-in, local (a same-origin
BroadcastChannel), never stored, and the tab stays receive-only. The governor's rules stand. Rooms stay inside IX_BUDGET and
IXR_TEX_BUDGET; the phone tier builds no figures. New controls are at least 44 px on a 390×844 phone. Never run
`tools/check_all.mjs`; never commit `docs/perf/checkers-last.json` or measured timings.
