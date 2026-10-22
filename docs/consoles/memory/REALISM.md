# REALISM memory (loop 10, round 8b, prefix `rz`, port 9167)

- The texture-set registry for buildings is PALETTE's `paMaterialFor` (`pa-palette.js`), the engine's
  `NP_MASSING_HOOKS.material`. One material per (region, kind, tier, category); REALISM rides it, so it adds no meshes.
- `pa-palette.js` imports `rz-surfaces.js`: any flat `buildSuite` that carries `pa-palette.js` must carry `rz-surfaces.js`
  before it (`check_palette` and `check_rz` do), and the bundle list puts it before `pa-palette.js`.
- The height above a building's base in the shader is the instance translation's y (the engine places mass at
  `s.y - 0.15`), so grime and contact shading need no ground lookup.
- `rzLevel(tier, ua)` is the one gate: null on the phone tier and in a headset browser (same regex as hd6/hd4).
- The phone's fixed lights in `app.js` (sun 1.1 / 0.6 / 0.12, sky 0.95 / 0.25) stay; the table overrides them behind
  `rzLevel` only. `check_rz` asserts both lines are still there.
- Drives are slow under shared load: the before drive took about 12 minutes for 12 stills on one tier. Run one map per
  drive and keep the measure lines on separate tiers with `noshots`.
- The before stills were taken from a build of the base sources (the three edited files checked out from a10f1ff8,
  rebundled), then the sources were restored to HEAD and rebundled for the after stills.
- A usage stop interrupted the round at about 20:36; the before drive's measure file was lost with it (the stills survived).
