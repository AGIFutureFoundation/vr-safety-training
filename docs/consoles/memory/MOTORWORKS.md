# MOTORWORKS — memory

- Base 9914455; commit 2ce3af5 (mv-motorworks.js data, mv-world.js mount, dvStepDrive brake/minRadius, app wiring,
  check_motorworks.mjs). Docs: docs/consoles/MOTORWORKS.md (Cycles, Seams, Left).
- Handling fields `brake` and `minRadius` are optional in dvStepDrive; absent = old behaviour (checked bit for bit).
- Placement footprint test: no water polygon (npWaterAt) AND NEWTON depth 0; Strip Marsh East parks none.
- PALETTE seam: `mvPaletteCategories()` reads a bundled `PA_CATEGORIES` (try/catch for TDZ) or `globalThis`.
- The parishes dist is tracked; rebuilt locally to syntax-check, then reverted (the coordinator rebuilds).
