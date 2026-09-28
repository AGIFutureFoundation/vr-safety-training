# SUMMIT-3 brief — Sierra Summit, from lived-in to driven

Read `docs/consoles/memory/SUMMIT.md`, then `docs/consoles/memory/SUMMIT-2.md`, then `docs/consoles/SUMMIT-2.md`.
Prefix every top-level name `sm`; keep files under `WebXR/summit/` and `WebXR/shared/summit*.js`. The bundler erases
import aliases: import shared names as they are exported (`pickup`, not `pickup as flPickup`).

## Where it stands (measured, SUMMIT-2)
- Streaming: LOD rings [32, 24, 12, 8] segments; conifers at ring 0–1 as the three-part mesh, ring 2 at 0.28 of ring 0
  as two-quad impostors. Pure worst-case estimate `smTriangleEstimate`: high 97,200, low 62,424 (budget 420,000).
  Measured with SwiftShader at 1280×720: high tier 68k–113k triangles, 141–187 meshes, 876–2099 trees per view (was
  145k–191k / 2000–2900); low tier 54k–77k triangles, 143–147 meshes. Still no real-phone frame time: measure it first.
- Terrain: snowline `SM_SNOWLINE ± 80 m` by aspect; banded cliffs above slope 1.0; scree by height and in fans down
  steep gullies; the tailrace river (`SM_RIVER`, 13 vertices) on a running-minimum bed profile sampled every 16 m,
  one culvert under the pass road. Switchbacks on the pass road are still not built (see below).
- Gates: `state.js` answers through `shared/skill-gates.js` (`qmMissing` over `smSnapshot`); `check_gates` discovers
  Summit's 11 gated items (8 side quests, 3 field notes) and passes 747/0.
- Field lessons: 20 on `K2_FIELD_LESSON_SCHEMA` (10 re-homed, 10 new at the tunnel portal, gondola shop and top, and
  the ridge line), each with a `tradeStation`; `K2_WORLD_PAGES.summit` set; the map's lessons layer draws through
  `k2DrawFieldLayer`.
- Wildlife: `WILDLIFE_BUDGET` gained `raptors` (3, 9 meshes) and `deer` (4, 28 meshes); total 99. The app builds gulls,
  raptors over the ridge line and deer at the ranger station's meadow edge.
- Vehicle: the fleet pickup drives the pass road end to end at a walking-pace multiple (11 m/s), hidden by the ridge
  through the tunnel span. Bundling fleet.js (with kit.js and textures.js) took the Summit bundle from 793 KB to
  1124 KB; check_mobile still passes (158).
- `tools/check_summit.mjs`: 6092 checks. check_sky 99/99 wildlife meshes, check_k12 green, check_mobile 158.

## Next phase
1. **Real hardware.** Record fps on a mid phone at low/balanced; if under 30, the next levers are impostors from ring 1
   (`SM_IMPOSTOR_RING = 1`) and 24-segment LOD 0. The fixed features add ~15k triangles the estimate leaves out; fold
   them in if the budget is ever tight.
2. **Bundle weight.** fleet.js is 330 KB of the Summit bundle for one pickup. Either a lighter `smPickup` built from
   kit.js boxes (keep the fleet livery colours) or a bundler entry that tree-shakes the fleet builders.
3. **A drive step.** The pass-road quests should let the learner ride the crew pickup: a `ride` step type (board at the
   crew yard, the truck follows `smRoadAt`, the learner's camera rides in the cab, the HUD shows grade and the sign's
   engine-brake advice from `drive-mountain-grade-and-engine-brake`), scored on safe practice only.
4. **Switchbacks.** Build them as a second polyline that replaces the steep middle of `SM_PASS_ROAD` between two of its
   existing vertices, and recompute `SM_ROAD_PROFILE` and `SM_TUNNEL_SPAN` fractions from the new length (a script that
   prints them, then a checker assertion that the road's steepest grade stays under the profile's own maximum).
5. **Deer on slopes.** The deer group is placed on the flat ranger pad because the builder sets one `zone.y`; give
   `buildWildlife` an optional `groundAt(x, z)` so groups can stand on a slope, then move a second group to the meadow
   below the west lookout.
6. **Atlas.** Still Bay World only; a Summit section reading `SM_SITES` with its own non-geographic map if the
   coordinator wants a multi-world Atlas.
7. **River visibility.** The ribbon (`summit-river`, 1002 vertices, surface 0.9 m above the bed, banks ~3 m higher)
   is built and sits where it should, but a still from the valley floor at 16 m lift did not show it: the channel is
   28 m wide and 2.6 m deep under 8 m terrain vertices, so it reads as a shallow fold. Widen `SM_RIVER_CHANNEL`
   (width 22, depth 4), brighten the water colour, and add a `check_summit` assertion that the surface sits above
   the bed at every profile sample; then re-shoot `docs/img/summit/09-powerhouse-valley.png` from the river bank.
8. **Lessons.** Ten more at the dam, the water plant and the pass yard if SCHOLAR-3 wants Summit to carry thirty; keep
   the no-digit rule (the validator rejects any digit in the text).
