# Next for ENV-HD-8 (`hd8`): brief for the next console

Read `docs/consoles/ENV-HD-8.md` (Seams, Cycles, Left) and `docs/consoles/memory/ENV-HD-8.md`, then
`WebXR/shared/hd3-scenes.js` (`hd3Scene` `{ vehicles }`, `hd3Occluders`), `WebXR/shared/hd6-kinds.js` (variants,
`HD6_SMALL`, `HD6_BACK`, `HD6_FALLBACK`, `HD6_WET`, wetland and workshop), `tools/check_hd6.mjs` and `$SP/loop10/hd8/*.mjs`.

## Do
1. **The play yard behind the bus.** The school campus's bus no longer hides the building or canopy but stands in front of
   the play yard. Let the subject include the site's cue footprints (pass them in: `hd3Scene(..., { vehicles, subject })`,
   since hd3 cannot import hd6), and add candidates farther along the street. Check: a `check_hd6` line (yard unhidden at
   the school, the other six cameras unchanged), then re-shoot `sf-mission-school-street-day.jpg`.
2. **Kerbside variants** for the 24 sites with the street at the door (hospital canopy and lane 8, park path 8, pavilion 4,
   bays 3): a canopy over the footway needs CITYWORKS' sidewalk (`cwSidewalkAt`); never on the carriageway. Check: the skip
   count down, every §2 line 0.
3. **Port** (22 catalog sites): agree with ROBOTS-HD whether they take a generic cue (bollards, a container-stack edge, a
   mooring line of cleats); if yes, procedural, no words, no logos; else write the reason in the module.
4. **The next kinds after port:** hospitality 21, warehouse 20, levee 19, rail 19, campus 19 (warehouse is near ROBO-
   EXTERIORS' distribution warehouse kit: check `fx-exteriors.js` first).
5. **Stills** of a wetland and a workshop site, day and night, in the built page.
6. **Quiet re-measure** of `check_hd6`'s row in `docs/perf/checkers-baseline.json`.

## Rules that bind this work
- The phone tier and a headset browser build nothing from `hd6-kinds.js`; np-world.js' site buildings are untouched; one
  cue mesh per map (two draw calls with the lit sign).
- Full variants stay byte-identical (compare with the previous module, as `equiv.mjs` does); the presets keep ENV-HD-6's
  parts; with no vehicles passed the street cameras stay as they are.
- Procedural only; generic by kind; no words; no company, union or trade-body names; no protected emblem.
- Single checkers only; rebuild bundles before a drive, one drive at a time on your own port, restore the dist files after.
