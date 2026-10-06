# MENAGERIE — animals, pets and passers-by (`mg`, port 8983)

Console MENAGERIE of the Holodeck Packs run ("SmartCiti.X Powered by AGI Corp", brief `tools/briefs/packs-brief.md`,
section *MENAGERIE*). Life on the streets of the ten parish maps and Bay World: pets and animals by region and district
character, and ambient passers-by on the sidewalks. Everything is procedural: the kinds are the generic urban and
coastal ones, the counts are a scene budget, not a census, and nothing says how many of anything live anywhere.

## Plan (written before code)

**Extend, do not duplicate.** `wildlife.js` keeps the scenic groups it already draws (the parishes' egrets, pelicans and
herons over the big water; Bay World's gulls, pelicans, fish, ray, seals and crab): a few individual meshes per group,
one group per zone. `crew.js` keeps the avatar styles; the passers-by take their clothing and skin colours from
`CT_AVATAR_STYLES` through `ctAvatarVariety(i)`, so a passer-by reads as the same population as the crew. MENAGERIE adds
what those two do not have: many small agents at street level, *instanced per kind*, with behaviour.

**One module, pure, `WebXR/shared/mg-life.js`** (three.js is passed in, never imported, so a Node checker runs it):
- `MG_KINDS` — fourteen kinds: `dog`, `walker` (a person with a dog on a lead), `cat`, `pigeon`, `gull`, `pelican`,
  `egret`, `heron`, `squirrel`, `sealion`, `chicken`, `pedestrian`, `jogger`, `cyclist`. Each declares its body (a few
  boxes, merged into one vertex-coloured geometry), its triangles, how it moves (`ground`, `flies`, `swims`), its
  flee radius and speed, and how night changes it (fewer at night, cats more).
- `MG_BUDGET` — one InstancedMesh per kind (≤ 14 draw calls for the whole map), agents per 256 m chunk (high 24,
  balanced 18, low 8), agents per map (high 360, low 120), triangles per map, per-kind caps.
- `mgPlan(map, { tier, night, seed, sidewalkAt, colliders })` — pure placement: a list of agents
  `{ id, kind, x, z, heading, chunk, why }`, deterministic from the map id. Rules by region and district character:
  pedestrians, walkers with dogs, joggers and cyclists along the roads through quarter, downtown, garden, suburb, campus
  and park districts (on `sidewalkAt` when CITYWORKS passes it, else on the road edge: the half width plus a metre and a
  half, dry, off every other road); waiting passers-by at transit-like sites; a crossing at the junction nearest a site;
  cats on the porches of quarter, garden and suburb streets; pigeons at downtown and quarter sites; squirrels in parks
  and campuses; a stray chicken in a garden district; gulls on the shore of open water beside port and harbour sites;
  pelicans (New Orleans) over rivers and lakes; egrets and one heron at a wetland edge; sea lions (San Francisco) on the
  bay at a waterfront site. No agent on open water unless it swims or flies; none inside a CITYWORKS collider.
- `mgStep(agent, ctx, dt)` — pure behaviour: wander / graze / perch around home; walk a sidewalk leg back and forth;
  wait; cross; flee from the avatar and from vehicles (`ctx.threats`) to the kind's flee distance, flocks lift and
  circle, then settle back home; a passer-by the avatar walks into steps aside and nods (GRIOT's named characters stay
  the ones who talk — passers-by never open dialogue).
- `mgMountLife({ three, root, parish | map, groundAt, sidewalkAt, colliders, pos, threats, tier, night, still })`
  — the seam in the brief's shape; builds the InstancedMeshes, returns `{ animate(t, dt), counts(), stats(), agents }`.
  Under `prefers-reduced-motion` (or `still: true`) the world is placed and holds still: `animate` moves nothing.
- `mgParishMap(parish)` and `mgBayMap(data)` — the two adapters (np-parish's pure answers; Bay World's roads, sites,
  zones and water rectangles).

**Mounts:** the parishes app (after the wildlife, `pos` = the walker, time of day from T), Bay World (after the
pedestrians, `pos` = the player on foot, traffic cars as threats). Both expose the handle on their test hooks.

**Checker `tools/check_menagerie.mjs`** (pure Node plus one build on the vendored three.js, no browser): counts by kind
per map inside budget (all ten parish maps and Bay World, high and low); agents per chunk inside the cap; no animal on
open water unless it swims or flies; no agent on a road except cyclists and crossers; flee distance honoured (an agent
started beside the avatar ends at least its flee radius away, then settles home once the avatar leaves); determinism
(two plans and two stepped runs match); reduced motion places the world and moves none; the built InstancedMeshes
match the declared triangles; the fallback without `sidewalkAt` and a stub `sidewalkAt`/`colliders` both honoured;
facts (no digits in kind names or the `why` lines); wiring (both apps mount it, the bundler carries it).

## What shipped (check_menagerie's lines, high tier, day)

| map | agents | people | animal kinds | worst chunk | triangles | draw calls |
|---|---:|---:|---:|---:|---:|---:|
| orleans | 359 | 198 | 9 | 19 | 15,660 | 14 |
| jefferson | 117 | 54 | 8 | 15 | 4,800 | 13 |
| st-bernard | 121 | 61 | 7 | 19 | 5,268 | 12 |
| plaquemines | 118 | 47 | 6 | 19 | 4,692 | 11 |
| st-tammany | 150 | 71 | 9 | 15 | 6,312 | 14 |
| sf-downtown | 337 | 190 | 7 | 18 | 14,460 | 12 |
| sf-mission | 206 | 135 | 7 | 15 | 9,180 | 12 |
| sf-golden-gate-park | 233 | 159 | 5 | 13 | 10,692 | 10 |
| sf-marina | 290 | 175 | 7 | 16 | 12,576 | 12 |
| sf-bayview | 208 | 140 | 5 | 15 | 9,096 | 10 |
| bayworld | 204 | 98 | 6 | 24 | 8,256 | 11 |

Budgets: 24 agents per chunk (low 8), 360 per map (low 120), 26,000 triangles, 15 draw calls. Flee, measured from a
still avatar started a metre away: dog 7.0 of 6 m, cat 5.9 of 5, squirrel 8.1 of 7, pigeon 5.9 of 5, gull 9.5 of 8,
chicken 5.8 of 5, egret 13.9 of 12. A headless load of Orleans, SF Downtown (reduced motion: placed, still) and Bay World
shows no page error; the parish app's renderer drew 106 calls / 89,500 triangles in Orleans with life on.

Evals (`node tools/eval_worlds.mjs`, port 8983, browser included): mean 98 before (d85a41f) and 98 after; every
parish and Bay World page still loads at both sizes with no page error. Singles run: `check_menagerie` 20,167/0,
`check_parishes` 12,920/0, `check_mobile` 158 pass, `check_budget` all 697 stations inside, `check_fleet` 143 builders
inside. The parishes and Bay World bundles were rebuilt and parse clean.

## Seams

- **Provided — `mgMountLife({ three, root, parish, groundAt, sidewalkAt, colliders, pos, threats, tier, night, still })
  -> { animate(t, dt), counts(), stats(), agents }`** (`WebXR/shared/mg-life.js`). Mounted by MENAGERIE in
  `WebXR/parishes/js/app.js` and `WebXR/bayworld/js/app.js`.
- **Consumed — CITYWORKS `cwSidewalkAt(parish, x, z) -> bool`**: passed as `sidewalkAt: (x, z) => cwSidewalkAt?.(parish,
  x, z)` when the module exists; absent, `mgPlan` falls back to the road edges. Not in this tree: the parishes app
  guards on `globalThis.cwSidewalkAt` so the coordinator's merge closes the seam without an edit here.
- **Consumed — CITYWORKS `cwColliders(parish, chunkKey) -> [{ min, max, kind }]`**: placement rejects a point inside a
  box and a step never enters one. Guarded the same way.
- **Consumed — NEWTON's vehicles as threats**: `threats: () => [[x, z], ...]`; the parishes pass none yet, Bay World
  passes its traffic cars.
