# MENAGERIE — console memory

Short, durable lessons for the next team at this console. Read `docs/consoles/MENAGERIE.md` for the plan and seams.

## Conventions
- **`mg-life.js` is pure** (three.js passed in as `three`), so `tools/check_menagerie.mjs` imports it straight and builds on
  the vendored `WebXR/vendor/three/dist/three.module.min.js` — no CDN rewrite needed (unlike kw-kits.js).
- **Plan, then step**: `mgPlan(map)` is the whole placement (deterministic from the map id, `npRng`), `mgStep(agent, ctx, dt)`
  the whole behaviour. The mount only bakes one InstancedMesh per kind (+ one for heads) and writes matrices.
- **Two adapters**: `mgParishMap(parish)` (np-parish's `npCoverAt` / `npWaterAt` / `npDistrictAt`) and `mgBayMap(...)`
  (Bay World's `BAY_ROADS`, `bayZoneAt`, `bayRoadAt`, `txWaterTopAt`, `BAY_BOUNDS`). The Bay World bundle now carries
  `np-parish.js` because mg-life imports it (pure; no name clashes with bw*/bay*/tx*).
- **Planning cost**: Orleans and Plaquemines take ~300 ms at mount (long roads, npCoverAt per sample). The night switch
  (T) re-plans; if that stutters on a phone, cache the day and night plans.
- **Flee is honoured by construction**: an animal flees until 1.15 × its radius, holds (wary) while the avatar is within
  1.5 ×, and a step home never re-enters the radius. The checker tracks the flock's peak lift, not its end lift.
- **Seams through globalThis**: the parishes app reads `globalThis.cwSidewalkAt` / `cwColliders` / `nwVehiclePositions`.
  In the bundle, module-scope functions are not globals — the coordinator's merge should import CITYWORKS's functions
  into `WebXR/parishes/js/app.js` and pass them in `mgRemount()` (one line each).
- **Worktree Bash** refuses multi-line python heredocs and compound commands: use the Edit/Write tools and plain commands.
