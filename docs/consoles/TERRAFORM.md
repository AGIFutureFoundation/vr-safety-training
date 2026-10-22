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
- `tfWind(t, seed?) -> { dir: [x, z], speed, gust }`, `tfWindAt(x, z, t, seed?) -> 0..1`, `tfMotion(reduced, t)` —
  in `shared/tf-water.js` (no imports, so any world can take it); read by the grass, bushes, trees and rain here.
- `tfWaterDepthAt(parish, x, z) -> metres` (0 on land), `tfFlowAt(parish, x, z) -> [vx, vz]` — for NEWTON's `nwWorld`.
- `tfLitterAt(parish, chunkKey) -> [{ id, kind, x, y, z }]` — for the play layer's pick-up and NEWTON's dynamic props.
- `tfMountTerraform({ THREE, root, parish, tier, reduced, waters, trees }) -> { update(x, z), animate(t, dt), counts(), litter() }`
  and `tfMountRain({ THREE, root, tier, reduced }) -> { set(on), animate(t, dt, x, y, z), count() }` (`tf-world.js`) —
  mounted in the parishes app (`__parishTest.terraform` exposes the land, the rain, `depthAt`, `flowAt`, `litterAt`).
- `tfAnimateWater(THREE, material, { flow: [x, z], reduced })` (`tf-water.js`) — mounted on Redwood Reach's river with a
  per-vertex `tfFlow` from source to mouth.
- Engine: `NP_TERRAIN_HOOKS = { cut, wet }` in `np-parish.js` (null = the delta field unchanged) and
  `world.treeMaterial` in `np-world.js` (the swaying kinds: live oak, cypress, reed).

## What shipped (check_terraform's lines are the proof)
- 10 maps: 26 river/canal/bayou ribbons with a gentle bank and a wet strip, 38 procedural streams and ditches (points
  source → mouth), 17 culverts; every channel point below its banks, every ribbon and stream flows downstream, culverts
  cut nothing and show no water on the road, levee points untouched by the cut.
- Cover: 418 chunks sampled, every tuft, bush and piece of litter off road, water, pad and levee; worst chunk 304 tufts /
  1,244 triangles of 360 / 6,000; one merged mesh per chunk; the phone tier covers only the player's chunk, half the
  tufts, no bushes, fewer rain streaks; TERRAFORM's own meshes at most 4 (phone) / 12 (desktop).
- Headless build of the engine with TERRAFORM at every site: worst 183 meshes / 89,071 triangles of 260 / 400,000.
- Reduced motion: no sway, no ripple scroll, no rain (tfMotion, the mounts and the checker agree).
