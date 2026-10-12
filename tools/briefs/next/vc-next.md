# VOICES next (`vc`): what the next console does

Read `docs/consoles/VOICES.md` (Seams and Left), `WebXR/shared/vc-voices.js`, `oh-voice.js`, `npc.js`, `tools/check_voices.mjs`.

1. The hive in a second language (OMEGA-HIVE's next item 5), if round 2 did not finish it: per-language phrase cores in `OH_CORES`
   picked by the page's language, `ohGrounded` and style adherence per language, voices still local only. Check: `check_omega_hive`.
2. The characters' packs are English only. A second language needs a verbatim source in that language; until one exists a character
   speaks English with an English voice, and the note says so. Do not machine-translate a pack line.
3. Per-device voice tuning: a learner-chosen voice for a character (kept on the device, revocable), still local only.
4. Make the voice settings available in Bay World, Summit and Redwood menus (today the dialogue panel's row is the only control there).
5. Measure in a real browser with a real voice list (the drive uses a stubbed `speechSynthesis`).

Check: `node tools/check_voices.mjs`, `node tools/check_npc.mjs`, `node tools/check_omega_hive.mjs`, `node tools/check_imports.mjs`.
