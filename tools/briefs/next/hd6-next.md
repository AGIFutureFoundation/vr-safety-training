# Next for ENV-HD-6 (`hd6`): brief for the next console

Read `docs/consoles/ENV-HD-6.md` (Seams, Cycles, Left) and `docs/consoles/memory/ENV-HD-6.md`, then
`WebXR/shared/hd6-kinds.js` (the kind cues, the board lamp posts, Ultra's facade atlas), `WebXR/shared/hd3-scenes.js`
(the scene solver; `hd3KitRects` reads KREWE's placements), `tools/check_hd6.mjs` and `tools/drive_hd3_scenes.mjs`.

## Do
1. **Every site of the four kinds, not only the busiest.** `hd6KindSites` cues the busiest park, fire station, hospital
   and school (ENV-HD-5's four "kind" presets). The catalog has 54 park, 46 fire-station, 40 hospital and 43 school sites:
   cue every site of those kinds on the loaded map, inside `HD6_KIND_BUDGET` per site and the FC_BUDGET chunk check in
   `check_hd6` §3 (the cue mesh stays one per map). Each placement must pass `check_hd6` §2 (off the carriageways, clear
   of massing and other sites, ≥ 1.5 m from the board) at every site; where a yard or pavilion cannot fit, skip that
   part, never the check. Check: `node tools/check_hd6.mjs`, then stills of three sites that are not presets.
2. **The next kinds.** After parks, fire stations, hospitals and schools, the busiest kinds without a cue (count them from
   the catalog the way `check_exteriors` does): give each a generic cue (for example a utility yard's fenced compound or a
   library's entrance colonnade), procedural, no words, no logos, no protected emblems.
3. **The H sign at night.** The hospital's H sign is vertex-coloured Lambert: at night it reads only by the street lamps.
   A small emissive panel (a second material on the same mesh group, or an instanced quad in ATMOS's lamp mesh) would
   let it read at night without a real light. State the cost (meshes, triangles, 0 lights, 0 texture bytes).
4. **A frame time on real hardware** for Ultra with the hero facades (ENV-HD-4's item 4 still stands).
5. **Quiet re-measure** of `check_hd6.mjs`'s estimated row in `docs/perf/checkers-baseline.json`.

## Rules that bind this work
- The phone tier and a headset browser build nothing from `hd6-kinds.js` (`check_hd6` §1b); `np-world.js`' site buildings
  are untouched. Balanced takes the lighter build. Ultra stays opt-in, desktop high only (`hd4UltraAllowed`).
- Procedural only; generic by kind; no words on walls; nothing names a company, union or trade body; no red cross or
  any other protected emblem (the hospital sign is a white H on blue); no flagpole at the school.
- Single checkers only; never run `tools/check_all.mjs`; never commit `docs/perf/checkers-last.json` or measured timings.
  Rebuild the bundles (`python3 tools/bundle_webxr.py`) before any drive, drives one at a time on your own port, restore
  the committed dist files afterwards (`git checkout -- WebXR/dist/parishes.html WebXR/parishes/dist/parishes.html`).
