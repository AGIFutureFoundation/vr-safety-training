# LANDMARKS — familiar landmark assets for every Bay Area map (console `lm`, review wave)

Brief: `review-brief.md` (section LANDMARKS) over `packs-brief.md`'s Shared rules and `packs-brief-3.md`'s reactor loop.
Prefix `lm`/`LM_`, port 8964. Every shape here is a **schematic silhouette** made of boxes, cylinders, cones and lathes: no
measured dimensions, no proportions taken from drawings, and no claim of accuracy. A kit only makes a named place recognisable
at a glance in a procedural world.

## Kind ids (published for NEIGHBORHOODS and EASTBAY)

| kind id | what it draws (schematic) |
|---|---|
| `golden-gate-bridge` | two towers with portal struts and the two main cables sagging between them |
| `bay-bridge-suspension` | the Bay Bridge's suspension span: towers, main cables and a short deck |
| `bay-bridge-east-tower` | the eastern span's single self-anchored tower with its cable fan |
| `coit-tower` | a fluted column on a small hilltop base |
| `transamerica-pyramid` | a tall tapering pyramid with two side wings and a spire |
| `ferry-building` | a long low shed with a clock tower |
| `painted-ladies` | a row of Victorian houses (instanced, one mesh) |
| `cable-car` | one cable car (open ends, closed centre, roof) |
| `cable-car-turntable` | a round turntable with a cable car on it |
| `container-cranes` | a row of container cranes (instanced, one mesh) |
| `lake-merritt-pergola` | a curved colonnade with a beam over it |
| `victorian-house` | one Victorian house with a bay window and a gable |
| `wharf-pier-shed` | a pier deck on pilings with a long shed and a bulkhead front |
| `lighthouse` | a lighthouse: tower, gallery and lantern |

## How a map uses a kind

A landmark entry in a map's `landmarks` list draws with the kit when either

- it carries `"lm": "<kind id>"` (preferred — the landmark keeps its own `kind`, e.g. `bridge`, `place`, `shore`, which other
  checkers read), or
- its `kind` is itself a kind id from the table.

Anything else keeps the engine's generic green sign only. Every landmark keeps its green name sign; a kit landmark adds the
silhouette beside it. Optional `"lmYaw": <radians>` turns the silhouette.

## Seams

- `lmBuild(kind, { three, scale = 1, tier = "high" }) -> THREE.Group | null` — one mesh per kind (merged, vertex-coloured; a
  repeated part is one InstancedMesh). `tier: "low"` is the phone tier (fewer segments, fewer repeats). Nothing animates, so the
  kit is safe under reduced motion. `null` for an unknown kind.
- `lmKinds() -> string[]`, `lmHas(kind) -> bool`, `lmKindOf(landmark) -> kind | null`, `LM_BUDGET` (per-kind meshes and triangles
  by tier).
- `WebXR/shared/np-world.js` draws every kit landmark through `lmBuild` (in `npBuildParish`, under `parish-lm-kit`), guarded.
- Consumers on another branch: `globalThis.lmBuild ?? import` is not needed — import `lmBuild` from `./lm-landmarks.js`; guard with
  `typeof lmBuild === "function"` until merged, and fall back to the engine's generic landmark.

## Cycles
