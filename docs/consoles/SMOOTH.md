# Console SMOOTH

- Console: SMOOTH (loop 3, prefix `sm2`, port 9022)
- Brief: `$SP/loop3/brief.md` (section SMOOTH), under the shared rules of `$SP/packs/packs-brief.md` and the reactor loop of
  `$SP/packs/packs-brief-3.md`
- Base: 684be2fb (46 maps in 10 regions). Builds on DETAIL (`docs/consoles/DETAIL.md`) and DETAIL-2 (`DETAIL-2.md`).

## What it does
1. **Generation off the frame.** `dtDetailSteps(parish, cx, cz, tier, { ring, spots, slice })` in
   `WebXR/shared/dt-detail.js` is the chunk generator as a resumable generator. `dtDetailForChunk` runs the same code to
   the end with no slice, so there is one generator, not two. With `slice = { deadline, clock? }` it reads the clock at
   checkpoints: every height-grid sample, every cover cell, and every 16 candidates or road samples. Once the clock
   passes the deadline it yields and later resumes where it stopped. Yielding draws no random numbers, so the output
   is the same bit for bit.
2. **A time-sliced pool.** `dtMountDetail` no longer generates inside `chunkLoaded`. It queues the chunk, and the
   `streamed` hook (once per engine update, which is once a frame in the app) calls `frame()`. `frame()` continues the
   refill and then generates queued chunks until `DT_BUDGET.frameMs[tier]` is spent: **3 ms at high and balanced,
   2 ms on the phone (low)**. The deadline sits 0.25 ms inside the budget.
   - The refill is sliced by family: each InstancedMesh is replaced whole, so no frame shows half a family.
   - The chunk map keeps load order (a finished chunk fills the slot it was queued in), so once the queue is empty the
     pool holds exactly what the one-shot fill held.
   - `drain()` finishes the queue at once. The checkers and tests use it; fast travel does not, and its detail fills
     in over the next frames.
   - `frameMs: Infinity` is the old one-shot behaviour.
   - `clock` can be injected (a virtual clock is used in the proof).
   - `stats()` adds `pending`, `frameMs`, `frameMedianMs`, `frameWorstMs`, `stepWorstMs`, `flushWorstMs` and `slices`.
   - `capacityOk()` reports whether every family is within its capacity.
3. **Scratch buffers reused.** Each generation borrows a set of per-family buffers from a free list and returns
   exact-size copies. Before, every chunk allocated ~1.2 MB of fresh `Float32Array`s. The table loop also indexes
   instead of destructuring.
4. **One stream step a frame.** A merge had left LANDMARKS-2's unguarded `world.update(np.x, np.z, 2)` and
   `cwStreetsMount.update(...)` pair above the guarded one in `WebXR/parishes/js/app.js`. So every frame streamed
   twice: up to four chunk builds and two detail budgets a frame, and it streamed inside walk-in rooms too. The
   unguarded pair is gone, and check_detail checks there is exactly one.
5. **The phone pass on the Louisiana maps.** `tools/check_mobile.mjs` opens every map in the Louisiana regions
   (louisiana-sites, louisiana-cities, new-orleans-districts: 21 maps) in the parishes page at 360×640 on the phone
   context. It checks:
   - the low tier and no page error;
   - meshes, triangles and rendered draw calls within NP_BUDGET;
   - the detail pool within `DT_BUDGET.triangles.low`, and its median frame within `DT_BUDGET.frameMs.low`;
   - that frames keep coming.

   Frame times are recorded to `docs/perf/phone-maps.json` (SwiftShader, relative). Run
   `TC_ONLY=maps node tools/check_mobile.mjs` for the maps alone, or set `TC_MAPS=0` to skip them.

## Seams
- `dtDetailSteps(parish, cx, cz, tier, { ring, spots, tally, slice: { deadline, clock? } })`: a generator whose return
  value is `dtDetailForChunk`'s.
- `dtMountDetail(root, THREE, parish, { tier, hooks, frameMs, clock })` returns
  `{ frame(), drain(), flush(), stats(), capacityOk(), dispose(), meshes, group }`.
- `DT_BUDGET.frameMs = { high: 3, balanced: 3, low: 2 }`.
- `window.__parishTest.detail` is the parishes app's pool.

## Results
(filled from the checkers' final runs below)

## Cycles

## Left
