# REACTOR — the platform optimiser (console `rx`, the reactor loop)

Brief: `packs-brief-3.md` (section REACTOR). Prefix `rx`, port 8978. Eval tables: `docs/evals/reactor.md`.

Timing on this machine is shared with other consoles (load average 16–35 on four cores during this run), so every figure
here is a back-to-back A/B in one sitting — the base tree at 039f09e against this tree, alternating, median of three
rounds — never a comparison across sittings. Checksums (4 000 seeded samples of `npHeightAt` and `tfWaterDepthAt` per map)
prove the outputs did not move.

## Profile (039f09e, headless, `node --cpu-prof` over a high-tier build of all ten maps)

Self time: garbage collector 37 %, `npPolyDistance` 24 %, three.js `setValues` 5.5 %, `npHeightAt` 3.6 %, `tfNearest` 3.3 %,
`npPointInPoly` 2.9 %. `npPolyDistance` was called from `npHeightAt` once per river (natural levee), once per levee, once
per water-edge *segment* (allocating a two-point array and a result object each time), and once per road from `npCoverAt`;
TERRAFORM's channel cut called `tfNearest` (which re-measures the polyline's length and allocates) per ribbon and stream.
`cwColliders` is already cheap (0.2–0.4 µs per chunk, cached) and `npWaterAt` is 1–7 µs.

## Cycles

1. Reason: distance-only, allocation-free polyline distance (`npPolyDist`, `npSegDist`) plus a cached-box reject for
   levees and rivers, used wherever only `d` is read (np-parish.js, tf-terraform.js) — check: bench checksums identical and
   µs/call down. Observed: all ten maps identical; `npHeightAt` summed over the maps 148.8 → 70.6 µs (−53 %),
   `tfWaterDepthAt` 184.4 → 95.1 µs (−48 %); orleans 19.9 → 5.7 µs, plaquemines 27.1 → 16.5 µs. check_terraform
   66670 checks 0 failed; check_parishes 12920 passed 0 failed. Committed.
2. Reason: the SF districts sit at 97 because the eval counts only SECONDLINE's `slLessonsFor`; GOLDEN-B's `sg-sf-play.js`
   is the SF half of the play layer (its lessons feed the parishes page's lesson finds and treasures) — read both.
   Check: eval subject scores. Observed (mid-run eval): Marina 97 → 100, Bayview 97 → 100, mean 98 → 99. Downtown,
   Mission and Golden Gate Park stay 97: no play-layer module lists their lessons (next brief, item 3).
3. Reason: a terrain vertex asks `npWaterAt` and `npLeveeRise` for the same point twice (height, then cover colour) —
   one-entry memos. Check: chunk-vertex checksum identical, ms per streamed chunk down. Observed (A/B vs cycle 1, median
   of three): identical on all ten maps; ms per chunk summed 41.7 → 24.8 (−41 %); check_terraform and check_parishes pass.
4. Reason: a checker for the profile — `tools/check_reactor.mjs`. Check: exactness lines always judged, timings judged
   only when quiet. Observed: 30 passed, 0 failed, "not judged: contended" (load 31.6 → 32.9); docs/perf/reactor.json
   written; listed in check_all and the checkers baseline; check_proving 161 checks pass; check_imports clean.
5. Reason: `npCoverAt` measures every road per vertex; only a road nearer than the widest half-width can make a point
   "road", so boxes beyond that reach are skipped (the nearest-road rule unchanged). Check: checksums identical, chunk ms.
   Observed (A/B vs cycle 3, median of three): identical on all ten maps; ms per chunk summed 21.9 → 16.4 (−25 %), boot
   summed 2791 → 2198 ms; check_parishes 12920 passed, check_terraform 66670 checks 0 failed, check_cityworks 2741 checks
   0 failed.

**Cumulative (A/B 039f09e vs cycle 5, median of three, one sitting):** high-tier boot summed over the ten maps
4499 → 1778 ms (−60 %), ms per streamed chunk summed 45.5 → 13.4 (−70 %); meshes 1339 and triangles 449 472 unchanged,
chunk-vertex checksums identical on every map. No budget moved (same geometry), so check_mobile / check_fleet /
check_budget figures are unchanged by construction.

## Seams

None new: the engine's exports keep their shapes; `npPolyDist(x, z, pts) -> metres` is added to `np-parish.js` for any
module that needs a distance without the along-line fraction.
