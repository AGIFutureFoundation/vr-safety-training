# Console PALETTE

- Console: PALETTE
- Team: PALETTE (the texture and pattern library and its use in the open worlds)
- Brief: `tools/briefs/mobile-look-brief.md` (section PALETTE), under `tools/briefs/console-brief.md`
- Branch of record: `claude/vr-ar-safety-training-wkwmve`

## Log
- 21:14 UTC · fetched and fast-forwarded the branch of record; read both briefs, textures.js, perf.js, check_textures.mjs and the builders · — · next: the coordinator's harbour-water defect first
- 21:30 UTC · DEFECT (regatta on turf): bayHeight() is clamped to >= 0 m while every water slab sits at y -0.4, so Bay World's terrain buried all four slabs — the Regatta raced on grass, and Bay World's own estuary and outer bay were never visible either; the lake had no water at all · — · next: carve
- 21:30 UTC · also found: bwTerrain() sampled bayHeight at cz + localY, but the -90 degree X turn sends local +Y to world -Z, so the whole relief was mirrored across z = 0 (the hills stood on Fruitvale and the Coliseum); fixed to cz - localY · — · next: water model
- 21:34 UTC · fix: TX_BAY_WATER in bayworld-data.js (the four slabs + a lake at its own level), txGroundHeight() carves a seabed 2.6 m under each body out to one terrain cell past its rectangle, water meshes laid over the rectangle grown by two cells so the bank is always wet; the preview vignette's water lies just over its highest ground; check_regatta asserts water tops sit above the ground cell's highest vertex at every start line, mark, leg, dock, berth and water-body centre, and that RG_WATER mirrors TX_BAY_WATER · see git log · next: the pattern library
- 21:34 UTC · open for the Bay World team: slab 0 overlaps the port container terminal, rail yard, hazmat yard and the island ferry-landing clock; they now stand over water like quays · — · next: none from PALETTE
- 21:36 UTC · pattern set in textures.js: 20 seeded painters (tx…Face, ids as the brief names them, manifest slots added), 7 world palettes + Okabe–Ito accent set with txContrast()/txPaletteContrast(), txTexture() cache keyed painter + res + palette (a new tiling is a clone sharing the canvas), TX_TIER_RES low 256 / mid 512 / high 1024, textureStats() · see git log · next: Bay World
- 21:36 UTC · Bay World: harbourWater on every water body, turfStripe ground, laneAsphalt roads with a crosswalk plane per long segment (budget headroom), per-zone facades (glass downtown, stucco + tile roofs in Fruitvale, brick/corrugated + corrugated roofs on the industrial flank, painted wood at the marinas), one canvas per style tinted per building · — · next: budget
- 21:36 UTC · FAILED then fixed: the first low-tier Bay World measure was 31 MP (roads and facades painted a canvas per repeat/tone; 24 crowd face cards at 512 px); fixed by sharing canvases across tilings, tinting through the material, a facePx option on standingFigure/personHead and six looks per crowd on a phone → 8.84 MP measured (limit 12) · — · next: yacht, Deep, Fairway
- 21:36 UTC · FAILED then fixed: check_unity_export stale after the terrain change; re-ran tools/export_unity.mjs · — · next: commit
- 21:39 UTC · yacht: teak deck, hull stripes from the livery (sheer in the accent, boot-top from `livery.bootTop`), diamond non-skid on the foredeck; tender gets a striped hull and a non-skid sole; the regatta fleet passes hull, trim and burgee through; fleet canvases are noted in textureStats() · see git log · next: Deep, Fairway
- 21:39 UTC · FAILED then fixed: check_fleet saw motorYacht merge to 36 meshes (declared 35) once the foredeck got its own non-skid material; the hardtop now shares that material, back to 35 · — · next: Deep
- 21:39 UTC · the Deep: caustic seabed in the shallow and mid bands (dimmer, cooler in mid), silt in the deep; kelp blades and reef rock (boulders, ledges, pinnacles) wear shared, non-own materials (txSharedMat) so they still merge; Fairway Park: turf stripes on fairways, greens and the facility pitch, one canvas tiled per segment · — · next: gate
- 21:40 UTC · HAND-BACK · python3 tools/bundle_webxr.py clean; node tools/check_all.mjs → "All 57 checkers pass."; check_fleet, check_bayworld, check_underwater, check_regatta, check_fairway, check_textures pass; measured low-tier canvas in a high Bay World build 8.84 MP (library-painted 5.77 MP), limit 12 MP; no eval scores for this brief · next: coordinator merge; the port-in-slab-0 overlap stays open for the Bay World team

---

# The environment & robotics wave: PALETTE — new patterns, textures and colour categories (`pa`, 8992)

Environment & robotics wave. The parish engine's massing material hook (`NP_MASSING_HOOKS.material`) is PALETTE's; FACADES
owns `details` in parallel and is untouched here.

## What shipped

- `WebXR/shared/pa-palette-data.js` — plain, dependency-free data TQ-BRIDGE can export as is: `PA_CATEGORIES` (16 procedural
  paint schemes by building style: Creole cottage pastels, Garden District whites, shotgun-house brights, riverfront brick,
  port steel, painted-Victorian palette, Mission stucco, Sunset pastels, downtown stone and glass, Oakland brick, warehouse
  greys, Craftsman shingle, marsh weathered, campus sandstone, refinery whites, valley ranch stucco), each with 4–7 wall
  colours, a wall and a roof texture, and a sign pair (ground, ink) whose ink is a design token at 4.5:1 or better for
  FACADES; `PA_KIND_CHARACTER`, `PA_REGION_CHARACTERS` (6 regions × 7 characters), `PA_PARISH_CHARACTERS` (district
  overrides: the Mission's stucco, the Sunset's pastels, West Oakland's and Bayview's port steel, the marsh parishes),
  `PA_TEXTURES`, `PA_ATLAS_TIERS`, `paCategoryFor`, `paInstanceColour`. Every category says it is procedural; no figures.
