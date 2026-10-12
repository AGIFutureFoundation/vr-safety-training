# Console ROBO-EXTERIORS

- Console: ROBO-EXTERIORS (loop 10, prefix `fx`, port 9094)
- Brief: `$SP/loop10/brief.md` (section ROBO-EXTERIORS), under the Shared rules of `packs-brief.md` and the reactor loop of
  `packs-brief-3.md`
- Base: 43d3e3f6 (fast-forward), branch `worktree-agent-a802421ddfb15e23d`

## What is here
- `WebXR/shared/fx-exteriors.js` — the six robot sites' buildings from outside, generic by kind, registered **beside**
  FACADES (it never touches `NP_MASSING_HOOKS`, `fcDetails` or PALETTE's material hook): one fixed group per robot site,
  always present (no pop-in at the near ring), mounted by the parishes app.
  - **Five kits:** a fabrication hall (tilt-up panels, two roll-up doors with hazard-striped thresholds, roof plant, three
    skylights, parapet, an entrance canopy) for the SoMa robot cell; a research lab (curtain-wall mullions and fins, an entrance
    canopy, a roof plant screen) for the San José cobot lab; a distribution warehouse (four dock doors with bumpers and dock
    lights on a raised dock, truck-court markings, corrugated cladding) for the West Oakland and Orleans AMR aisles; a port
    control tower (shaft, glazed cab, base building) beside two crane rails under the gantry's legs and a container-stack
    edge (four stacks, two high) for the West Oakland port yard; a construction site (an unfinished concrete frame, a
    scaffold, hoarding with a gate, a site cabin, water-filled barriers) for the Richland ceiling-drilling deck.
  - **Streetscape** at each site: bollards, two EV chargers with marked bays (none at the construction site, which has
    barriers instead), loading-bay and hazard markings, and **pictogram-only** safety signs on posts — robot operating,
    pedestrian walkway, hard hats on, automated vehicles moving, EV charging. No words are ever drawn (the checker proves the
    module has no `fillText`), and nothing names a company, union or trade body.
  - **Lots** (`fxSiteLayout`): a deterministic search round the pad (north, east, west, south; 4–50 m out; slid 0/±12/±24/±36 m)
    for a lot — body, front yard (truck court, apron, signs) and side chargers — clear of the pad and its warning zone,
    the kept massing, trees, the catalog site buildings and boards, the roads (half-width + kerb + sidewalk + 2 m), water
    and the map edge, with an open walk from the pad to the door (straight or round one corner). The port tower stands only
    east or west because its crane rails run north–south through the pad. The buildings are solid in the walk (their boxes
    join WALKABLE's collider seam in the app).
  - **High detail:** a canvas atlas of sixteen 256 px cells (1024 px) on the desktop high tier, 512 px on balanced, none on the
    phone; a quarter-size glow mask is the skin's `emissiveMap`, lit from ATMOS's dusk to dawn (`atLightsOn`). High-only
    geometry: downpipes, sunshades, door guide rails, skylight frames, plant louvres, spandrel ledges, rooftop panels, planters
    and a bike rack, dock shelters and leveller plates, a parked trailer, cab mullions and a walkway rail, container door ends,
    scaffold braces and toe boards, hoarding posts, rebar starters and a material hoist.
  - **Scenes:** two establishing shots per site (`wide`: from beyond the pad, 16 m up, building and yard in frame; `door`: the
    approach at eye height, about 9 m from the door) — 12 presets — through `window.__parishTest.scene(siteId, shot)` and the
    `?scene=<siteId>:<shot>` URL parameter.
- `tools/check_exteriors.mjs` — the proof (in `tools/check_all.mjs`; an estimated row in `docs/perf/checkers-baseline.json`,
  labelled as an estimate to re-measure quiet).
- `tools/drive_exteriors_page.mjs` — the page-level drive (not in the gate): the twelve shots in the built page, the renderer
  measured with the kit hidden and shown, night, page errors and external requests.
- Wiring: `WebXR/parishes/js/app.js` (import, collider seam, mount after the robotics sites, `setHour` from the sky, the
  establishing-shot camera, `__parishTest.exteriors` and `.scene`); `tools/bundle_webxr.py` (after `rb-world.js`).

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| robot sites with a dedicated exterior kit | 0 | **6 of 6** | `node tools/check_exteriors.mjs` ("robot sites with a dedicated exterior kit: 6 of 6") |
| scene presets | 0 | **12 of 12** | `check_exteriors` ("scene presets: 12 of 12"); drive: 12 shots framed in the built page |
| kit per site, meshes / triangles (phone · balanced · high) | — | 1 / 36–180 · 2 / 450–804 · 2 / 880–1,296 (budget 1/1,500 · 2/7,000 · 2/7,000) | `check_exteriors` ("triangles per site …") |
| worst chunk with FACADES + kit vs `FC_BUDGET` (meshes, triangles) | low 2 / 1,056 · high 3 / 4,918 | low 3 / 1,092 (≤ 4 / 6,000) · high 5 / 5,798 (≤ 6 / 24,000) | `check_exteriors` (per-chunk notes; San José chunk 9,7 is the heaviest) |
| full build at the robot sites, meshes (draw calls) / triangles | see the table below | +1 to +2 meshes a site, ≤ 260 / 400,000 everywhere | `check_exteriors` (full-build notes) |
| texture bytes per map (kit) | 0 | phone 0 · balanced 1,485,483 · high 5,941,931 (budget 0 / 1,572,864 / 6,291,456) | `check_exteriors` (planned), drive (canvases drawn) |
| `check_detail` generation median (CPU) | 11.2 ms at load 8.5–8.7 | 10.8 ms at load 5.3–6.9 (budget 12) | `node tools/check_detail.mjs`, before/after runs; the kit adds no detail generation, so the difference is the load |
| `check_facades` | 2,860 pass | 2,860 pass | `node tools/check_facades.mjs` |
| `check_palette` | 684 passed, 0 failed | 684 passed, 0 failed | `node tools/check_palette.mjs` |
| `check_signage` | pass (111 unions, 733 pads) | pass (111 unions, 733 pads) | `node tools/check_signage.mjs` |
| `check_walkable` (node legs) | 2,720 passed | 2,720 passed | `node tools/check_walkable.mjs --no-browser` |
| `check_detail` | 479 pass, 0 fail | 479 pass, 0 fail | `node tools/check_detail.mjs` |
| `check_imports` | — | All 1104 modules call only what they declare or import | `node tools/check_imports.mjs` |
| `check_exteriors` | — | all 259 checks pass | `node tools/check_exteriors.mjs` |

### Full streamed build at each map's robot sites (worst over the sites; meshes = draw calls)
From `check_exteriors` (engine + CITYWORKS' mass filter + FACADES, built at every robot site of the map; "before" counts the
same scene with the kit's group excluded). Phone and headset budgets are unchanged; the kit's phone cost is one mesh a site.

| map | low before → after | balanced before → after | high before → after |
|---|---|---|---|
| oak-west-oakland (2 sites) | 87 / 30,716 → 89 / 30,896 | 160 / 67,490 → 164 / 68,514 | 160 / 67,490 → 164 / 69,046 |
| bay-san-jose | 74 / 28,286 → 75 / 28,322 | 147 / 84,048 → 149 / 84,532 | 147 / 84,048 → 149 / 84,928 |
| orleans | 115 / 38,559 → 116 / 38,631 | 185 / 66,469 → 187 / 67,171 | 185 / 66,469 → 187 / 67,435 |
| la-meta-richland | 68 / 20,684 → 69 / 20,864 | 122 / 32,598 → 124 / 33,402 | 122 / 32,598 → 124 / 33,894 |
| sf-downtown | 91 / 26,789 → 92 / 26,837 | 141 / 47,443 → 143 / 48,019 | 141 / 47,443 → 143 / 48,535 |

### In the built page (high tier, 1280×720, headless Chromium with SwiftShader)
DRIVE_TABLE

## Cycles
1. Reason: give every robot site a lot clear of what stands there before drawing anything; proof = a probe printing each
   lot's clearance. Act: `fxSiteLayout` with the candidate search. Observe: six lots, all clear (first pass), 0.4 s for all
   five maps. Pass.
2. Reason: build the five kits as two meshes a site (one on the phone) and prove the budgets; proof = `check_exteriors`
   ("robot sites with a dedicated exterior kit: 6 of 6", per-site meshes/triangles, the chunk with FACADES inside
   `FC_BUDGET`, full builds ≤ 260 / 400,000). Act: `fxBuildSite`, the atlas, `check_exteriors.mjs`. Observe: "all 234 checks
   pass (2.5 s)". Pass; committed 0f88041d.
3. Reason: the warehouse's truck court and the side chargers stood outside the lot the clearance test covered (they could
   lie on the pad or a road); proof = the probe with the yard in the lot. Act: `front`/`side` per kind. Observe: both
   warehouses lost their lot ("a building or tree"); shrinking the truck court to 10 m and widening the search brought them
   back; then `check_exteriors` failed one check — the Orleans walk from the pad to the door crossed a house (18 blocked
   samples). Fail → next cycle.
4. Reason: a lot is only usable if the walk to its door is open; proof = the same check re-run. Act: the approach test inside
   the search (straight, or round one corner; trees can be walked round), the path recorded on the lot and re-checked by the
   checker against every building collider. Observe: Orleans' warehouse lands 40 m south, slid 24 m east; "all 234 checks
   pass". Pass; committed 0e25763b.
5. Reason: the kit must not cost FACADES' chunk budget where the lot sits in a different chunk from the pad; proof = the kit
   charged to every chunk its lot touches. Act: per-chunk sums over the pad's and the lot's chunks. Observe: "all 258 checks
   pass"; the worst chunk is San José 9,7 (FACADES 3 + kit 2 meshes, 4,918 + 880 triangles on high). Pass.
6. Reason: prove the shots in the built page; proof = the drive (12 shots, renderer before/after, page errors 0). Act:
   `drive_exteriors_page.mjs`. Observe: the first run died in its own measure — `__parishTest.scene` had been the THREE.Scene
   (check_harvest's live leg reads it) and the new function replaced it. Fail → fixed: the function keeps the scene reachable
   (`__parishTest.threeScene`, and `traverse`/`getObjectByName`/`getObjectById`/`children` delegated); "all 259 checks pass".
   DRIVE_CYCLE

## Seams
- `fxSitesFor(parish)`, `fxSiteLayout(parish, site)`, `fxLayoutsFor(parish)` (pure; no three.js): the lots, each with
  `{ id, kind, x, z, y, yaw, w, d, h, lot, approach, door: { x, z, face, out }, boxes }`.
- `fxColliders(parish) -> [{ min, max, kind: "fx-<kind>", id, door? }]` — joined to WALKABLE's `wkColliderSeam` boxes in the app.
- `fxDoorFor(parish, siteId) -> { x, z, face, out }` — **for ROBO-INTERIORS**: where a robot site's walk-in should start
  (the door faces the pad; `out` is 1.4 m outside it). Not wired to `ixMountInteriors` here (the coordinator closes it).
- `fxScene(parish, siteId, shot) -> { position, target, fov, … } | null`; **scene presets for the reel**:
  `window.__parishTest.scene(siteId, "wide" | "door")` frames a site on the open map, or returns
  `{ ok: false, parish, href: "?parish=<map>&scene=<siteId>:<shot>" }` for a site on another map; the page also reads
  `?scene=<siteId>:<shot>` at boot. Walking or going inside ends the shot. **Note:** `__parishTest.scene` used to be the
  THREE.Scene; it is now the function, with the scene at `__parishTest.threeScene` and its `traverse`, `getObjectByName`,
  `getObjectById` and `children` delegated (check_harvest's live leg reads `scene.getObjectByName`). A caller that passed
  `__parishTest.scene` to a renderer must use `threeScene`.
- `fxMountExteriors({ THREE, root, parish, tier, hour }) -> { sites, layouts, group, setHour(h), counts(), scene(id, shot), dispose() }`
  — `window.__parishTest.exteriors`; `counts()` = `{ tier, sites, meshes, triangles, lit, textureBytes, perSite }`.
- `fxBuildSite(THREE, layout, tier)`, `fxTextureBytes(THREE)`, `fxSiteParish(siteId)`; data `FX_KINDS`, `FX_SITE_KIND`,
  `FX_PICTOGRAMS`, `FX_BUDGET`, `FX_SHOTS` (plain).
- Reads: `RB_SITES`/`RB_SSM` (rb-robotics-data.js), `npHeightAt`/`npWaterAt`/`npChunkOf`/`npMassingForChunk`/`NP_SIZE`,
  CITYWORKS' `cwMassFilter`/`cwSpotBoxes`/`cwSiteBuilding`/`cwNearestLine`, ATMOS's `atLightsOn`.
- The committed `WebXR/parishes/dist/parishes.html` predates the kit: it was rebuilt for the drive and restored, so the
  coordinator's integration rebuild carries it (`check_exteriors` notes which).

## Left
- **Neighbouring massing** keeps FACADES' generic kits; only each site's own lot is a robotics building. A kit resolver in
  `fcDetails` (sheds near a robot site take roof plant, skylights, dock bumpers) is the next step (`tools/briefs/next/fx-next.md`).
- **ROBO-INTERIORS' door**: `fxDoorFor` is ready; the interior's entrance is not wired to it here.
- **DETAIL's scatter** does not know the lots, so a scattered prop can stand inside a building; MOTORWORKS' parked vehicles are
  placed along roads (the lots keep off roads, so none was seen, but nothing proves it).
- **check_detail's median** was measured on a shared machine (load 5–9); it is judged only on a quiet one.
- **Phone nights**: the phone tier has no lit windows (no texture there by budget).
- `check_walkable`'s browser leg and `check_harvest`'s live leg were not run here (the shared machine); the scene handle's
  delegation is what keeps check_harvest's `scene.getObjectByName` read working.
