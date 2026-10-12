# TERRAFORM — next

What the Packs run left (console TERRAFORM, docs/consoles/TERRAFORM.md):

1. **Flags** — no parish flag pole exists yet (np-world.js's site comment names one, nothing builds it); when CITYWORKS or
   a site kit adds one, drive its cloth from `tfWind` / `tfWindAt` (tf-water.js).
2. **Redwood grass** — Redwood Reach takes the river ripple only; its ferns and fronds could read `tfWind` through a
   sway material like `tfSwayTrees` (rw-world.js builds them as InstancedMesh per chunk).
3. **NEWTON seam** — `nwWorld({ waterDepthAt: (x, z) => tfWaterDepthAt(parish, x, z), flowAt: (x, z) => tfFlowAt(parish, x, z) })`
   once nw-physics.js lands; `__parishTest.terraform` already exposes both.
4. **Play-layer litter** — `tfLitterAt(parish, chunkKey)` gives ids and kinds; the pick-up (E near a can, a tally in the
   passport, a "leave it cleaner" field lesson sourced like the catalog's stations) is the play layer's to build.
5. **Wetland streams** — a stream never starts inside a wetland water polygon (the channel cut skips water); marsh
   creeks would need their own profile inside the wetland.
6. **npHeightAt cost** — the channel cut adds about 40 % to a height sample (ribbon distance per river); a per-parish
   coarse grid of the cut would bring it back if a phone profile shows chunk builds stalling.
7. **Lake flow** — lakes, bays and the gulf drift with the wind in the shader only; `tfFlowAt` returns zero there.
