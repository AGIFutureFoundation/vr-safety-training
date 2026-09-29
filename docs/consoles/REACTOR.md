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
   `tfWaterDepthAt` 184.4 → 95.1 µs (−48 %); orleans 19.9 → 5.7 µs, plaquemines 27.1 → 16.5 µs.

## Seams

None new: the engine's exports keep their shapes; `npPolyDist(x, z, pts) -> metres` is added to `np-parish.js` for any
module that needs a distance without the along-line fraction.
