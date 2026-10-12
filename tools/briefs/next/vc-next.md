# VOICES next (`vc`): what the next console does

Read `docs/consoles/VOICES.md` (Seams and Left), `WebXR/shared/vc-voices.js`, `oh-voice.js`, `npc.js`, `oh-say.js`,
`oh-hive-data.js`, `tools/check_voices.mjs`, `tools/drive_voices.mjs`.

1. **Native-speaker review of the Spanish pack** (`OH_CORES_ES`, `OH_REASON_PHRASES_ES`, the Spanish pools and padding in
   `oh-hive-data.js`): the platform's rule is that every non-English table is machine-assisted until a native speaker has reviewed
   it. Keep the slots and the band (`check_voices` section 10 must still pass: 7 of 7 agents, every sentence inside its band,
   every fact grounded). Then translate the hive panel's own UI text through `i18n` (roster cards, the note, button labels, the
   agents' role sentences), which is still English.
2. **A third language** for the hive: a new core table, pools, padding, voice names and a tag in `OH_LANGS`, picked by `ohLangFor`.
   Check: section 10 generalised over the languages in `OH_LANGS`.
3. **Characters in another language** needs verbatim sources in that language (the Guide's notes, the registries and the catalog are
   English). Do not machine-translate a pack line; until sources exist a character speaks English with an English voice and the
   note says so.
4. **Real devices:** run `tools/drive_voices.mjs` with a real `speechSynthesis` on Chrome, Safari and Firefox (a real voice list
   loads late: confirm the `voiceschanged` refresh), and tune `VC_TEMPERS[t].prefer` to the voice names those platforms ship.
5. **Voice settings in Bay World, Summit and Redwood** (today only the dialogue panel's row), and a learner-chosen voice per
   character, kept on the device and revocable, still local only.
6. **Re-measure** `check_voices` on a quiet gate and replace the estimated row in `docs/perf/checkers-baseline.json`.

Check: `node tools/check_voices.mjs`, `node tools/check_npc.mjs`, `node tools/check_omega_hive.mjs`, `node tools/check_imports.mjs`;
rebuild with `python3 tools/bundle_webxr.py parishes bayworld summit redwood` and run `node tools/drive_voices.mjs 9102`.
