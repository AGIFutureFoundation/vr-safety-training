# Next for ENV-HD-9 (`hd9`): brief for the next console

Read `docs/consoles/ENV-HD-9.md` (Seams, Cycles, Left) and `docs/consoles/memory/ENV-HD-9.md`, then
`WebXR/shared/ix-interiors.js` (`IX_OPENINGS`, the wall loop in `ixBuild`), `WebXR/shared/hd3-scenes.js` (the
`subject` pass), `WebXR/shared/hd6-kinds.js` (`footprint`), `tools/check_hd9.mjs`, `tools/check_hd6.mjs` and
`$SP/loop10/hd9/probe.mjs`.

## Do
1. **Kerbside variants** (hd8-next 2, not started): for the 24 sites with the street at the door (hospital canopy and
   lane 8, park path 8, pavilion 4, bays 3, yard 1): a canopy over the footway needs CITYWORKS' sidewalk (`cwSidewalkAt`);
   never on the carriageway. Check: the skip count 24 → N, every `check_hd6` §2 line 0, full variants byte-identical.
2. **The window after ROBOTS-HD-4:** once the yard picture moves out and the carrier stands beyond the wall, re-run
   `check_hd9` §3 (no void through the hole) in their build and take a still from the room's camera preset and from the
   sill. If the view shows the map's sky where the picture used to be, add a yard backdrop plane (a dresser, not the
   shell) sized to fill the opening's frustum from the preset.
3. **Openings for other rooms** only if a console asks: `IX_OPENINGS` takes any style; walls 0 and 1 (x-running) only.
   The e/w walls would need the same split along z.
4. **Port cue** for the 22 catalog port sites (hd8-next 3) and the next kinds (hd8-next 4).
5. **Quiet re-measure** of `check_hd6` and `check_hd9` in `docs/perf/checkers-baseline.json`.

## Rules that bind this work
- Phone and headset build nothing from `hd6-kinds.js`; one cue mesh per map; the port room (and every room) inside
  `IX_BUDGET` on every tier with every dresser (`check_hd9` §3 is the combined case).
- The north wall's sill keeps the name `ix-wall-0` (the skins retexture the shared material through it).
- With no `subject` or no vehicles passed, every street camera is ENV-HD-8's; a camera whose cue is already unhidden
  never moves.
- Procedural only; generic by kind; no words; no company, union or trade-body names; no protected emblem.
- Single checkers only; rebuild bundles before a drive, one drive at a time on your own port, restore the dist files after.
