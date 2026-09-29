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
- Consumers on another branch (NEIGHBORHOODS, EASTBAY): nothing to call — tag the landmark with `"lm": "<kind id>"` and the engine
  draws it once this branch merges; until then the tag is ignored and the generic sign stands. A module that builds a kit itself
  imports `lmBuild` from `./lm-landmarks.js` and guards with `typeof lmBuild === "function"`.
- Bridge kinds: the engine fits them to the nearest bridge/causeway road within 800 m; `"lmAlong": 0..1` places the kit's centre
  along that road and `"lmSpan"` sets the distance between towers. `"lmAt": [x, z]` moves a ground kit off its sign.

## Cycles
1. Reason: publish the kind ids first so NEIGHBORHOODS and EASTBAY can code against them. Act: this doc's table and the `lm`
   field convention. Observe: committed at minute 8 (1d57472). PASS.
2. Reason: every kind builds headlessly as one mesh within a per-kind budget with a phone tier. Act: `lm-landmarks.js` (14 kinds,
   merged parts; the Painted Ladies and the cranes one InstancedMesh each). Observe (scratch probe): 12 of 14 inside the first
   guesses; `bay-bridge-east-tower` 1488 > 1400 and `lake-merritt-pergola` 1588 > 1000 on the desktop tier → budgets set from
   the measured builds with a margin (1600/900, 1700/600). PASS after the fix.
3. Reason: np-world.js draws a registry-kind landmark with `lmBuild` (bridges fitted to the bridge road), the SF and Oakland
   maps tag theirs, and the budgets hold. Act: np-world wiring, `lm` tags on 8 existing landmarks plus 3 named places in
   sf-downtown (the Transamerica Pyramid, the Powell Street turntable, the Painted Ladies at Alamo Square), `check_landmarks.mjs`.
   Observe: `check_landmarks: 14 kinds, 4 maps draw landmarks with the kit — 522 passed, 1 failed` (the baseline entry was
   missing) → added → see cycle 4.
4. Reason: the shared engine checks still pass with the kit in and the bundle carries it. Act: baseline entry, bundle rebuilt.
   Observe: `check_parish_data: … 128 landmarks … 12019 checks pass, 0 fail`; `[parishes] wrote … (3632 KB, 99 modules)`;
   `check_parishes: 19103 passed, 0 failed`; worst sf-downtown/high 157 meshes (was 150) / 71481 triangles of 260 / 400000. PASS.
5. Reason: the shared contracts hold with the new module (imports, phone pages). Observe: `check_imports: All 961 modules call
   only what they declare or import.`; `check_mobile: 158 checks pass — 12 page sizes …`. PASS.
6. Reason: the real page draws the kit with no page or GL errors (headless Chromium on 8964, dist bundle). Act: scratch probe
   `$SP/packs/landmarks/live.mjs`. Observe: sf-downtown 7 kits (`lm-the-ferry-building` … `lm-painted-ladies`), sf-marina
   `lm-golden-gate-bridge` (towers and cables over the bridge road), oak-west-oakland 2 kits; stills rendered; 0 page errors,
   0 GL errors on all three maps. PASS.
