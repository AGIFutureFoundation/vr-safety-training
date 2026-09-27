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