- `WebXR/shared/textures.js` — eight **pixel painters** (`TX_PX_PAINTERS`: clapboard, shingle, stucco, Spanish tile, brick,
  corrugated, concrete panel, window grid) that write grayscale detail into a byte buffer (seeded, exact, tileable by
  construction, no canvas), `txPxAtlas` (packs them into one atlas with wrapped gutters), and canvas wrappers
  `txClapboardFace`, `txShingleFace`, `txStuccoFace`, `txSpanishTileFace` for other worlds. The existing painters and
  `TX_PAINTERS` are unchanged.
- `WebXR/shared/pa-palette.js` — the hook: one cached Lambert material per (region, kind, tier); walls take the building's
  category colour via `instanceColor` (the light vertex colours are replaced, the dark roof/slab colours kept), and above the
  phone tier a world-space box projection samples the region's one atlas (walls one cell, up-facing faces the roof cell) with
  `textureGrad` so the tile wrap shows no mip seam. All textured materials share one program (`customProgramCacheKey`).
  Phone (`low`): no atlas, per-instance vertex colour only.
- `WebXR/shared/np-world.js` — the one guarded engine change: when the hook's material carries
  `userData.npInstanceColour(spot)`, each instance gets `setColorAt`. The engine's own materials carry none, so without
  PALETTE nothing changes (`check_palette` builds six maps with the hook off and finds no instance colour). The hook
  definition is untouched.

## Seams

- `paMount({ tier, hooks? }) -> { tier, stats() }` (shared/pa-palette.js) — sets `NP_MASSING_HOOKS.material`; mounted in the
  parishes app before `npBuildParish` (`window.__parishTest.palette`).
- `PA_CATEGORIES`, `PA_REGION_CHARACTERS`, `PA_PARISH_CHARACTERS`, `paCategoryFor(kind, parish)`,
  `paInstanceColour(category, spot)` (shared/pa-palette-data.js) — TQ-BRIDGE's export source; MOTORWORKS may take liveries
  from `PA_CATEGORIES[id].walls`; FACADES may letter signs with `PA_CATEGORIES[id].sign` (guarded).
- `TX_PX_PAINTERS`, `txPxTile`, `txPxAtlas` (shared/textures.js) — any world.

## Measured (before → after)

Headless builds on the vendored three.js (`check_palette`): meshes, triangles and instances identical with and without the
hook on six maps at both tiers (Orleans high 164 → 164 meshes). Worst chunk: 5 materials (4 textured) in Orleans at high.

Browser (SwiftShader, load average ≈ 30 on four cores — frame times are RELATIVE and noisy):

| map · tier | avg ms before → after | materials in scene | programs | textures | draw calls |
|---|---|---|---|---|---|
| orleans · high | 883 → 653 | 108 → 113 | 17 → 18 | 0 → 1 | 168 → 168 |
| orleans · low | 346 → 217 | 107 → 111 | 17 → 18 | 0 → 0 | 126 → 126 |
| sf-mission · high | 657 → 637 | 70 → 73 | 15 → 16 | 0 → 1 | 113 → 113 |
| sf-mission · low | 361 → 254 | 69 → 72 | 15 → 16 | 0 → 0 | 89 → 89 |

No shader or page errors. Atlas: 512×256 (high), 256×128 (balanced), none (low).

## Cycles

1. Reason: the painters must tile and be exact → `check_palette` painter lines. Act: 8 pixel painters + atlas packer in
   textures.js. Observe: 3 of 16 painter×size seam lines failed (shingle, Spanish tile: the course boundary on the wrap is a
   random tone step, 2–4 % over the roughest inner seam).
2. Reason: the test should reject real seams, not tone noise → a non-tiling ramp must fail. Act: tolerance 1.1× the roughest
   inner seam, plus a ramp negative control. Observe: all painter lines pass; the ramp is rejected.
3. Reason: every character in every region maps to a category, signs legible → category lines. Act: pa-palette-data.js
   (16 categories, 6×7 table, 9 overrides). Observe: 42 region×character lines, 77 map×kind pairs, worst sign 5.72:1.
4. Reason: per-building colour without new meshes, engine unchanged when unset → build lines. Act: the guarded
   `setColorAt` in np-world.js and pa-palette.js's materials. Observe: 6 maps × 2 tiers, same meshes/triangles/instances, no
   instance colour without the hook, colours deterministic; `check_palette: 468 passed, 0 failed`.
5. Reason: the shader must compile in a real browser → no shader errors, a texture uploaded. Act: mount in the parishes app,
   bundle. Observe: Orleans and the Mission at high and low load with no errors, 1 atlas texture at high, 0 at low, draw calls
   unchanged, +1 program.
6. Reason: nothing else regresses → `check_parishes`, `check_textures`, `eval_worlds`. Observe: check_parishes 30924 passed,
   0 failed; check_textures passes; eval_worlds 27 subjects mean 98, 18 findings before (the after run is in the hand-back).

## Left

- FACADES' sign colours read `PA_CATEGORIES[id].sign` only once FACADES codes against it (the pairs are ready and checked).
- MOTORWORKS liveries from the categories, TQ-BRIDGE's export of `pa-palette-data.js` — theirs, the data is ready.
- The flat combined `WebXR/dist/parishes.html` is rebuilt only on a full bundle (the coordinator's).
