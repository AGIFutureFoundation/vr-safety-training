# TERRAFORM — water, wind and ground cover (console `tf`, the Packs run)

Brief: `tools/briefs/packs-brief.md` (section TERRAFORM). Prefix `tf`, port 8980. Everything here is procedural:
no stream, ditch, culvert, tuft or piece of litter is a claim about a real place.

## Plan (written before code)
1. **Pure module `WebXR/shared/tf-terraform.js`** (no three.js, no DOM):
   - wind field `tfWind(t, seed)` / `tfWindAt(x, z, t, seed)`: a slowly veering direction, speed and gusts from summed
     sines of the seed — deterministic, no `Math.random`;
   - procedural streams and ditches `tfStreams(parish)`: meandering streams in `wetland` and `park` districts, straight
     drainage ditches in `garden` districts, seeded by the parish id, each flowing towards its mouth (the nearest water or
     the district edge), with culverts (`tfCulverts(parish)`) wherever a road crosses;
   - the channel cut `tfChannelCut(parish, x, z, h)` registered on the engine's terrain hook: a stream or ditch is a
     channel below its banks, a river/canal/bayou ribbon gets a gentle bank down to the water line; nothing cuts under a
     levee (the hook is skipped where a levee rises), nothing cuts at a culvert (the road stays level);
   - `tfWetAt` (the shoreline strip, darkened ground), `tfWaterDepthAt`, `tfFlowAt` (downstream along each ribbon's
     polyline and each stream's points);
   - ground cover per chunk `tfCoverForChunk(parish, cx, cz, tier)`: grass tufts and bushes by district character, never
     on road, water, pad or levee; litter `tfLitterAt(parish, chunkKey)` (cans, bags, paper, a tyre by a ditch), sparse;
   - `TF_BUDGET` per chunk and per tier (the phone tier `low` carries fewer tufts, no bushes), `tfMotion(reduced, t)`
     (still under reduced motion).
2. **Engine hook** in `np-parish.js`: `NP_TERRAIN_HOOKS = { cut, wet }` — a map with no hook set is unchanged, so every
   other consumer of the pure engine keeps its numbers; `np-world.js` darkens wet ground through `wet`.
3. **Three.js half `WebXR/shared/tf-world.js`**: `tfMountTerraform({ THREE, root, parish, tier, reduced, world })`
   streams one merged cover mesh per chunk (tufts, bushes, litter; a per-vertex sway weight read by a wind shader), a
   merged stream ribbon, culvert ends (instanced), and animates every water surface (a cheap ripple that scrolls with the
   flow; still under reduced motion). `tfAnimateWater(THREE, material, opts)` is reusable (Redwood's river).
4. **Mounts**: the parishes app; Redwood Reach's river and creek surface animated by the same shader and wind.
5. **Checker `tools/check_terraform.mjs`** (pure Node): channels lower than banks, every river has downstream flow,
   wind deterministic by seed, cover never on road/water/pad, counts inside budget and the phone tier fewer, culverts keep
   roads level, reduced motion still.

## Seams
- `tfWind(t, seed?) -> { dir: [x, z], speed, gust }`, `tfWindAt(x, z, t, seed?) -> 0..1` — for grass, trees, flags, rain.
- `tfWaterDepthAt(parish, x, z) -> metres` (0 on land), `tfFlowAt(parish, x, z) -> [vx, vz]` — for NEWTON's `nwWorld`.
- `tfLitterAt(parish, chunkKey) -> [{ id, kind, x, y, z }]` — for the play layer's pick-up and NEWTON's dynamic props.
- `tfMountTerraform({ THREE, root, parish, tier, reduced }) -> { update(x, z), animate(t, dt), counts() }` — mounted in the parishes app.
- `tfAnimateWater(THREE, material, { flow: [x, z], reduced })` — mounted on Redwood Reach's river.
