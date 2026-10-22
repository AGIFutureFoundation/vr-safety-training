# Next brief for REALISM (`rz`)

Read `docs/consoles/REALISM.md` first, then `WebXR/shared/rz-surfaces.js`, `rz-light.js`, `pa-palette.js` and `tools/check_rz.mjs`.

1. **Street details (round 8b item 2, not started).** Drop kerbs at the zebra crossings, manholes and drains along the
   carriageway, bollards at crossings and tree pits on the sidewalks, built as one merged vertex-coloured mesh per chunk
   in a new `rz-street.js`. Use CITYWORKS' pure answers (`cwLines`, `cwSegmentGrid`, `cwCrosswalkNodes`, `cwSidewalkAt`
   in `cw-cityworks.js`) and stream on `NP_MASSING_HOOKS.chunkLoaded` / `chunkUnloaded` only if DETAIL's
   `dt-detail.js` no longer holds those hooks (it does today: it sets them at mount), otherwise mount beside
   `cwMountStreets` with your own `update(x, z)`. Bake contact AO into the vertex colours where the parts meet the ground.
   State a per-chunk budget (suggested: high 1 mesh / 1,500 triangles, balanced 1 mesh / 600, phone nothing) and check it
   on all 46 maps. Check: no part on a carriageway's running lanes, in water or in a building.
2. **Rooms and props.** The surface classes reach the facades (PALETTE's registry) only. Extend them to the pattern set's
   shared materials (`txSharedMat` in `textures.js`, which defaults roughness 0.9 and metalness 0) on the high tier only,
   by painter id through `rzSurfaceFor`; the phone tier must keep its materials byte for byte. Measure the INTERIORS rooms'
   texture bytes before and after (ACCESS owns the shell modules: call, do not edit).
3. **Stills.** After stills for sf-mission and sf-marina (the befores are in `$SP/loop10/rz/`), and a closer street
   still per map where a PALETTE-hooked building fills the frame: at the preset distances the change is subtle.
4. **Exposure on the headset.** If a headset tier is ever given the table, add a headset row to `RZ_RANGE` with its own
   check; today it keeps its fixed lights.

Checks: `check_rz`, `check_palette`, `check_textures`, `check_facades`, `check_interiors`, and the built page with page
errors 0 on all three tiers.
