# Console ENV-HD-4

- Console: ENV-HD-4 (loop 10, round 4, prefix `hd4`, port 9123)
- Brief: `$SP/loop10/brief-r4.md` (section ENV-HD-4), under the Rules of `$SP/loop10/brief.md`, the Shared rules of
  `packs-brief.md` and the reactor loop of `packs-brief-3.md`
- Base: de429b36 (fast-forward; round 3 merged, ENV-HD-3 included), branch `worktree-agent-ac6731bb907776b59`

## What is here
- **An opt-in "Ultra" desktop setting** (`WebXR/shared/hd4-ultra.js`). Off by default; offered only on the desktop high
  tier — never on the phone tier (or a coarse pointer or a screen under 600 px), never on balanced, never in a standalone
  headset browser, never inside an XR session (`hd4UltraAllowed`). The viewer turns it on with the Me tab's "Ultra detail"
  button (beside reduced motion, 44 px tall, hidden where Ultra is not offered; it is kept in localStorage and reloads the
  page), or `?ultra=1` for one load (`?ultra=0` forces it off). With Ultra on:
  - ROBO-EXTERIORS' facade atlas is drawn at **2048 px** (512 px cells) with a 512 px lit-window mask, instead of 1024 / 256
    (`fxMountExteriors({ atlasPx })`, which ignores it off the high tier);
  - the six robot rooms' hero textures — the epoxy floor with its marks and the painted concrete walls — are drawn at
    **2048 px** instead of 1024 (ROBO-INTERIORS' own painters at a larger size; brushed metal and guard mesh stay 1024);
  - **near-camera detail**: on each robot site's building, roof-edge guard railings, roof plant with fan housings, grilles
    and louvre fins, and a cat ladder with a hoop cage (the port tower: cab-roof and base-roof railings and antenna masts;
    the construction site: slab-edge guardrails on both poured floors and a stair tower) — one merged mesh a site; in each
    robot room, **ceiling trusses** (chords, verticals, diagonals) and **cable trays** on hangers — two instanced meshes.
  - Its own budget, `HD4_ULTRA_BUDGET`: facade texture bytes 24 MiB a map, room texture bytes 64 MiB a room, +1 mesh (one
    draw call) and ≤ 6,000 triangles a site, +2 meshes (two draw calls) and ≤ 2,500 triangles a room (rooms ≤ 8,500
    triangles, ≤ 120 meshes, ≤ 3 lights in all). The frame time was measured on the capture machine (below).
- **The robot sites at every hour and in fog and rain** (`WebXR/shared/hd4-looks.js`). Six looks over the page's own clock
  and weather (ATMOS's buckets and recipes, TERRAFORM's rain): **dawn, day, dusk, night, fog at dawn, rain at dusk**. The app's
  weathers gain "rain" (ATMOS's rain recipe), appended last so the indices carried across maps keep their meaning; dawn now
  draws a low-sun sky of its own (sky.js knows day, dusk and night only, so the string "dawn" drew the midday sky): the app
  passes the hour 5.5 (the low-sun band) and `hd4DawnSky` turns that dome half round, the sun in the east, with a cooler
  rose-violet tint, so dawn and dusk read apart.
  - **Site lights** (desktop high tier only, not balanced, the phone or a headset): two floodlight masts at each yard's front
    corners with glowing flood heads and a glare seen from any side, a lamp and glare over each of the warehouses' dock doors,
    and pools of light on the ground that follow the yard's slope — three merged meshes a map, no real light, no texture.
  - A stated **site lighting policy** (`hd4LightLevel`): dawn 0.6, day 0, dusk 0.85, night 1, and at least 0.45 in fog, rain
    or a storm by day; ROBO-EXTERIORS' **lit-window mask** follows the same level (dimmer at dawn than at night).
  - **Fog density** from ATMOS's `atFog` (0.75 in the fog look); the fog look draws the page's fog in to a ground fog at
    the site (`hd4LookFog`: far 575 → 230 m, never under ATMOS's floor of 180 m so a site board stays legible).
  - **Wet ground**: in rain the facades' up-facing surfaces (yards, markings, roofs) darken and take a faint cool sheen
    (`hd4WetUp`, a material tweak by ATMOS's wetness, 0.8 in the rain look), beside ATMOS's puddles on the streets.
  - **Presets**: every robot site's wide shot under each look, 36, through `window.__parishTest.scene(siteId, shot, look)`
    (any shot, the non-robot presets too), `?scene=<siteId>:<shot>:<look>`, listed by `__parishTest.hd4.lookPresets()`.
- **Lit robot rooms and the hive's operations room** (`WebXR/shared/hd4-rooms.js`).
  - In each of the six robot rooms (desktop high tier only): LED **ceiling light panels** between the shell's lamp rows, a
    pendant **task light over every station pad** with a pool of light on the floor, three wall-mounted amber **warning
    beacons** (two on the back wall over the robot area, one by the door; steady, nothing moves), and **one real light** — a
    task spotlight over the room's robot — which with the shell's hemisphere and point light makes 3, IX_BUDGET's limit.
  - **The hive operations room** (`hd4-hive-ops`, a new INTERIORS style, generic by kind): a control room where the Omega
    Hive's seven software agents' consoles stand in an arc facing a video wall (two panels either side of the shell's honesty
    sign, which stays readable). Each console has a desk, a monitor whose screen is a cell of one shared canvas, a chair, a
    strip in the agent's accent colour and an agent spot behind it (`room.spots.agent`, one per role). The screens show
    procedural placeholders (no words) and are the **seam for HIVE-4's console content** (below). Its door stands 3 m along
    the wall from the dispatcher's home robot site's room door (West Oakland warehouse); it takes ENV-HD-2's tile set.
- Captures: `tools/drive_hd4_scenes.mjs` (not in the gate). Proof: `tools/check_hd4.mjs` (in `tools/check_all.mjs`, an
  estimated row in `docs/perf/checkers-baseline.json` labelled as an estimate to re-measure quiet).

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|
| Ultra setting | none | **off by default**; offered on the desktop high tier only (9 of 9 cases: not the phone tier, a phone forced to high, balanced, low, a headset browser — OculusBrowser or PICO — an XR session or a window under 600 px); `?ultra=` and the stored choice; toggle 44 px, hidden where not offered | `node tools/check_hd4.mjs` §1 |
| facade texture bytes per map | phone 0, balanced 1.42 MiB, high **5.67 MiB** (1024 atlas + 256 mask; FX_BUDGET 6 MiB) | phone, balanced, high **unchanged**; **Ultra 22.67 MiB** (2048 atlas + 512 mask) ≤ 24 MiB stated | `check_hd4` §2 ("facade texture bytes per map …"); in the page (canvases drawn): high **5.67 MiB** (drive B), Ultra **22.67 MiB** (drive C), West Oakland |
| robot-site building per site, high (meshes / triangles) | 2 / 880–1,296 | **unchanged** with the 2048 atlas (6 of 6 sites identical); **Ultra adds 1 mesh (1 draw call) and 1,344–2,892 triangles** (railings, roof plant, ladder) ≤ 6,000 stated | `check_hd4` §2 (one line per site) |
| robot-room texture bytes per room | high 17.33–22.67 MiB, balanced and low 2.33–2.67 MiB (budget 24 / 3 / 3) | high, balanced, low **unchanged** (the lighting draws no texture); **Ultra 49.33–54.67 MiB** (floor and walls at 2048) ≤ 64 MiB stated | `check_hd4` §2–3 (room table) |
| robot-room meshes / triangles / lights, high | 18–20 / 1,016–2,340 / 2 | **22–24 / 1,360–2,780 / 3** (lighting: +4 meshes, +312–440 triangles, +1 light; IX_BUDGET 120 / 6,000 / 3) | `check_hd4` §3 (one line per room) |
| robot-room meshes / triangles / lights, Ultra | — | **24–26 / 2,272–4,724 / 3** (+2 meshes, +912–1,944 triangles: trusses and cable trays) ≤ 120 / 8,500 / 3 stated | `check_hd4` §2 (room table) |
| phone tier, balanced and headset browser | — | **identical**: robot rooms 18 of 18 builds unchanged with the hd4 dressers registered and Ultra asked for; no site lights; Ultra not offered | `check_hd4` §3 |
| exterior presets (robot sites × looks) | **0** (12 robot-site shots by day; ENV-HD-3's 18 scene presets) | **36** (six robot sites × dawn, day, dusk, night, fog, rain); the 18 scene presets unchanged | `check_hd4` §4 ("exterior presets: 0 -> 36"); the page lists 36 (`hd4.lookPresets()`, drive lines) |
| fog density and wet ground per look | — | fog **0.75** (far 575 → 230 m at the site, floor 180 m), rain **0.5** with wetness **0.8** and TERRAFORM's rain; clear looks 0 / dry | `check_hd4` §4 (look table); the drive's lines (fog 13.8–230 m in the fog look) |
| site lights (high) | none | **3 meshes a map**, 440 triangles a site at West Oakland (≤ 1,200), 0 real lights, 0 texture bytes; night on, day off, dawn dimmer windows, rain brighter pools | `check_hd4` §4 |
| robot rooms with lighting | **0** | **6 of 6** (panels, a pendant over every station pad with a pool, 3 beacons, 1 task spotlight) | `check_hd4` §5 |
| hive operations room | none | **new**: high 25 meshes / 2,022 triangles / 3 lights / 18.67 MiB; balanced 21 / 1,334 / 2 / 2.42 MiB; low 20 / 954 / 1 / 2.42 MiB (stated budget 40 meshes, 6,000 / 6,000 / 3,000 triangles, 3 / 2 / 1 lights, 24 / 3 / 3 MiB); 7 consoles, 7 spots (one per role), walkable from the door to every pad and spot, 11 of 11 on each tier | `check_hd4` §6 |
| frame time on the capture machine (SwiftShader software GL, 1920 × 1080; `hd4.frameTime(12)`: the view rendered 12 times, each waiting on the GPU) | — | high → Ultra on the same views: West Oakland warehouse, night wide shot **1,490 ms → 1,424 ms** median (p90 1,744 → 1,693; 240 draw calls both; load 10.7 / 9.7); cell hall **864 ms → 894 ms** (p90 1,002 → 1,186; 25 → 27 draw calls, 2,184 → 3,588 triangles; load 14.1 / 11.5). The difference is inside the shared machine's noise; Ultra's measured cost here is texture memory (+17 MiB of facade atlas a map, +32 MiB a room) and two draw calls a room. Not a GPU frame budget | `node tools/drive_hd4_scenes.mjs 9123 high $SP/loop10/hd4 oak-west-oakland all rooms high time` (drive B) and `… oak-west-oakland night rooms ultra time rb-site-west-oakland-warehouse` (drive C) |
| page errors / external requests in the drives | — | **0 / 0** in every completed drive: B 19 captures, C 8, D 31, 0 failed (E was stopped after 2 re-shots for the earlier hand-back) | the drives' last lines (`$SP/loop10/hd4/driveB.txt` … `driveE.txt`) |
| stills at 1920 × 1080 | 0 | **51** (36 of 36 exterior presets, 7 lit rooms, 8 Ultra), every frame looked at | the drives; the table below |
| `check_hd4` | — | **118** pass | `node tools/check_hd4.mjs` |
| `check_interiors` | 925 pass | **957** pass (the ops room's style on both tiers) | `$SP/loop10/hd4/before-check_interiors.txt`; `node tools/check_interiors.mjs` |
| `check_room_skins` | 382 pass | **401** pass (the ops room takes the tile set: 26 of 26 styles) | `$SP/loop10/hd4/before-check_room_skins.txt`; `node tools/check_room_skins.mjs` |
| `check_robo_interiors` · `check_exteriors` · `check_la_rooms` · `check_classrooms` · `check_hive_world` · `check_walkable --no-browser` | 302 · 278 · 3,787 · 2,057 · — · 2,720 (ENV-HD-3's figure) | **302 · 278 · 3,787 · 2,057 · 35 · 2,720** pass | before logs in `$SP/loop10/hd4/`; each checker |
| `check_newton` · `check_imports` · `check_parse` | — | **60 checks, 0 failed · all 1,122 modules · all 2,701 modules** | each checker |
| `check_interface` | — | **OK — 21 passed, 0 failed**: touch targets at 390 × 844 186 of 186 ≥ 44 px (the Ultra button is hidden there), no horizontal scroll, no page errors on desktop or phone | `UX_PORT=9123 node tools/check_interface.mjs` (`$SP/loop10/hd4/check_interface.txt`) |

## Stills
All 1920 × 1080 JPEG (q92; the machine's disk is shared) from the built parishes page on the desktop high tier (headless
Chromium, SwiftShader), the page's buttons hidden for the still, named `<site>-wide-<look>-<time>.jpg` and
`room-<style>-lit[-ultra].jpg`, in `$SP/loop10/hd4/`. Every frame was looked at. The preset id is what
`window.__parishTest.scene(siteId, shot, look)` takes (`<siteId>:<shot>:<look>`); the rooms open through
`__parishTest.ixScene(style)` and `__parishTest.hd4.opsRoom()`.

**For the video review and the deck (the best four):**
1. `west-oakland-warehouse-wide-night-night.jpg` (`rb-site-west-oakland-warehouse:wide:night`) — the distribution warehouse
   at night: two floodlight masts, a lamp over each dock door, pools on the apron, the lit clerestory.
2. `west-oakland-port-automation-wide-fog-dawn.jpg` (`rb-site-west-oakland-port-automation:wide:fog`) — the port control
   tower and the container edge in a ground fog at dawn, the cranes fading behind, the yard's floodlights on.
3. `west-oakland-port-automation-wide-rain-dusk.jpg` (`rb-site-west-oakland-port-automation:wide:rain`) — the same yard in
   rain at dusk: streaks, puddles, the wet yard and the brighter pools, the lit cab.
4. `room-hd4-hive-ops-lit.jpg` (`__parishTest.hd4.opsRoom()`) — the Omega Hive's operations room: seven consoles in their
   agents' colours, the video wall either side of the honesty sign, pendant task lights.
For Ultra, `room-ixr-cell-hall-lit-ultra.jpg` shows the trusses and cable trays over the robot cell.

51 stills: all 36 exterior presets, the seven lit rooms on high, and the Ultra pass (the warehouse at night and the seven
rooms). The dawn and fog-at-dawn stills of San José and West Oakland (drives B and D) predate `hd4DawnSky` (their dawn sky
is the plain low-sun band); SoMa's (drive E) and Richland's and Orleans' (drive D, after the rebuild) have it. The room
stills predate the sign fit (the ops room's and the drilling deck's sign titles touch the sign's edges).

| still (`$SP/loop10/hd4/`) | preset id | look | draw calls | triangles | fog density | site lights / room | drive |
|---|---|---|---|---|---|---|---|
| `orleans-warehouse-wide-dawn-dawn.jpg` | `rb-site-orleans-warehouse:wide:dawn` | dawn | 207 | 177,193 | 0 | 0.6 | D |
| `orleans-warehouse-wide-day-day.jpg` | `rb-site-orleans-warehouse:wide:day` | day | 204 | 187,633 | 0 | 0 | D |
| `orleans-warehouse-wide-dusk-dusk.jpg` | `rb-site-orleans-warehouse:wide:dusk` | dusk | 218 | 195,363 | 0 | 0.85 | D |
| `orleans-warehouse-wide-night-night.jpg` | `rb-site-orleans-warehouse:wide:night` | night | 215 | 190,889 | 0 | 1 | D |
| `orleans-warehouse-wide-fog-dawn.jpg` | `rb-site-orleans-warehouse:wide:fog` | fog | 212 | 193,733 | 0.75 | 0.6 | D |
| `orleans-warehouse-wide-rain-dusk.jpg` | `rb-site-orleans-warehouse:wide:rain` | rain | 232 | 196,993 | 0.5 | 0.85 | D |
| `richland-drilling-robot-wide-dawn-dawn.jpg` | `rb-site-richland-drilling-robot:wide:dawn` | dawn | 172 | 108,621 | 0 | 0.6 | D |
| `richland-drilling-robot-wide-day-day.jpg` | `rb-site-richland-drilling-robot:wide:day` | day | 171 | 153,589 | 0 | 0 | D |
| `richland-drilling-robot-wide-dusk-dusk.jpg` | `rb-site-richland-drilling-robot:wide:dusk` | dusk | 176 | 155,541 | 0 | 0.85 | D |
| `richland-drilling-robot-wide-night-night.jpg` | `rb-site-richland-drilling-robot:wide:night` | night | 173 | 149,853 | 0 | 1 | D |
| `richland-drilling-robot-wide-fog-dawn.jpg` | `rb-site-richland-drilling-robot:wide:fog` | fog | 176 | 154,317 | 0.75 | 0.6 | D |
| `richland-drilling-robot-wide-rain-dusk.jpg` | `rb-site-richland-drilling-robot:wide:rain` | rain | 199 | 155,585 | 0.5 | 0.85 | D |
| `san-jose-robotics-lab-wide-dawn-dawn.jpg` | `rb-site-san-jose-robotics-lab:wide:dawn` | dawn | 185 | 176,619 | 0 | 0.6 | D |
| `san-jose-robotics-lab-wide-day-day.jpg` | `rb-site-san-jose-robotics-lab:wide:day` | day | 188 | 199,997 | 0 | 0 | D |
| `san-jose-robotics-lab-wide-dusk-dusk.jpg` | `rb-site-san-jose-robotics-lab:wide:dusk` | dusk | 189 | 215,251 | 0 | 0.85 | D |
| `san-jose-robotics-lab-wide-night-night.jpg` | `rb-site-san-jose-robotics-lab:wide:night` | night | 190 | 210,079 | 0 | 1 | D |
| `san-jose-robotics-lab-wide-fog-dawn.jpg` | `rb-site-san-jose-robotics-lab:wide:fog` | fog | 193 | 216,905 | 0.75 | 0.6 | D |
| `san-jose-robotics-lab-wide-rain-dusk.jpg` | `rb-site-san-jose-robotics-lab:wide:rain` | rain | 216 | 221,727 | 0.5 | 0.85 | D |
| `soma-robot-cell-wide-dawn-dawn.jpg` | `rb-site-soma-robot-cell:wide:dawn` | dawn | 183 | 150,255 | 0 | 0.6 | E |
| `soma-robot-cell-wide-day-day.jpg` | `rb-site-soma-robot-cell:wide:day` | day | 190 | 159,379 | 0 | 0 | D |
| `soma-robot-cell-wide-dusk-dusk.jpg` | `rb-site-soma-robot-cell:wide:dusk` | dusk | 187 | 167,539 | 0 | 0.85 | D |
| `soma-robot-cell-wide-night-night.jpg` | `rb-site-soma-robot-cell:wide:night` | night | 185 | 160,711 | 0 | 1 | D |
| `soma-robot-cell-wide-fog-dawn.jpg` | `rb-site-soma-robot-cell:wide:fog` | fog | 185 | 157,349 | 0.75 | 0.6 | E |
| `soma-robot-cell-wide-rain-dusk.jpg` | `rb-site-soma-robot-cell:wide:rain` | rain | 211 | 172,689 | 0.5 | 0.85 | D |
| `west-oakland-port-automation-wide-dawn-dawn.jpg` | `rb-site-west-oakland-port-automation:wide:dawn` | dawn | 234 | 146,685 | 0 | 0.6 | B |
| `west-oakland-port-automation-wide-day-day.jpg` | `rb-site-west-oakland-port-automation:wide:day` | day | 231 | 158,491 | 0 | 0 | B |
| `west-oakland-port-automation-wide-dusk-dusk.jpg` | `rb-site-west-oakland-port-automation:wide:dusk` | dusk | 236 | 163,865 | 0 | 0.85 | B |
| `west-oakland-port-automation-wide-night-night.jpg` | `rb-site-west-oakland-port-automation:wide:night` | night | 233 | 157,251 | 0 | 1 | B |
| `west-oakland-port-automation-wide-fog-dawn.jpg` | `rb-site-west-oakland-port-automation:wide:fog` | fog | 236 | 165,103 | 0.75 | 0.6 | B |
| `west-oakland-port-automation-wide-rain-dusk.jpg` | `rb-site-west-oakland-port-automation:wide:rain` | rain | 259 | 165,231 | 0.5 | 0.85 | B |
| `west-oakland-warehouse-wide-dawn-dawn.jpg` | `rb-site-west-oakland-warehouse:wide:dawn` | dawn | 241 | 168,295 | 0 | 0.6 | B |
| `west-oakland-warehouse-wide-day-day.jpg` | `rb-site-west-oakland-warehouse:wide:day` | day | 238 | 171,273 | 0 | 0 | B |
| `west-oakland-warehouse-wide-dusk-dusk.jpg` | `rb-site-west-oakland-warehouse:wide:dusk` | dusk | 243 | 177,071 | 0 | 0.85 | B |
| `west-oakland-warehouse-wide-night-night.jpg` | `rb-site-west-oakland-warehouse:wide:night` | night | 240 | 169,187 | 0 | 1 | B |
| `west-oakland-warehouse-wide-fog-dawn.jpg` | `rb-site-west-oakland-warehouse:wide:fog` | fog | 243 | 174,231 | 0.75 | 0.6 | B |
| `west-oakland-warehouse-wide-rain-dusk.jpg` | `rb-site-west-oakland-warehouse:wide:rain` | rain | 266 | 177,119 | 0.5 | 0.85 | B |
| `west-oakland-warehouse-wide-night-night-ultra.jpg` | `rb-site-west-oakland-warehouse:wide:night` + `?ultra=1` | night, Ultra | 240 | 163,983 | 0 | 1 | C |
| `room-ixr-cell-hall-lit.jpg` | `ixScene('ixr-cell-hall')` | lit | 25 | 2,184 | | 3 lights, 22.67 MiB | D |
| `room-ixr-cobot-lab-lit.jpg` | `ixScene('ixr-cobot-lab')` | lit | 23 | 1,748 | | 3 lights, 17.33 MiB | D |
| `room-ixr-amr-warehouse-lit.jpg` | `ixScene('ixr-amr-warehouse')` | lit | 22 | 2,716 | | 3 lights, 17.33 MiB | D |
| `room-ixr-port-control-lit.jpg` | `ixScene('ixr-port-control')` | lit | 24 | 1,320 | | 3 lights, 18.67 MiB | D |
| `room-ixr-drilling-deck-lit.jpg` | `ixScene('ixr-drilling-deck')` | lit | 23 | 1,864 | | 3 lights, 17.33 MiB | D |
| `room-ixr-maint-bay-lit.jpg` | `ixScene('ixr-maint-bay')` | lit | 22 | 2,068 | | 3 lights, 17.33 MiB | D |
| `room-hd4-hive-ops-lit.jpg` | `hd4.opsRoom()` | lit | 25 | 1,982 | | 3 lights, 18.67 MiB | D |
| `room-ixr-cell-hall-lit-ultra.jpg` | `ixScene('ixr-cell-hall')` + `?ultra=1` | lit, Ultra | 27 | 3,588 | | 3 lights, 54.67 MiB | C |
| `room-ixr-cobot-lab-lit-ultra.jpg` | `ixScene('ixr-cobot-lab')` + `?ultra=1` | lit, Ultra | 25 | 2,684 | | 3 lights, 49.33 MiB | C |
| `room-ixr-amr-warehouse-lit-ultra.jpg` | `ixScene('ixr-amr-warehouse')` + `?ultra=1` | lit, Ultra | 24 | 4,660 | | 3 lights, 49.33 MiB | C |
| `room-ixr-port-control-lit-ultra.jpg` | `ixScene('ixr-port-control')` + `?ultra=1` | lit, Ultra | 26 | 2,232 | | 3 lights, 50.67 MiB | C |
| `room-ixr-drilling-deck-lit-ultra.jpg` | `ixScene('ixr-drilling-deck')` + `?ultra=1` | lit, Ultra | 25 | 3,244 | | 3 lights, 49.33 MiB | C |
| `room-ixr-maint-bay-lit-ultra.jpg` | `ixScene('ixr-maint-bay')` + `?ultra=1` | lit, Ultra | 24 | 3,004 | | 3 lights, 49.33 MiB | C |
| `room-hd4-hive-ops-lit-ultra.jpg` | `hd4.opsRoom()` + `?ultra=1` | lit, Ultra | 25 | 1,982 | | 3 lights, 18.67 MiB | C |

## Cycles
1. Reason: an opt-in Ultra setting that can never reach the phone tier, balanced or a headset, with its budget measured, not
   estimated; proof = `check_hd4` §1–3 (the 9-case matrix, a budget line per site and per room, the phone, balanced and
   headset builds identical). Act: `hd4-ultra.js`, `fxMountExteriors({ atlasPx })` (high only), the Me-tab toggle, the
   Ultra room dresser. Observe: 113 pass, 1 FAIL — the checker's own baseline-row test (JSON.stringify drops the space after
   the colon) → read the parsed JSON instead: 115 pass. Committed with cycles 2–3 (43eb1e57).
2. Reason: six looks over the app's own clock and weather, 36 presets, site lights inside a stated budget, a wet tint;
   proof = `check_hd4` §4 (look table, presets 36, switching, budget). Act: `hd4-looks.js`, "rain" appended to the app's
   weathers, `__parishTest.scene(siteId, shot, look)`, the fog look's ground fog (floored at ATMOS's 180 m). Observe: pass
   (fog density 0.75, rain wetness 0.8 with TERRAFORM's rain on, night 1 / day 0 / dawn 0.6). The checker cannot see what
   the frames show: cycle 5.
3. Reason: lit robot rooms and the ops room inside IX_BUDGET, the phone and headset identical; proof = `check_hd4` §3, §5,
   §6 and the room checkers. Act: `hd4-rooms.js`; the `hd4-hive-ops` style, fittings and tile skin. Observe:
   `check_robo_interiors` 301 pass, 1 FAIL — it reads the app's `for (const dd of ixrDoors)` loop, which I had turned into
   a concat → the ops door has its own list and loop: 302 pass; `check_interiors` 925 → 957, `check_room_skins` 382 → 401,
   `check_la_rooms` 3,787, `check_exteriors` 278.
4. Reason: the bundle must build in one scope; proof = `python3 tools/bundle_webxr.py parishes`. Observe: refused —
   `hd4MiB` declared in two modules → `hd4OpsMiB`; `check_hd4` now proves no top-level name repeats across the three
   modules (116 pass). Committed 1e1208a5 with the capture drive.
5. Reason: the stills must read as dawn and show the lamps; proof = looking at the frames of the first drive. Observe
   (drive A): dawn drew the midday sky (sky.js knows day, dusk and night; the string "dawn" falls to day); at night the
   masts read as dark poles — the lenses faced down, away from the 16 m camera — and no pool showed (they sat at the lot's
   lowest corner, under a sloping yard). Act: dawn passes the hour 5.5 (the low-sun band); the flood heads glow, each lamp
   has a glare of three crossed additive fans, the pools follow the ground vertex by vertex. Observe (drive B): the dawn
   frame has the low sun and the glares, the night frame two lit masts and two pools; `check_hd4` 117 (site lights 440
   triangles a site). Committed dc7b7865.
6. Reason: every look at West Oakland's two robot sites and the seven lit rooms at 1920 × 1080 with page errors 0; proof =
   drive B's ok lines and looking at every frame. Act: `node tools/drive_hd4_scenes.mjs 9123 high $SP/loop10/hd4
   oak-west-oakland all rooms high time` over a rebuilt bundle. Observe: "19 captures, 0 failed, page errors 0, external
   requests 0, 739 s, load 15.08"; every frame looked at: the six looks read apart at both sites (the fog swallows the
   cranes, the rain shows streaks, puddles and brighter pools, the night yards are lit by the masts and dock lamps), and the
   ops room shows its consoles and video wall. Two faults found by eye: the floor pools round the station pads read as white
   ellipses and the beacons were a few pixels; and the ops room's sign title was clipped ("…ERATIONS ROOM (PROC…"). → pools
   half as bright and smaller, beacon domes 0.26 m (fdb2425c); the title "Hive operations room" (d43bb33b). Re-shot in
   drive D.
7. Reason: Ultra measured in the page — what it allocates and what it costs a frame against high on the same views; proof =
   drive C's lines beside drive B's. Act: the same page with `?ultra=1` (the warehouse's night shot and the seven rooms).
   Observe: "8 captures, 0 failed, page errors 0, external requests 0, 238 s, load 11.64"; the page reports Ultra on (url),
   the facade atlas 22.67 MiB allocated (5.67 MiB on high), Ultra detail 2 meshes / 4,436 triangles on the map, the rooms
   49.33–54.67 MiB with the floor and walls at 2048 px (the checker's figures, now measured in the page); frame times within
   noise of high (row above). The trusses and cable trays read clearly in the cell hall; the roof railings and plant are
   small in the 16 m wide shot (they are near-camera detail). Pass.
8. Reason: the other four maps' robot sites under the six looks (the remaining 24 presets); proof = drive D's ok lines and
   the frames. Act: `node tools/drive_hd4_scenes.mjs 9123 high $SP/loop10/hd4 sf-downtown,bay-san-jose,la-meta-richland,orleans
   all rooms high notime` (the rooms last, with the tuned pools and beacons). Observe: "31 captures, 0 failed, page errors 0,
   external requests 0, 640 s, load 5.67"; every frame looked at: the fabrication hall, the research lab among the San José
   towers (a street tree stands in front of it in the preset's framing), the construction site and the Orleans warehouse
   under all six looks; the re-shot rooms show the softer pools. Found by eye: a long first line on a room's sign ran off
   both edges (the ops room's and the drilling deck's) → `ixSignMaterial` condenses a line to the sign's width (2c99bdfc),
   re-shot in drive F.
9. Reason: dawn and dusk must read apart (drive B's frames: they differed only in the light level, both on sky.js's low-sun
   band); proof = `check_hd4` (the dome turned half round and tinted, the disc untouched) and the re-shot dawn frames. Act:
   `hd4DawnSky` called from the sky hook at dawn. Observe: `check_hd4` 118 pass; Richland's and Orleans' dawn frames (drive D,
   after the rebuild) and SoMa's (drive E) show a rose-violet dawn with the sun out of the west; drive E was stopped after
   two re-shots when the hand-back moved to 15:20, so San José's and West Oakland's dawn frames keep the plain low-sun sky.
   Committed 6bed5356.

## Seams
- **HIVE-4 (the hive console's content on the ops room's screens).** `hd4OpsScreens(room)` →
  `{ canvas, texture, cells: [{ key, agentId, role, x, y, w, h }], wall: { canvas, texture, w, h }, paint(key, painter),
  repaint() }`. `paint(agentId | role | "wall", (ctx, w, h, cell) => …)` draws into one console screen (a 512 × 256 cell on
  the desktop high tier, 128 × 64 elsewhere) or the video wall (1024 × 256, 256 × 64 elsewhere; its left half is the left
  panel) and re-uploads it. A page that wants its own content on every screen can set
  `globalThis.hd4OpsPainter = (agent, ctx, w, h, kind)` (kind "console" or "wall"; `agent` is the OH_AGENTS entry, null for
  the wall) before the room is entered; `repaint()` calls it. HIVE-4's "Omega Hive" tab lives on the instructor console (a
  different page), so the seam is the painter's shape: its card renderer (portrait, traits, voice, queue, last ten lines)
  can draw a cell, its evals table the wall. No `oh-*.js` or `aa-*.js` file was edited.
- **AVATARS-HD / HIVE-IN-WORLD (figures in the ops room).** `room.spots.agent` holds seven spots
  `{ id: "hd4-ops-<role>", name, role, x, z, yaw }` (yaw faces the video wall). `hwSyncRoom` stands figures only in `ixr-*`
  rooms today (`hwIsRobotRoom`), so the ops room stands empty; standing all seven there (one per role) is the next step.
- `hd4-ultra.js`: `HD4_ULTRA_KEY`, `HD4_ULTRA_BUDGET`, `hd4Headset(ua)`, `hd4UltraAllowed(env)`, `hd4UltraChoice({ tier,
  search, storage, env })`, `hd4SetUltra(on)`, `hd4MountUltraToggle({ host, after, state, onChange })`,
  `hd4UltraSiteDetail(THREE, layout)`, `hd4MountUltraSites({ THREE, root, layouts })`, `hd4UltraRoom({ three, group, room })`,
  `hd4UltraTextureBytes(kind)`.
- `hd4-looks.js`: `HD4_LOOKS`, `HD4_LOOK_IDS`, `HD4_SITE_LIGHTS_BUDGET`, `hd4LightLevel({ band, weather })`,
  `hd4LookFog(look, fog)`, `hd4DawnSky(skyRoot)`, `hd4LookPresets(parishes, sitesFor)`, `hd4SiteLightSpots(layout)`, `hd4WetUp(THREE, material)`,
  `hd4MountSiteLights({ THREE, root, layouts, tier, ua, glow, wet, groundAt })` → `{ set({ band, weather }), counts() }`.
- `hd4-rooms.js`: `HD4_OPS_STYLE`, `HD4_ROOM_LIGHT_BUDGET`, `HD4_ROOM_TARGETS`, `HD4_OPS_ROLES`, `HD4_OPS_BUDGET`,
  `hd4LightRoom(args)`, `hd4OpsLayout(agents)`, `hd4DressOps(args)`, `hd4OpsScreens(room)`, `hd4OpsHome()`,
  `hd4OpsSite(rbSite, parish)`, `hd4OpsDoor({ doors, homeSite, blocked, colliders })`, `hd4RegisterDressers(ix, { ultra })`.
- `fx-exteriors.js`: `fxMountExteriors({ …, atlasPx })` and `fxBuildSite(THREE, layout, tier, { atlasPx })` (high tier only).
- `ix-interiors.js`: the `hd4-hive-ops` style and its fittings; `hd2-room-skins.js`: its tile skin entry.
- The app: `NP_WEATHERS` + "rain"; dawn's sky hour 5.5 and `hd4DawnSky(sky.root)`; `__parishTest.scene(siteId, shot, look)`;
  `__parishTest.hd4 = { ultra, looks, lookPresets(), applyLook(look), sites(), ultraSites(), exteriors(), opsDoors, opsRoom(),
  screens(), measure(), frameTime(n) }`.
- The committed `WebXR/parishes/dist/parishes.html` was rebuilt for the drives and restored; the coordinator's integration
  rebuild carries these changes.

## Left
- **The ops room's screens show placeholders** until the hive console's content is painted into them through the seam
  (`hd4OpsScreens(room).paint` or `globalThis.hd4OpsPainter`); nothing of HIVE-4's was imported or edited here.
- **No figures stand in the ops room**: HIVE-IN-WORLD's `hwSyncRoom` stands agents only in `ixr-*` rooms; the seven spots
  are ready (one per role, facing the wall).
- **Ultra's frame time is a software-renderer figure**: the capture machine renders with SwiftShader on four shared cores
  (load 8–12 during the drives), so the figures compare Ultra with high on the same view and machine; they are not a GPU
  frame budget. A desktop-GPU measurement (`__parishTest.hd4.frameTime(30)`) is the next step.
- **The site lights are counted in their own budget** (3 meshes, 3 draw calls a map on the high tier), not in FC_BUDGET's
  per-chunk count: they are merged across the map's robot sites, but if they were counted in the site's chunk the worst
  robot-site chunk on high would read 5 + 3 against FC_BUDGET's 6. Folding the lamp heads into the masts' mesh (an emissive
  vertex attribute) would make it 2.
- **Balanced gets no site lights or room lighting** (the brief keeps high-detail work on the high tier or an opt-in
  setting); a cheaper kit for balanced could follow. The phone and headset tiers build exactly what they built before.
- **Dawn borrows sky.js's low-sun band**: the app turns that dome half round (the sun in the east) and tints it rose-violet
  (`hd4DawnSky`), but the light on the buildings is dusk's (the sun light's direction and colour are the app's own and were
  not changed); a true "dawn" band in sky.js's `SKY_TIME` would be cleaner, and sky.js is shared with other worlds.
- **Stills not re-shot after the last two fixes** (the hand-back moved to 15:20): San José's and West Oakland's dawn and
  fog-at-dawn frames predate `hd4DawnSky`, and the room frames predate the sign fit (the ops room's and the drilling deck's
  sign titles touch the sign's edges). `node tools/drive_hd4_scenes.mjs 9123 high <dir> bay-san-jose,oak-west-oakland
  dawn,fog rooms high notime` after `python3 tools/bundle_webxr.py parishes` re-shoots both (about 8 minutes).
- **Not run here** (the shared machine): `check_mobile` (drives the dist pages and rewrites `docs/perf/phone-maps.json`),
  `check_walkable`'s browser leg, `eval_worlds`. The phone tier is proven unchanged by `check_hd4` §3 (robot rooms
  identical on the phone tier, balanced and a headset browser; no site lights there; Ultra never offered there).
- `check_hd4`'s row in `docs/perf/checkers-baseline.json` is an estimate (to re-measure on a quiet gate).
