# BACKDROPS-2 next — more real relief, and the backdrop on the ground

Binds the next GEO/BACKDROPS session. `docs/geo.md`, `docs/consoles/BACKDROPS-2.md` and
`docs/consoles/memory/BACKDROPS-2.md` apply.

## Measured at hand-back (c2dea4c9 and after)
- `check_geo`: 146 passed, 0 failed · 43/43 backdrops (21/21 Louisiana), 3 maps with none, 2363 KB of 2600 KB.
- Relief on 2 maps (la-shintech-plaquemine, br-downtown-riverfront); check_parishes, check_terraform, check_detail green.

## Build
1. **More relief where the ground rises.** Monroe & West Monroe (its grid shows higher ground along the west edge) and
   Baton Rouge North Industrial; bake the grid, opt in, `--module`, re-measure detail, run the four checkers.
2. **Re-bake Hammond** if SURVEYOR-2's re-lay moved its anchors (`geo_bake.py --only hammond-downtown`).
3. **The satellite ground on the phone tier.** The toggle hands the full picture to `setGroundTexture`; measure the
   texture memory at the phone tier (check_mobile) and, if needed, downscale the picture there.
4. **A fourth month of scenes** for the wide parish boxes, to clear the small cumulus in the Plaquemines picture.
