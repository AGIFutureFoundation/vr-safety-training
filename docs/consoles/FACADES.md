# Console FACADES

- Console: FACADES (the environment & robotics wave, prefix `fc`, port 8991)
- Brief: `$SP/robotics/wave-brief.md` (section FACADES), under the Shared rules of `packs-brief.md` and the reactor loop of `packs-brief-3.md`
- Base: 9914455 (the engine's `NP_MASSING_HOOKS`)

## Modules
- `WebXR/shared/fc-facades.js` — sets `NP_MASSING_HOOKS.details = fcDetails` on import (never touches `.material`, PALETTE's).
  Per chunk on the near ring: one InstancedMesh per massing kind present, carrying a merged, vertex-coloured kit of that
  kind's details and drawn with the building's own matrix (unit-height kinds — shed, tower, campus block, tank — draw their
  kit in unit-height space; a tower's roof tank rides in a second, unstretched "roof" InstancedMesh at the roof line), plus
  one merged mesh of storefront signs whose text comes from one canvas atlas (headless: a flat board colour). No per-building
  meshes. Kits are cached per three.js instance and shared across chunks; `group.dispose()` frees only what a chunk owns.
- Detail kinds: window grid, window band, curtain-wall mullions, cornice, parapet, shutters (New Orleans), gallery posts and
  railing (New Orleans quarter), balcony, bay window (Bay Area), stoop, porch, awning, fire escape and roof tank (Bay Area
  quarter and downtown), roll-up doors (sheds), loading dock (port sheds), tank rail and ladder (refinery tanks).
- Phone tier (`low`): ring 0 only, each kit's two cheapest details (by triangle count, proven by the checker), no signs.
- Signs: 35 % of quarter blocks and towers carry a fascia or blade sign, seeded by map and position, naming only a generic
  trade from `FC_SIGN_WORDS` — never a real business or brand. TYCOON's player-opened businesses keep their own sign at their
  listing's site (the parishes app's `tySignsFor` loop; FACADES does not duplicate it).
- Shared data for TQ-BRIDGE (plain JSON): `FC_DETAIL_KINDS`, `FC_KITS`, `FC_SIGN_WORDS`, `FC_SIGN_COLOURS` (board/text hex
  pairs, for PALETTE's contrast check), `FC_BUDGET`.
- Checker `tools/check_facades.mjs` (in `check_all.mjs` and `docs/perf/checkers-baseline.json`).
- Everything is procedural and generic: nothing models a real building.

## Seams
- `fcDetails({ THREE, parish, chunk: { cx, cz, key, ring, lod }, spots, tier }) -> THREE.Group "mass-details-<key>" | null`
  (the engine's `NP_MASSING_HOOKS.details` shape); `group.userData.fc = { kits, signs: [{ word, type, x, z }], triangles, meshes }`.
- `fcKit(THREE, kind, group, tier) -> { ids, body, roof }`, `fcKitDetails(kind, group, tier)`, `fcDetailTriangles(THREE, id, kind)`,
  `fcSignFor(parish, spot) -> { word, index, type } | null`, `fcRegionGroup(parish) -> "new-orleans" | "bay"`.
- Mounted: the parishes app imports `fcDetails` from `shared/fc-facades.js` (registration on import, before the first chunk
  builds); `tools/bundle_webxr.py` lists `fc-facades.js` right after `np-world.js` (the only bundle list carrying np-world.js).
- For TQ-BRIDGE: read the five `FC_*` constants behind a guard.

## Measure (engine build with CITYWORKS' mass filter, worst over start + every site)
| map / tier | before: full build meshes / tris | worst chunk | after |
|---|---|---|---|

## Cycles
1. Reason: build kits per massing kind × region, instanced per chunk, near ring only; proof = worst-chunk meshes/tris in Orleans and sf-downtown stay small and the full build ≤ 260. Observed: full build high orleans 165→179, sf-downtown 157→170 meshes; low 112→114, 97→99; worst detail chunk 4–5 meshes; sf-downtown high triangles 71.5k→150.7k (≤ 400k). Pass.
2. Reason: prove it with tools/check_facades.mjs (phone kit = two cheapest, per-character build, budgets, signs, determinism, wiring). Observed: first run 5 FAIL — five kits were not listed cheapest-first (e.g. shed/port 4/42/12 tris); reordered FC_KITS and cut the roll-up doors' lintel boxes → "FACADES: all 1533 checks pass." Pass.
