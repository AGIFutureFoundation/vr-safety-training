# LANDMARKS-2 — more landmarks, more detail, and a few you can walk into (console `lx`, environment wave)

Brief: `interiors-brief.md` (section LANDMARKS-2) over `wave-brief.md`'s top section, `packs-brief.md`'s Shared rules and
`packs-brief-3.md`'s reactor loop. Prefix `lx`/`LX_`, port 9002. Base 9914455. Extends LANDMARKS' kit
(`WebXR/shared/lm-landmarks.js`, `docs/consoles/LANDMARKS.md`) under the same rules: every shape is a **schematic silhouette**
of boxes, cylinders, cones and lathes — no measured dimensions, no proportions taken from drawings, no claim of accuracy. One
mesh per kind (a repeated unit is one InstancedMesh), a phone tier, nothing moves (reduced-motion safe). `NP_MASSING_HOOKS` is
not touched.

## New kind ids (21)

| kind id | what it draws (schematic) | tagged on |
|---|---|---|
| `truss-bridge` | piers and a through-truss rising over the main piers (bridge kind: fitted to the bridge road) | Crescent City Connection (orleans), Huey P. Long Bridge (jefferson) |
| `church-towers` | a nave with a gable, a tall centre tower and spire, two flanking towers | Jackson Square — the cathedral on it (orleans) |
| `mission-church-front` | a thick wall with a stepped parapet and bell openings, a low tiled nave | Mission Dolores (sf-mission) |
| `windmill` | a tapering body, a cap, four still sails, a stage | the Dutch and Murphy windmills (sf-golden-gate-park; their `kind` is already `windmill`) |
| `glasshouse` | a domed central pavilion with two glazed wings | the Conservatory of Flowers (sf-golden-gate-park) |
| `rotunda-colonnade` | an open domed rotunda on columns with curved colonnades | the Palace of Fine Arts (sf-downtown, sf-marina) |
| `masonry-fort` | thick brick walls round a parade, corner bastions, a flagstaff | Fort Point (sf-marina) — Fort Jackson stays generic: a site stands on it and the ground round it is water |
| `lattice-mast` | three tapering legs, a waist and a three-armed crown, cross-braced | Sutro Tower (sf-haight-castro) |
| `switchback-street` | a steep lane of hairpin bends between hedges | Lombard Street's crooked block (sf-downtown, sf-north-beach) |
| `theatre-marquee` | a tall facade, a marquee canopy and a blade sign, both blank | the Castro's marquee (its `kind`), Fox, Paramount, Grand Lake (oak-downtown-lake) |
| `campanile` | a square shaft, clock faces, an open belfry, a pyramid roof | Sather Tower (oak-emeryville-berkeley) |
| `civic-tower` | a long civic block, a glazed rotunda, a slim tower | San José City Hall (bay-san-jose) |
| `transit-station` | a platform, a canopy on columns, rails, a head house — generic, no system's design | Balboa Park, West Oakland, Fruitvale, Richmond, Diridon |
| `memorial-plaza` | a paved walk, a low wall of panels, benches, a lookout rail | the Rosie the Riveter Memorial (bay-san-pablo) |
| `canal-lock` | two lock walls, closed mitre gates at each end, a control house | the Industrial Canal lock (orleans), Harvey Canal lock (jefferson) |
| `levee-pump-station` | a pump house on a levee crown, intake bays, discharge pipes | the Seventeenth Street and London Avenue canals (orleans, jefferson) |
| `marsh-boardwalk` | a plank walk on posts with a dog-leg and a railed platform | the Bayou Bienvenue viewing platform (orleans), Arrowhead Marsh (bp-san-leandro-bay) |
| `tide-gate` | a headwall across a channel with flap gates and a walkway | (untagged: no map names a tide gate yet — offered for Bay Program sites) |
| `shotgun-row` | a row of narrow shotgun houses on piers (instanced, one mesh) | Bywater (orleans) |
| `streetcar` | one long streetcar / light-rail car | the Third Street light rail (sf-bayview) |
| `gateway-arch` | a paifang-style gateway: four posts, a centre roof, two side roofs, a blank board | the gate at Grant Avenue (sf-north-beach) |

Tags are written by `tools/lx_tag_landmarks.mjs` (the list `LX_TAGS`, idempotent) — only where the kind honestly fits the named
place. Left generic on purpose: parks, shores, neighbourhoods (except Bywater), creeks, stadiums, hills, the Cathedral Basilica
in San José (its towers do not read as `church-towers`), Tower Hall, the twin spans, underground stations (Downtown Berkeley).

