# SUMMIT memory — read this first

Short, durable lessons for the next team at this console.

- **The world is data first.** `WebXR/shared/summit-data.js` is pure (no three.js, no DOM). `smHeightAt(x, z)` is the one height field: the builder, the walker, the map, the checker and the Unity export all sample it. Change terrain there, then re-run `node tools/check_summit.mjs` — it checks that pads stay flat, sites stay in their zones and out of the reservoir.
- **Roads are held to a profile, not carved.** `SM_ROAD_PROFILE` sets the pass road's height along its length; the terrain blends to it inside 160 m. Carving a valley under a noisy field gave 30–60 % grades. The tunnel span (`SM_TUNNEL_SPAN`) is left natural so the ridge stays over it.
- **Streaming:** 256 m chunks, Chebyshev radius per tier (`SM_STREAM_RADIUS`), LOD by ring, conifers only in inner rings, and one coarse backdrop of the whole field dropped 14 m so far peaks stay on the horizon for one draw call. `world.update(x, z, budget)` builds at most `budget` chunks per frame.
- **Trees dominate the triangle count.** A four-part conifer cost ~60 triangles and pushed a view to 350k; three parts (4/6/5 sides) and 200 per chunk brought it to ~190k. Tune there first.
- **rAF timestamps can be earlier than `performance.now()` at start.** Clamp dt to ≥ 0 or anything indexed by time goes negative (the gondola cabins did, and the whole loop died).
- **Bundler scope.** Every top-level name needs the `sm` prefix; `pad`, `keys`, `drag` and `renderer` all collided or risked it. The bundler reports clashes — run `python3 tools/bundle_webxr.py summit` after every edit to app.js.
- **Egg lessons are verbatim.** Each field note quotes the first sentence of a real station step's `why`; `cites` names station and step, and the checker opens the sim file to confirm. Never paraphrase.
- **Gates.** `summit/js/state.js` answers the frontier gate contract from the passport (`smGateMissing`). When QUESTMASTER's `shared/skill-gates.js` lands, replace the body, keep the call sites. `SM_GATED` is exported for `check_gates.mjs`.
- **Mobile check.** check_mobile wants HUD text ≥ 14 px and no overlapping fixed panels at 360×640 and 640×360; the narrow layout moves the place panel under the Home chip.
- **Stills.** The live-test handle `window.__summitTest.teleport(x, z, yaw, pitch, lift)` takes a camera lift for vista shots; yaw 0 faces north (-z).
