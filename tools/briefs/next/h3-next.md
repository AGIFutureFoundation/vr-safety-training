# HIVE-3 next (`h3`)

Read `docs/consoles/HIVE-3.md` (Seams, Left, Read honestly) and `docs/consoles/memory/HIVE-3.md` first, then
`WebXR/shared/h3-hive-day.js`, `hw-hive-world.js` (`hwMountRoomAgents`), `oh-panel.js`, `tools/check_hive3.mjs` and
`tools/drive_hive3.mjs`. Prefix `h3`. Single checkers only. Rebuild with `python3 tools/bundle_webxr.py parishes` before any
drive, and run drives one at a time on your own port.

1. **Native-speaker review of the Spanish.** Covers `H3_PANEL_TEXT.es`, `H3_ROLES_ES`, `H3_CHIPS_ES` and VOICES' pack
   (`OH_CORES_ES`, the pools and the padding). Keep the slots; "gobernador" stands for the safety governor.
   - Check: `check_hive3` §3 still prints 20 of 20, 7 of 7 and 8 of 8, and `check_voices` §10 passes.
2. **An exact talk light with voice on.** Today the light comes on when the line arrives and the voice holds it to onend. When
   voice is on, make the avatar line wait for onstart (an `aaMountAgentAvatars` option, for example `voiced: () => bool`).
   - Check: in `drive_hive3` A2, the light is off just before onstart and on from onstart to onend: N of N, both in the room and
     outdoors.
   - Check: network voices chosen stays at 0.
3. **The scene in Spanish, and the reel capture.** Caption the scene from `h3PanelText`-style tables, so it follows the hive's
   language, and capture `?parish=sf-downtown&hivescene=1` at 1920×1080.
   - Check: the drive's section C passes in both languages.
   - Check: stills land in `$SP/loop10/<console>/`.
   - Check: page errors 0.
4. **Home after a job, outdoors too.** The room sends an agent home when its last job ends; outdoors it stays at the job's site.
   Either add a hive "return" move after the last job (a `move` to `homeSite` with its own line), or document why the views
   differ.
   - Check: `check_omega_hive` and `check_hive_world` pass.
   - Check: `check_hive3` §1 still prints 108 of 108 shown and inside budget at every step.
5. **Settings beyond the parishes page.** Keep the voice and language choices for the characters' dialogue panel in Bay World,
   Summit and Redwood (VOICES' `vcNpcVoice`) under the same profile key family, with the same gate.
   - Check: a reload keeps them for a signed-in profile.
   - Check: demo, K-12 and signed out store nothing.
6. **Re-measure** `check_hive3` on a quiet gate and replace the estimated row in `docs/perf/checkers-baseline.json`.

## Rules that stay

Agents are software and say so: the label (in Spanish, "agente de software"), the hologram tint, no face. No LLM or network
call. On-device voices only (`localService` true), off until the learner turns them on. Captions always show and nothing
listens. Rooms stay inside `IX_BUDGET` and `IXR_TEX_BUDGET`: at most `H3_ROOM_FIGURES` figures, and figures that leave are
released. The phone tier builds no figures. New controls are at least 44 px on a 390×844 phone. The governor's rules stand.
Never run `tools/check_all.mjs`; never commit `docs/perf/checkers-last.json` or measured timings.
