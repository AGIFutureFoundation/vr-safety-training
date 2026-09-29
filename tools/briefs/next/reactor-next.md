# REACTOR — next

1. Rebaseline `check_reactor.mjs` on a quiet machine (the recorded 35.8 s and docs/perf/reactor.json were taken at load
   ~32 on four cores, so the frame and boot budgets were reported, not judged). If a streaming step then misses the 50 ms
   frame, the next fix is a per-chunk height grid for the collider/physics consumers (bilinear, with the error bound
   proved against `npHeightAt` in the checker) — the terrain mesh itself must keep sampling the exact field.
2. `npPointInPoly` on the river strips is now the largest self time after GC: a per-parish coarse cell grid of water
   polygons (in / out / edge cells, exact test only on edge cells) keeps answers exact.
3. Downtown, Mission and Golden Gate Park stay at 97: their districts carry field lessons (4, 3, 3) but no play-layer
   module lists them. Add them to `sg-sf-play.js` (needs a `station` per lesson, five per district for check_k12, and a
   treasure regeneration via `tools/gen_treasures.mjs`).
4. three.js `setValues` (material construction per build) was 5.5 % of a build: share materials across chunk rebuilds.
