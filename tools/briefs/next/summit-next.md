# SUMMIT-2 brief — take Sierra Summit from walkable to lived-in

Read `docs/consoles/memory/SUMMIT.md` first, then `docs/consoles/SUMMIT.md`, then the SUMMIT section of
`tools/briefs/frontier-brief.md`. Prefix every top-level name `sm`; keep files under `WebXR/summit/` and
`WebXR/shared/summit*.js`.

## Where it stands (measured)
- 4096 × 4096 m, 256 chunks of 256 m; relief 125–1602 m; reservoir, dam, penstock, pass road with a tunnel span,
  transmission ridge (instanced towers, catenary wires), gondola with moving cabins, two lookouts.
- 8 work sites + valley base, 29 catalog stations on boards; 32 field notes (3 gated); 10 field lessons; 9 main-arc
  quests + 8 gated side quests; 2 scored activities; map with 8 layers and fast travel to visited sites.
- `tools/check_summit.mjs`: 4579 checks. check_mobile: 26 checks pass for summit.html.
- Swiftshader at 1280×720 (high tier): 150–186 meshes, 145k–191k triangles, 2000–2900 conifers per view.
  Software GL runs ~2 fps there, so the frame budget on a real phone is unmeasured — measure it first.

## Next phase
1. **Frame budget on real hardware.** Record fps on a mid phone at low/balanced tiers; if under 30, halve
   `SM_TREES_PER_CHUNK` at ring 2, add a billboard tree impostor for ring 2, and drop LOD ring 0 to 32 segments.
   Add a `perf` assertion to `check_summit.mjs` from `world.stats()` (triangles ≤ `SM_BUDGET.triangles`).
2. **Terrain character.** Add real scree fans and cliff bands (slope-aware colour noise), a snowline that varies
   with aspect, a river from the powerhouse to the valley, and switchbacks on the pass road's steep middle.
3. **Wildlife that fits.** `wildlife.js` has only coastal kinds; propose a mountain set (raptors circling, a deer
   group at the meadow edge) through the SKY console's budget table rather than a private copy.
4. **Gates.** Swap `state.js`'s `smGateMissing` for QUESTMASTER's `shared/skill-gates.js` when it lands; run
   `tools/check_gates.mjs` against `SM_GATED`.
5. **Field lessons.** Re-home the 10 lessons onto SCHOLAR-2's exported schema and its K-12 map layer; add 10 more
   at the tunnel, the gondola and the ridge.
6. **Atlas.** The Bay Atlas is Bay World only (the Deep has no entry either); if the coordinator wants a
   multi-world Atlas, add a Summit section reading `SM_SITES` with its own non-geographic map.
7. **Vehicles.** A crew truck on the pass road (the fleet's pickup) makes the 4 km walkable in minutes and gives the
   road crew quests a drive step.
8. **Evals.** No new stations were needed. If a site gains one (a gondola haul-rope inspection has none in the
   catalog), author it with `tools/add_station.mjs` and hold it to `eval_content.mjs` ≥ 95.
