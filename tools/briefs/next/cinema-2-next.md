# CINEMA-2 — next phase

The recorder is `tools/record_backgrounds.mjs` with the shots in `tools/record_backgrounds.json`; seven clips now cover 21 slots (docs/home-backgrounds.md). Sierra Summit and Redwood Reach have loops on their cards and start screens; the track bands follow the world hosting most of a programme's stations (42 Bay World, 6 Deep, 5 Summit, 2 Redwood, 5 default); the Deep loop has capture-time sunbeams; Fairway's frame keeps the tee-side tree in shot. Measured sizes are in the console log's hand-back entry.

## Brief for the next team

1. **Fairway Park needs something near the tee.** The course draws only round the player and Fairway exposes no teleport hook, so the camera cannot leave the first tee, where the nearest tree is 60 m off and the running track reads as an orange band. Add a small `window.__fairwayTest = { app, teleport }` (the other worlds have one) and record from the first green (flag, bunker, trees within 20 m); or add tee-box furniture (markers, a bench, a ball washer) that the frame can hold.
2. **Own clips for the surfaces that reuse the hero:** `atlas-header`, `signin`, `holodeck-landing` and `track-default`. A Holodeck course loop needs the generator page to expose a scene; the Atlas is a 2-D map, so a slow pan rendered from the map canvas would do (record with `--probe` first).
3. **Per-district Bay World bands.** 42 of 60 programmes still show the same Bay World card loop; a per-zone clip (port, downtown, hills) keyed from the programme's first Bay World site's `zone` would make them distinct. `trackWorld` already reads the sites; add a `trackZone` beside it and `track-bayworld-<zone>` slots.
4. **Engine-side realism** stays open from CINEMA's brief: FXAA in capture mode, a warmer dusk band, sailing yachts in the Regatta fleet. The Deep's sunbeams are capture-only planes in the recorder's `deep-sunbeams` hook; if the world gains real light shafts, drop the hook.
5. **Budget watch:** the hero ≤ 2.5 MB, every other slot ≤ 1.2 MB per file (check_home). Redwood's dense trunks and Summit's water cost the most; `crf` per shot is in the JSON.
