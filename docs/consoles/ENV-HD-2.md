# Console ENV-HD-2

- Console: ENV-HD-2 (loop 10, round 2, prefix `hd2`, port 9103)
- Brief: `$SP/loop10/brief-r2.md` (section ENV-HD-2), under the Rules of `$SP/loop10/brief.md`, the Shared rules of
  `packs-brief.md` and the reactor loop of `packs-brief-3.md`
- Base: f4884d71 (fast-forward), branch `worktree-agent-a9ba36692c4f14d98`

## What is here
- **The neighbourhood takes the robotics look** (`WebXR/shared/fc-facades.js`). FACADES gains a kit resolver:
  `FC_KIT_RESOLVERS`, consulted in order when `fcDetails` buckets a spot (`fcKitGroupFor`). The built-in resolver,
  `fcRoboticsGroup`, gives every shed and tower within `FC_ROBOTICS.radius` (150 m) of a robot site (RB_SITES' anchor +
  offset, the same positions ROBO-EXTERIORS builds at: `fcRobotSitesFor`) the robotics variant:
  - sheds: window band, roll-up doors, **roof plant** (a louvred screen and two air-handling units), **skylights** along the
    ridge, **dock bumpers and lights** at each door (4 / 6 / 36 / 48 / 108 triangles: cheapest first);
  - towers: cornice, mullions, **roof plant**, a **plant louvre band** under the roof line (12 / 32 / 36 / 48).
  Both robotics kits keep the generic kits' two cheapest details, so on the phone tier a robotics spot falls back into the
  generic bucket: the phone builds exactly what it built before (no extra mesh, proven chunk by chunk). The new detail kinds
  are in `FC_DETAIL_KINDS` and `fcDetailParts`; nothing models a real building and nothing carries words.
- **DETAIL's scatter keeps out of the lots** (`WebXR/shared/dt-detail.js`). `dtLotRects(parish)` reads ROBO-EXTERIORS'
  `fxLayoutsFor` (each lot rectangle and its `fxColliders` boxes), cached per map; a chunk keeps the rects that touch it,
  grown by `DT_LOT_MARGIN` (0.5 m), and a candidate inside one is dropped **after** its random draws, so lower tiers and
  farther rings stay subsets of the higher ones.
