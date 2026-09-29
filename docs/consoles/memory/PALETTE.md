# PALETTE memory

- Hook: shared/pa-palette.js paMount({ tier }) sets NP_MASSING_HOOKS.material; data in shared/pa-palette-data.js (pure).
- Engine: np-world.js calls material.userData.npInstanceColour(spot) -> setColorAt when present (guarded).
- Painters: textures.js TX_PX_PAINTERS (pixel buffers), txPxAtlas; one atlas per region+tier, none on low.
- Checker: tools/check_palette.mjs (in check_all + checkers-baseline 16 s).
