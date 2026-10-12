# Console REALISM

- Console: REALISM (loop 10, round 8b, prefix `rz`, port 9167)
- Brief: `$SP/loop10/brief-r8b.md` (section REALISM), under the Rules of `brief-r8.md`, `brief.md`, `brief-r6.md` and
  `brief-r7.md`. Next brief: `tools/briefs/next/rz-next.md`. Memory: `docs/consoles/memory/REALISM.md`.
- Base: a10f1ff8 (fast-forward, confirmed `a10f1ff8646dc1eda3bf18f6e07c231bd2c0e49a`)
- Owns: new `rz-*.js` and the texture-set modules `check_textures` and `check_palette` test (`textures.js`,
  `pa-palette.js`, `pa-palette-data.js`).

## What is here
- **Surface classes** (`WebXR/shared/rz-surfaces.js`). Eight classes: brick, concrete, asphalt, metal cladding, wood,
  stucco, clay tile and glass. Each has a roughness (0.12 to 0.96, a different value per class), a metalness (0 for
  masonry, 0.55 for metal cladding, 0.25 for glass), a detail strength and a grime take-up. Every PALETTE pixel painter
  maps to its own class. There is one procedural detail map (value noise, tileable, deterministic by seed): R is fine
  grain, G grime blotches, B vertical streaks. `rzShade` and `RZ_SHADE_GLSL` are the same grime and contact term, kept
  side by side so they cannot drift apart.
- **Applied through the texture-set registry** (`pa-palette.js`'s `paMaterialFor`, the engine's massing material hook),
  so every building kind PALETTE paints picks it up on every map:
  - **high:** a `MeshStandardMaterial` per category, with the wall class's roughness and metalness and the roof class's
    own (in the shader). On top of PALETTE's atlas it adds the 256 px detail map (grain at 1.1 m, grime blotches at 9 m),
    grime and contact shading in the first 0.9 m to 2.4 m above the building's base, and streaks under the sills on upper
    floors (none on roofs). Roughness is broken up by the grain.
  - **balanced:** the light version. Grime and contact shading only, on PALETTE's Lambert material, with no texture.
  - **phone and headset:** untouched. These keep the Lambert tint material and the `pa-tint-1` program (a headset at
    high keeps PALETTE's plain atlas path).
- **The exposure table** (`WebXR/shared/rz-light.js`). It sets sun intensity and colour temperature (dawn 3,400 K,
  day 5,600 K, dusk 2,900 K, night 8,000 K "moon"), sky fill and elevation by time of day, and a fog cap by weather
  (clear 1, overcast 0.8, rain 0.65, storm 0.55, fog 0.45 of the sky recipe's visibility). The cap never thins ATMOS's
  fog and never goes below the 180 m board-read floor. The exposure index is sun × luminance × sin(elevation) +
  0.6 × sky, with stated ranges: day 1.0–1.6, dawn 0.4–0.95, dusk 0.35–0.9, night 0.12–0.35. They hold at full light and
  at a weather dim of 0.8. The parishes app applies the table behind `rzLevel(npTierName)`, so the phone and headset keep
  their fixed lights.
- **Not done:** street details (item 2), and carrying the classes to rooms and props (`txSharedMat`). Both are in the
  next brief.

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| facade materials with roughness and detail (3 maps, high) | 0 | **13 of 13** (Standard, per-class roughness/metalness, detail map); balanced 0 → 13 of 13 with grime/contact; phone 0 → 0 | `node tools/check_rz.mjs` (§5 notes) |
| surface classes with roughness, metalness and detail | 0 | **8** (brick, concrete, asphalt, metal, wood, stucco, tile, glass) | `check_rz` §1 |
| meshes and triangles per map, REALISM on vs off (3 maps × 3 tiers) | — | **unchanged** on all 9 | `check_rz` §5 |
| REALISM texture bytes (high / balanced / phone) | 0 / 0 / 0 | **262,144** (one 256 px RGBA detail map, budget 256 KiB) / **0** / **0** | `check_rz` §2, §5; built page `rzDetailBytes` |
| built page, orleans port-terminal wide day, high | 144 calls, 153,327 tris, 6 textures | **144 calls, 153,327 tris, 7 textures** (+ the detail map) | `$SP/loop10/rz/drive-after.txt`; before from the interrupted before drive's first lines |
| facade shader programs per tier | 1 | **1** (`pa-rz-high-1`, `pa-rz-bal-1`, `pa-tint-1` phone unchanged) | `check_rz` §5 |
| exposure table, bands in range (full light and dim 0.8) | none | **8 of 8**; ordered day 1.509 > dawn 0.512, dusk 0.461 > night 0.263 | `check_rz` §6 |
| phone tier | — | **unchanged** (no REALISM material, no texture, the same fixed lights) | `check_rz` §4–§5, §7 |
| page errors in the built page | — | see the hand-back (`drive-after.txt`, last line) | `$SP/loop10/rz/drive_rz.mjs` |
| `check_textures` / `check_palette` / `check_facades` / `check_interiors` | pass | **pass** (palette 684, facades 2,977, interiors 957) | the checkers |
| `check_rz` | — | **127 pass** | `node tools/check_rz.mjs` |

## Stills
`$SP/loop10/rz/`: `before-<map>-<wide|street>-<day|night>.jpg` for orleans, sf-mission and sf-marina (12, high tier, built
from the base sources), and `after-orleans-*` (the after drive was cut to one map after the usage stop). At the presets'
distances the change is subtle. The PALETTE-hooked houses and blocks are small in frame, and the large brick halls at
the port are ROBO-EXTERIORS' facades, not PALETTE's.

## Log
- 20:20 · fast-forwarded to a10f1ff8, confirmed; read the briefs, ATELIER, ATELIER-2, PALETTE, ENV-HD-7, `pa-palette.js`,
  the checkers · next: surfaces.
- 20:25 · reason: the registry every building kind uses is PALETTE's material hook; act: `rz-surfaces.js` and the
  pa-palette patch; observe: `check_palette` 684 pass with the suite carrying `rz-surfaces.js`.
- 20:27 · reason: a headset browser may run at high; act: `rzLevel(tier, ua)` gates every change; observe: `check_rz`'s
  headset and phone lines.
- 20:28 · act: `rz-light.js` and the app hook; observe: dusk at dim 0.8 gave 0.345, below its 0.35 floor, so the dusk sky
  fill went from 0.6 to 0.65 (the range was not widened); `check_rz` 127 pass; commit ede4d61a.
- 20:31–20:52 · before stills from a build of the base sources (12 stills); the drive was then cut off by the usage stop.
- 21:27 · resumed: restored the HEAD sources, rebundled, ran the after drive (orleans, three tiers), re-ran the checkers.