- **High-resolution interiors beyond robotics** (`WebXR/shared/hd2-room-skins.js`, new). One more dresser on the nine
  INTERIORS styles most site doors open into — workshop (167 sites), plant room (139), port shed (124), civic lobby (108),
  classroom (62), apparatus bay (55), transit barn (53), clinic (52), warehouse (47): 807 of 863 doors. It sets texture maps
  on meshes that already exist and adds none:
  - the **industrial set** (workshop, plant room, port shed, apparatus bay, transit barn, warehouse): ROBO-INTERIORS' epoxy
    floor with per-kind floor marks (a hatched door apron, a yellow walkway, a dashed keep-clear perimeter, bay lines or a
    keep-clear box), painted concrete walls, brushed metal on racks, machines, tanks, cabinets and hoods;
  - the **tile set** (civic lobby, classroom, clinic): a vinyl-tile floor (0.6 m tiles, two tones, grout) and a painted block
    wall (0.4 × 0.2 m running bond), brushed metal on cabinets;
  - 1024 px on the desktop high tier, 256 px on balanced, the phone and a headset browser (`ixrTexRes`), inside
    `HD2_TEX_BUDGET` (ROBO-INTERIORS' room budget: high 24 MiB, balanced and low 3 MiB, every texture in the room counted,
    the shell's two signs included).
  ROBO-INTERIORS' painters are shared, not copied: `ixrSetTexture` and `ixrFloorTexture` are now exported, and
  `ixrFloorTexture` takes an optional `marks` list for rooms outside its six.
- **Captures** (`tools/drive_hd2_captures.mjs`, not in the gate): 1920×1080 stills of the nine skinned rooms and of the West
  Oakland warehouse's neighbourhood by day and night, written to `$SP/loop10/hd2/`, through two new capture presets,
  `window.__parishTest.hd2.room(styleId)` and `window.__parishTest.hd2.hood(siteId)`.
- Checkers: `tools/check_facades.mjs` section 7 (the robotics variant), `tools/check_detail.mjs` section 6 (the lots), and
  `tools/check_room_skins.mjs` (new; in `tools/check_all.mjs`, an estimated row in `docs/perf/checkers-baseline.json`
  labelled as an estimate to re-measure quiet). `exports/shared/holodeck-shared.json` is regenerated (FACADES' kits are in
  the TradeQuest export; `check_bridge` compares it with a fresh build).

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| buildings near robot sites with a robotics variant | 0 (FC_KITS had no robotics kit at f4884d71) | **68 of 68** sheds and towers within 150 m (5 maps, high tier); 0 beyond 150 m | `node tools/check_facades.mjs` ("robotics variant: 68 of 68 …") |
| per map (sheds/towers within 150 m) | 0 | orleans 4, sf-downtown 5, oak-west-oakland 18, bay-san-jose 28 (towers), la-meta-richland 13 | `$SP/loop10/hd2/probe-fc.mjs` (the same walk as the checker) |
| phone tier near robot sites | — | unchanged: every chunk within reach builds the same details with and without the resolver | `check_facades` ("phone tier unchanged by the robotics variant: N of N chunks") |
| worst robot-site chunk, FACADES + kit vs FC_BUDGET (San José 9,7) | high 3+2 meshes / 4,918+880 tris | high 4+2 meshes / 4,158+880 tris (≤ 6 / 24,000); low 1+1 / 1,056+36 unchanged | `node tools/check_exteriors.mjs` (per-chunk notes) |
| full streamed build, worst meshes / triangles (check_facades §5) | orleans high 186 / 93,263; oak-west-oakland high 163 / 90,030; every low tier 121 / 45,010 · 101 / 41,763 · 92 / 37,134 | orleans high 187 / 93,263; oak-west-oakland high 164 / 90,606; every low tier unchanged (≤ 260 / 400,000) | `check_facades` before/after logs |
| scattered props inside robotics lots (every tier, ring 0) | **834** at high (inside the six lots, 10 chunks) | **0** on every tier | before: `$SP/loop10/hd2/probe-dt.mjs` over f4884d71's `dt-detail.js`; after: `node tools/check_detail.mjs` ("scattered props inside robotics lots: 0 …") |
| `check_detail` generation median (CPU, high) | **10.6 ms** at load 6.6 → 7.1 (f4884d71's dt-detail.js and checker, run back to back with the after run) | **9.9 ms** at load 6.4 → 5.5 (an earlier run: 10.1 ms at load 11.8 → 8.1); budget 12, judged only on a quiet machine | `node tools/check_detail.mjs` (`$SP/loop10/hd2/logs/detail-base.txt`, `detail-after2.txt`) |
| room styles with the high-detail texture set | 6 (ROBO-INTERIORS' robotics rooms) | **15** (+ workshop, plant room, port shed, civic lobby, classroom, apparatus bay, transit barn, clinic, warehouse) | `node tools/check_room_skins.mjs` ("6 → 15") |
| meshes / triangles / lights per room, nine styles × three tiers | — | **identical** with and without the skin (27 of 27 builds) | `check_room_skins` (one line per style and tier) |
| texture bytes per room (every texture, shell signs included) | 1.33 MiB on every tier (the shell's two signs) | high **17.33 MiB** (tile rooms 12.00 MiB in the page; budget 24 MiB), balanced and low **2.33 MiB** (budget 3 MiB) | `check_room_skins` (allocation), drive (canvases the page drew: 17.33 MiB on high) |
| captures at 1920×1080 | 0 | **11**: 9 rooms + the West Oakland warehouse's neighbourhood by day and night; 0 failed, page errors 0, external requests 0 | `node tools/drive_hd2_captures.mjs 9103 high $SP/loop10/hd2` (146 s at load 0.5 → 6.8; rooms re-shot with a clean frame: 99 s at load 6.0 → 10.0) |
| texture bytes per room in the built page (high, measured canvases) | — | industrial rooms and the classroom and clinic 17.33 MiB, civic lobby 12.00 MiB (no metal props) — ≤ 24 MiB | the drive's room lines |
| `check_facades` | 2,860 pass | **2,957** pass | `node tools/check_facades.mjs` |
| `check_exteriors` | 259 pass | 259 pass | `node tools/check_exteriors.mjs` |
| `check_detail` | 479 pass, 0 fail (f4884d71) | **485** pass, 0 fail | `node tools/check_detail.mjs` |
| `check_mobile` | — | 326 checks pass (drives the committed dist pages; the Node legs import the changed dt-detail.js and fc-facades.js) | `node tools/check_mobile.mjs` (it rewrites `docs/perf/phone-maps.json` with measured figures: restored, not committed) |
| `check_dean` (reads the shared export) | — | 3362/3362 | `node tools/check_dean.mjs` |
| `check_bridge` | 139/139 at the base | 138/139 after the kit change (stale export) → **139/139** after `node tools/export_shared.mjs` | `node tools/check_bridge.mjs` |
| `check_interiors` · `check_classrooms` · `check_la_rooms` · `check_robo_interiors` | 925 · 2,057 · 3,787 · 302 pass | 925 · 2,057 · 3,787 · 302 pass | each checker, base files and branch files (see Cycles 5) |
| `check_room_skins` | — | all 164 checks pass | `node tools/check_room_skins.mjs` |
| `check_imports` | All 1104 modules (ROBO-EXTERIORS' figure) | All 1114 modules call only what they declare or import (one false positive met and fixed: Cycles 7) | `node tools/check_imports.mjs` |

## Captures
`$SP/loop10/hd2/`: `room-<style>-high.png` × 9 and `hood-rb-site-west-oakland-warehouse-{day,night}-high.png`, all 1920×1080
from the built page (high tier, headless Chromium with SwiftShader). Drive lines: `$SP/loop10/hd2/logs/drive1-first.txt` (all
eleven) and `drive-rooms-final.txt` (the rooms re-shot after the room preset learnt to hide the menu and the entry toast).

| capture | meshes | draw calls | triangles drawn | textures (measured in the page) |
|---|---|---|---|---|
| workshop | 18 | 21 | 740 | 17.33 MiB (floor, concrete, metal at 1024; two 512 signs) |
| plant room | 17 | 20 | 752 | 17.33 MiB |
| port shed | 18 | 21 | 956 | 17.33 MiB |
| civic lobby | 17 | 18 | 764 | 12.00 MiB (tile floor, block wall) |
| classroom (CLASSROOMS-dressed) | 18 | 19 | 1,004 | 17.33 MiB |
| apparatus bay | 17 | 17 | 752 | 17.33 MiB |
| transit barn | 17 | 17 | 788 | 17.33 MiB |
| clinic | 18 | 19 | 788 | 17.33 MiB |
| warehouse | 17 | 20 | 968 | 17.33 MiB |
| West Oakland warehouse neighbourhood, day | — | 248 | 168,064 | 10 robotics-variant buildings in the streamed scene |
| the same, night | — | 251 | 169,548 | windows lit (ATMOS's clock) |

## Cycles
1. Reason: neighbouring sheds and towers take a robotics variant through a resolver, with the phone tier untouched; proof =
   `check_facades` prints N of N within 150 m, 0 beyond, the phone chunks identical, budgets held. Act: `FC_KIT_RESOLVERS`,
   two robotics kits, four detail kinds. Observe: the probe found my own shed kit out of order (skylights 48 before roof
   plant 36 triangles); reordered; "robotics variant: 68 of 68"; "FACADES: all 2957 checks pass"; `check_exteriors` 259 pass,
   San José 9,7 at 4+2 = 6 of 6 meshes on high. Pass; committed 0417ec29.
2. Reason: FACADES' kits are in the TradeQuest export, so the shared file goes stale; proof = `check_bridge`'s fresh-build
   comparison. Act: `node tools/export_shared.mjs`. Observe: 138/139 → 139/139. Pass (in 0417ec29).
3. Reason: DETAIL scatters props inside the robotics lots; proof = a count of props inside the lots, before and after, and
   `check_detail`'s median. Act: `dtLotRects` and one test in `put` after the draws. Observe: 834 → 0 at high (every tier 0);
   "DETAIL: 485 pass, 0 fail"; median 10.1 ms CPU at load 8–12, and in a paired run 10.6 ms (base) → 9.9 ms (branch) at load
   5.5–7.1. Pass; committed 8b9a8d3c.
4. Reason: the canvas texture set on the most-visited rooms without a single new mesh; proof = `check_room_skins` (meshes,
   triangles, lights identical; maps at the tier's resolution; bytes inside the budget). Act: `hd2-room-skins.js`, two
   exports in `ixr-robo-interiors.js`, the app and bundler wiring, the checker. Observe: "ROOM-SKINS: all 164 checks pass";
   high 17.33 MiB, balanced and low 2.33 MiB per room. Pass; committed 25e9236f.
5. Reason: the shared painters' new exports must not move the other rooms' checkers; proof = the same pass counts on the base
   files and the branch files. Act: run `check_interiors`, `check_classrooms`, `check_la_rooms`, `check_robo_interiors` on
   both. Observe: 925 / 2,057 / 3,787 / 302 pass on both. Pass.
6. Reason: stills for the reel and the deck; proof = the drive prints ok for every capture, page errors 0, external requests
   0. Act: `__parishTest.hd2.room/hood` and `tools/drive_hd2_captures.mjs` over a fresh `python3 tools/bundle_webxr.py
   parishes` (the dist was restored afterwards). Observe: "11 captures, 0 failed, page errors 0, external requests 0, 146 s,
   load 6.8" — but looking at the frames, the room stills had the map menu and the entry toast over them (the checker-style
   line could not see it). Fail → the room preset hides the menu and the toast, as the establishing shots do; re-shot: "9
   captures, 0 failed, page errors 0, external requests 0, 99 s, load 9.96"; frames looked at (floor marks, tile and block,
   brushed metal; the night frame's lit windows). Pass.
7. Reason: `check_imports` must stay clean with the new module; proof = "All N modules call only what they declare or
   import". Observe: "FAIL hd2-room-skins.js: calls rng()" — the checker reads `const g = …, rng = hd2Rng(…)` as a call to a
   name defined only in robot.js (it sees the first declarator only). Act: declare `const rng = hd2Rng(…)` on its own line.
   Observe: "All 1114 modules call only what they declare or import"; `check_room_skins` still 164 pass. Pass.

## Seams
- `FC_KIT_RESOLVERS` (fc-facades.js): `resolver({ parish, kind, spot, group }) -> FC_KITS group | null`, first non-null wins;
  `fcKitGroupFor(parish, kind, spot, group)`; built-in `fcRoboticsGroup`, `fcRobotSitesFor(parish) -> [{ id, x, z }]`, data
  `FC_ROBOTICS = { radius: 150, kinds: ["shed", "tower"], group: "robotics" }`. A resolver that names a variant whose tier
  details equal the default's is folded back into the default bucket (that is what keeps the phone tier unchanged).
- `dtLotRects(parish) -> [[x0, z0, x1, z1]]`, `DT_LOT_MARGIN` (dt-detail.js), reading `fxSitesFor` / `fxLayoutsFor`
  (dt-detail.js now imports fx-exteriors.js; both are in the parishes bundle only).
- `ixrSetTexture(THREE, name, res, repeat)` and `ixrFloorTexture(THREE, styleId, room, res, marks?)` exported from
  ixr-robo-interiors.js.
- `hd2-room-skins.js`: `HD2_SKIN_STYLES`, `HD2_TEX_BUDGET`, `hd2FloorMarks(styleId, room)`, `hd2SkinRoom({ three, group, room,
  tier }) -> { style, set, res, maps }` (sets `room.hd2`), `hd2RegisterSkins(ix)`; registered in the parishes app after the
  other dressers; bundled after `ixr-robo-interiors.js`.
- `window.__parishTest.hd2 = { styles, room(styleId), hood(siteId, { back = 110, up = 62 }) }` — capture presets (walking
  or going inside ends the neighbourhood shot, as with `scene`).
- The committed `WebXR/parishes/dist/parishes.html` was rebuilt for the drive and restored; the coordinator's integration
  rebuild carries these changes.

## Left
- **Towers' ground floor.** The robotics tower kit lives in unit-height space, so it has no entrance canopy (a ground item
  would scale with the tower's 30–120 m height); an unstretched roof mesh would also let the roof plant keep one size.
- **San José 9,7 is at the chunk mesh budget** on high (FACADES 4 + kit 2 = 6 of 6): a further kit variant there would need
  the generic and robotics towers merged into one instanced mesh (one geometry, per-instance visibility) or a per-chunk rule.
- **Other scatter**: MOTORWORKS' parked vehicles and MENAGERIE's animals are not tested against the lots.
- **More rooms**: kitchen (23 sites), the LA rooms and the union hall are unskinned; the civic lobby could take a terrazzo
  variant; the tile set's block wall could carry a per-style tint band.
- **Quiet re-measures**: `check_detail`'s median (judged only on a quiet machine) and `check_room_skins`' baseline estimate.
- **The phone tier's rooms** take 256 px maps (1.0 MiB a room) inside ROBO-INTERIORS' existing 3 MiB room budget; no
  phone texture budget elsewhere changed.