## Walk-in landmark interiors

`WebXR/shared/lx-walkin.js`: four public places open into a generic, schematic room — no real building's interior is modelled.

| style | opens from | room |
|---|---|---|
| `market-hall` | `ferry-building` (sf-downtown, sf-north-beach) | a long hall with two rows of stalls under a clock tower |
| `lamp-room` | `lighthouse` (st-tammany) | a small glazed room round a lamp on its pedestal |
| `pier-shed` | `wharf-pier-shed` (Fisherman's Wharf, Pier Thirty-Nine) | a long shed with stacked crates |
| `glasshouse` | `glasshouse` (the Conservatory of Flowers) | a glazed hall with rows of planters |

At a walk-in kit the parishes app offers "E — go inside <name>"; inside, the outdoor root is hidden and does not stream, the room
stands below the map (y −400) with its own lights, the player walks a box collider, and E returns them to the door. Each room is
7 meshes (floor, ceiling, four walls, one InstancedMesh of dressing), ≤ 648 triangles; the phone tier thins the dressing.

## Seams

- `lxWalkinStyleOf(kind)`, `lxWalkinDoors(lmKits)`, `lxBuildRoom(style, { three, tier, ix })`, `lxWalkin({ three, scene, outdoor, tier, ix })`
  → `{ enter(door, at), exit(), clamp(x, z), eyeY(eye), inside }` (`WebXR/shared/lx-walkin.js`, mounted in `WebXR/parishes/js/app.js`).
- INTERIORS seam (guarded): when `shared/ix-interiors.js` lands, pass it as `ix` (the app passes `globalThis.IX_INTERIORS`);
  `ix.ixBuildRoom(style, { three, tier, w, d, h })` returning a THREE.Group (or `{ group }`) replaces the minimal room. The
  coordinator can switch the app to a static import once both branches merge.

- `lmBuild(kind, …)` gains the 21 kinds above; `LM_BUDGET` carries their budgets; `LM_BRIDGES` gains `truss-bridge`.
- `tools/check_landmarks.mjs` now walks all 22 maps (was San Francisco and Oakland only), prints the worst chunk's meshes per
  map with kit landmarks, and reads the kind list from LANDMARKS.md and this doc.

## Cycles
1. Reason: list what still draws generic, then add kinds in order of maps served. Observe: `node -e` over `NP_PARISHES` with
   `lmKindOf` — 197 landmarks, 24 drew with the kit (173 generic). PASS (baseline).
2. Reason: 21 new kinds build as one mesh within a per-kind budget with a phone tier. Act: kinds in `lm-landmarks.js`. Observe:
   scratch probe, every kind builds; budgets set from the measured builds (e.g. truss-bridge 1692/756, rotunda 1114/582,
   streetcar 60/48). check_landmarks: only the doc-list lines failed (21) → this doc lists them. PASS after the fix.
3. Reason: tag every honestly matching landmark and walk all 22 maps in check_landmarks. Act: `tools/lx_tag_landmarks.mjs`
   (33 tags), checker over all maps with the worst chunk's meshes. Observe: 60 of 197 on 19 maps; 2 FAIL — fort-jackson sits
   on a site pad with water round it → left generic. Worst chunk (desktop, full build) 107–174 meshes (orleans 174) ≤ 260. PASS
   after the fix (59 of 197).
4. Reason: three or four walk-in landmark interiors, generic and schematic, guarding INTERIORS' shell. Act:
   `WebXR/shared/lx-walkin.js` (market hall, lamp room, pier shed, glasshouse; `ix.ixBuildRoom` tried first, guarded) and the
   parishes app (door prompt "E — go inside …", the outdoor root hidden and streaming stopped inside, a box collider, E to come
   out at the door). Observe: check_landmarks 1515 passed, 0 failed; rooms 7 meshes / 128–648 triangles (≤ 120 / 4000); 7 doors
   on the maps; a fake ix is used, a throwing one falls back. PASS.
5. Reason: the engine budgets hold on every map with the new kits, and the bundle carries them. Act: `check_parishes` (single),
   `bundle_webxr.py parishes`, `node --check` of the bundled module, `eval_worlds --no-browser` once. Observe: check_parishes
   30927 passed, 0 failed; bundle 4370 KB, 120 modules, parses; eval_worlds 27 subjects, mean 97, all 22 maps budget 4/4 (the
   18 findings are play-layer lessons on the Bay Area maps — PLAYLAYER's section). No eval was run before (base not measured). PASS.
