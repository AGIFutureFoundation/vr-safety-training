# Next for ENV-HD-7 (`hd7`): brief for the next console

Read `docs/consoles/ENV-HD-7.md` (Seams, Cycles, Left) and `docs/consoles/memory/ENV-HD-7.md`, then
`WebXR/shared/hd6-kinds.js` (`hd6FitCue`, the groups, the fallbacks, the compound), `WebXR/shared/hd3-scenes.js`
(`hd3PropRects`), `tools/check_hd6.mjs` and `$SP/loop10/hd7/probe.mjs`.

## Do
1. **Parked vehicles in the street solver.** The school campus's street shot still has a MOTORWORKS bus across the
   building's foot: `mvPlacements` needs NEWTON's world, so `hd3Scene` cannot see it. Let the app pass its placements
   (`hd3Scene(parish, id, shot, { vehicles })`, optional, default unchanged) and keep the sight line clear of them. Check:
   a `check_hd6` line for the seven street cameras with a placements fixture, then re-shoot the school's street shot.
2. **Smaller variants where a group is skipped.** 33 of 250 sites skip a group (park pavilions and hospital lanes on tight
   lots): add a smaller pavilion and a short lane, tried before skipping. Check: `measure.mjs`'s "full" counts up, every
   §2 line still 0.
3. **The next kinds after utility and substation** (wetland 24, workshop 23, port 22 — port is a robot kind; check
   `fx-exteriors.js` first): a generic cue each, procedural, no words, no logos, no protected emblems.
4. **Frame time on real hardware** for Ultra with the hero facades (ENV-HD-4's item 4 still stands).
5. **Quiet re-measure** of `check_hd6.mjs`'s estimated row (20 s) in `docs/perf/checkers-baseline.json`.

## Rules that bind this work
- The phone tier and a headset browser build nothing from `hd6-kinds.js` (`check_hd6` §1b); np-world.js' site buildings
  are untouched. Balanced takes the lighter build. The cue mesh stays one per map (two draw calls with the lit sign).
- The presets keep ENV-HD-6's parts (`check_hd6`: "ENV-HD-6's placement kept"); a change there needs new stills.
- Procedural only; generic by kind; no words on walls; nothing names a company, union or trade body; no red cross or
  other protected emblem (the hospital sign is a white H on blue); no flagpole at the school.
- Single checkers only; never run `tools/check_all.mjs`; rebuild the bundles before any drive, one drive at a time on
  your own port, restore the committed dist files after (`git checkout WebXR/*/dist docs/perf/phone-maps.json`).
