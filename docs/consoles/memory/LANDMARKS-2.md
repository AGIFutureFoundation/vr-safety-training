# LANDMARKS-2 — memory

- Kit: `WebXR/shared/lm-landmarks.js` now 35 kinds (14 LANDMARKS + 21 `lx`), one mesh each, `LM_BUDGET` per kind with a phone
  tier; `truss-bridge` joined `LM_BRIDGES` (fitted to the bridge road like the suspension kinds).
- Tags: `tools/lx_tag_landmarks.mjs` (`LX_TAGS`, idempotent) — 32 tags written into `np-data-*.js`; two more landmarks draw
  through their own `kind` (the windmills, the Castro marquee). 59 of 197 landmarks on 18 of 22 maps draw with the kit (was 24).
- Left generic on purpose: Fort Jackson (a site sits on it, water round it), San José's basilica, Tower Hall, the twin spans,
  Downtown Berkeley (underground), parks/shores/neighbourhoods. `tide-gate` has no honest tag yet.
- Walk-ins: `WebXR/shared/lx-walkin.js` (market-hall, lamp-room, pier-shed, glasshouse), mounted in `WebXR/parishes/js/app.js`
  (door prompt, outdoor root hidden + no streaming inside, box collider, E out). INTERIORS seam: `ix.ixBuildRoom(style, {three,
  tier, w, d, h})` via `globalThis.IX_INTERIORS`, guarded.
- Checker: `tools/check_landmarks.mjs` now walks all 22 maps (~70 s) and the walk-ins; prints worst-chunk meshes per map.
