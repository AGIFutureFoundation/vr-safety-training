# REDWOOD-3 — console memory

Read `docs/consoles/memory/REDWOOD.md` and `REDWOOD-2.md` first; this file adds the phase-three lessons.

## Conventions added
- **Understory is a pure layout.** `rwChunkUnderstory(cx, cz, tier)` in `rw-world.js` returns `{ ferns, fronds, logs, stumps, shafts }`
  from the same seeded noise the chunk is drawn from; `buildChunk` draws it and `blocked()` reads the logs (an oriented rectangle,
  `rwUnderstoryBlocked`) and stumps (a disc) from it — so a log blocks whether or not its chunk is built. Scales live in
  `RW_UNDERSTORY_SCALE`; change a drawn scale there and the collider follows.
- **Three levels of detail per chunk, no rebuilds.** Every chunk holds a `near` group (full trees, understory) and a `far` group
  (impostor trees — a 3-sided open trunk under a 4-sided open cone, 10 triangles — and a half-segment ground). `stream()` sets the
  level by Chebyshev ring from the player's chunk: rings 0–1 `near`, ring 2 `mid` (the dense fern set hidden), ring 3 `far`. Both
  groups are built once, so a chunk crossing a ring toggles visibility and never hitches. Ring 3 sits 640–900 m out, past the fog
  near plane (215 m on high), so the walking view is unchanged.
- **Tree geometry is open-ended** where a cap is hidden (trunk base under the ground, trunk top inside the crown, the redwood's upper
  cone base inside the lower cone): 33/38/30 triangles instead of 52/48/40 for the same silhouette. The fir's upper cone keeps its
  base — it sticks out below the lower crown and is seen from the ground.
- `stats()` reports `farChunks`, `drawnInstances`, `logs`, `stumps`; the app's `__redwoodTest.stats()` adds `renderer.info.render`.

## Measuring here (headless SwiftShader, relative only; load average 13–16 on four cores)
- `$SP/holodeck/redwood-3/probe.mjs <cfg.json>`: serves the worktree on 8991, asserts the site and understory colliders, reads
  `renderer.info.render.triangles` at four fixed views, times a 20 s vehicle drive, captures stills. The baseline page is the previous
  commit's bundle written to `WebXR/redwood/dist/redwood-base.html` (untracked; delete after).
- The renderer's triangle count is per rendered frame after frustum culling, so it depends on the yaw; compare the same views.

## Numbers (high tier, 1280×720, before → after)
- Triangles per view: fire station facing north 445,797 → 235,500; sawmill 388,336 → 203,766; grove 333,896 → 182,214; Mill Road
  508,193 → 275,091 (every view under 300k; the worst was PROVING's 479k). Draw calls 230 → 181 at the fire station.
- 20 s Mill Road drive: mean frame 2022 → 1359 ms, mean triangles 506k → 274k. 49 chunks, 24 of them far; 8,330 tree instances in the
  layouts, 17.3k instances drawn (was 38k in PROVING's view).
- Low tier (390×844, radius 2 so no far ring): drive mean 141 ms / median 133 ms (REDWOOD-2: 150 / 133), 48–57k triangles per view.
- Colliders: 490 logs and 490 stumps in the high ring all block at their centre; every arrival, activity start and board spot stays clear.
